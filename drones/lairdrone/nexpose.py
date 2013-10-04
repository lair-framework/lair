#!/usr/bin/env python
# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

import xml.etree.ElementTree as et
import os
import sys
import re
import copy
sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..'))
)
from lairdrone import drone_models as models
from lairdrone import helper
from lairdrone.exceptions import IncompatibleDataVersionError

OS_WEIGHT = 75
TOOL = "nexpose"


def parse(project, nexpose_file, include_informational=False):
    """Parses a Nexpose XMLv2 file and updates the Lair database

    :param project: The project id
    :param nexpose_file: The Nexpose xml file to be parsed
    :include_informational: Whether to include info findings in data. Default False
    """

    cve_pattern = re.compile(r'(CVE-|CAN-)')
    html_tag_pattern = re.compile(r'<.*?>')
    white_space_pattern = re.compile(r'\s+', re.MULTILINE)

    # Used to create unique notes in DB
    note_id = 1

    tree = et.parse(nexpose_file)
    root = tree.getroot()
    if root is None or \
            root.tag != "NexposeReport" or \
            root.attrib['version'] != "2.0":
        raise IncompatibleDataVersionError("Nexpose XML 2.0")

    # Create the project dictionary which acts as foundation of document
    project_dict = dict(models.project_model)
    project_dict['commands'] = list()
    project_dict['vulnerabilities'] = list()
    project_dict['project_id'] = project
    project_dict['commands'].append({'tool': TOOL, 'command': 'scan'})

    # Used to maintain a running list of host:port vulnerabilities by plugin
    vuln_host_map = dict()

    for vuln in root.iter('vulnerability'):
        v = copy.deepcopy(models.vulnerability_model)
        v['cves'] = list()
        v['plugin_ids'] = list()
        v['identified_by'] = list()
        v['hosts'] = list()

        v['cvss'] = float(vuln.attrib['cvssScore'])
        v['title'] = vuln.attrib['title']
        plugin_id = vuln.attrib['id'].lower()

        # Set plugin id
        plugin_dict = dict(models.plugin_id_model)
        plugin_dict['tool'] = TOOL
        plugin_dict['id'] = plugin_id
        v['plugin_ids'].append(plugin_dict)

        # Set identified by information
        identified_dict = dict(models.identified_by_model)
        identified_dict['tool'] = TOOL
        identified_dict['id'] = plugin_id
        v['identified_by'].append(identified_dict)

        # Search for exploits
        for exploit in vuln.iter('exploit'):
            v['flag'] = True
            note_dict = copy.deepcopy(models.note_model)
            note_dict['title'] = "{0} ({1})".format(
                exploit.attrib['type'],
                exploit.attrib['id']
            )
            note_dict['content'] = "{0}\n{1}".format(
                exploit.attrib['title'],
                exploit.attrib['link']
            )
            note_dict['last_modified_by'] = TOOL
            v['notes'].append(note_dict)

        # Search for CVE references
        for reference in vuln.iter('reference'):
            if reference.attrib['source'] == 'CVE':
                cve = cve_pattern.sub('', reference.text)
                v['cves'].append(cve)

        # Search for solution
        solution = vuln.find('solution')
        if solution is not None:
            for text in solution.itertext():
                s = text.encode('ascii', 'replace').strip()
                v['solution'] += white_space_pattern.sub(" ", s)

        # Search for description
        description = vuln.find('description')
        if description is not None:
            for text in description.itertext():
                s = text.encode('ascii', 'replace').strip()
                v['description'] += white_space_pattern.sub(" ", s)

        # Build mapping of plugin-id to host to vuln dictionary
        vuln_host_map[plugin_id] = dict()
        vuln_host_map[plugin_id]['vuln'] = v
        vuln_host_map[plugin_id]['hosts'] = set()

    for node in root.iter('node'):

        host_dict = dict(models.host_model)
        host_dict['os'] = list()
        host_dict['ports'] = list()
        host_dict['hostnames'] = list()

        # Set host status
        if node.attrib['status'] != 'alive':
            host_dict['alive'] = False

        # Set IP address
        host_dict['string_addr'] = node.attrib['address']
        host_dict['long_addr'] = helper.ip2long(node.attrib['address'])

        # Set the OS fingerprint
        certainty = 0
        for os in node.iter('os'):
            if float(os.attrib['certainty']) > certainty:
                certainty = float(os.attrib['certainty'])
                os_dict = dict(models.os_model)
                os_dict['tool'] = TOOL
                os_dict['weight'] = OS_WEIGHT

                fingerprint = ''
                if 'vendor' in os.attrib:
                    fingerprint += os.attrib['vendor'] + " "

                # Make an extra check to limit duplication of data in the
                # event that the product name was already in the vendor name
                if 'product' in os.attrib and \
                        os.attrib['product'] not in fingerprint:
                    fingerprint += os.attrib['product'] + " "

                fingerprint = fingerprint.strip()
                os_dict['fingerprint'] = fingerprint

                host_dict['os'] = list()
                host_dict['os'].append(os_dict)

        # Test for general, non-port related vulnerabilities
        # Add them as tcp, port 0
        tests = node.find('tests')
        if tests is not None:
            port_dict = dict(models.port_model)
            port_dict['service'] = "general"

            for test in tests.findall('test'):
                # vulnerable-since attribute is used to flag
                # confirmed vulns
                if 'vulnerable-since' in test.attrib:
                    plugin_id = test.attrib['id'].lower()

                    # This is used to track evidence for the host/port
                    # and plugin
                    h = "{0}:{1}:{2}".format(
                        host_dict['string_addr'],
                        "0",
                        models.PROTOCOL_TCP
                    )
                    vuln_host_map[plugin_id]['hosts'].add(h)

            host_dict['ports'].append(port_dict)

        # Use the endpoint elements to populate port data
        for endpoint in node.iter('endpoint'):
            port_dict = copy.deepcopy(models.port_model)
            port_dict['port'] = int(endpoint.attrib['port'])
            port_dict['protocol'] = endpoint.attrib['protocol']
            if endpoint.attrib['status'] != 'open':
                port_dict['alive'] = False

            # Use the service elements to identify service
            for service in endpoint.iter('service'):

                # Ignore unknown services
                if 'unknown' not in service.attrib['name'].lower():
                    if not port_dict['service']:
                        port_dict['service'] = service.attrib['name'].lower()

                # Use the test elements to identify vulnerabilities for
                # the host
                for test in service.iter('test'):
                    # vulnerable-since attribute is used to flag
                    # confirmed vulns
                    if 'vulnerable-since' in test.attrib:
                        plugin_id = test.attrib['id'].lower()

                        # Add service notes for evidence
                        note_dict = copy.deepcopy(models.note_model)
                        note_dict['title'] = "{0} (ID{1})".format(plugin_id,
                                                              str(note_id))
                        for evidence in test.iter():
                            if evidence.text:
                                for line in evidence.text.split("\n"):
                                    line = line.strip()
                                    if line:
                                        note_dict['content'] += "    " + \
                                                                line + "\n"
                            elif evidence.tag == "URLLink":
                                note_dict['content'] += "    "
                                note_dict['content'] += evidence.attrib[
                                                            'LinkURL'
                                                        ] + "\n"

                        note_dict['last_modified_by'] = TOOL
                        port_dict['notes'].append(note_dict)
                        note_id += 1

                        # This is used to track evidence for the host/port
                        # and plugin
                        h = "{0}:{1}:{2}".format(
                            host_dict['string_addr'],
                            str(port_dict['port']),
                            port_dict['protocol']
                        )
                        vuln_host_map[plugin_id]['hosts'].add(h)

            # Use the fingerprint elements to identify product
            certainty = 0
            for fingerprint in endpoint.iter('fingerprint'):
                if float(fingerprint.attrib['certainty']) > certainty:
                    certainty = float(fingerprint.attrib['certainty'])
                    prod = ''
                    if 'vendor' in fingerprint.attrib:
                        prod += fingerprint.attrib['vendor'] + " "

                    if 'product' in fingerprint.attrib:
                        prod += fingerprint.attrib['product'] + " "

                    if 'version' in fingerprint.attrib:
                        prod += fingerprint.attrib['version'] + " "

                    prod = prod.strip()
                    port_dict['product'] = prod

            host_dict['ports'].append(port_dict)

        project_dict['hosts'].append(host_dict)

    # This code block uses the plugin/host/vuln mapping to associate
    # all vulnerable hosts to their vulnerability data within the
    # context of the expected Lair schema structure.
    for plugin_id, data in vuln_host_map.items():

        # Build list of host and ports affected by vulnerability and
        # assign that list to the vulnerability model
        for key in data['hosts']:
            (string_addr, port, protocol) = key.split(':')

            host_key_dict = dict(models.host_key_model)
            host_key_dict['string_addr'] = string_addr
            host_key_dict['port'] = int(port)
            host_key_dict['protocol'] = protocol
            data['vuln']['hosts'].append(host_key_dict)

        # By default, don't include informational findings unless
        # explicitly told to do so.
        if data['vuln']['cvss'] == 0 and not include_informational:
            continue

        project_dict['vulnerabilities'].append(data['vuln'])

    return project_dict