#!/usr/bin/env python
# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

import xml.etree.ElementTree as et
import re
import copy
from lairdrone import drone_models as models
from lairdrone import helper

OS_WEIGHT = 75
TOOL = "nessus"


def parse(project, nessus_file, include_informational=False, min_note_sev=2):
    """Parses a Nessus XMLv2 file and updates the Hive database

    :param project: The project id
    :param nessus_file: The Nessus xml file to be parsed
    :param include_informational: Whether to include info findings in data. Default False
    :min_note_sev: The minimum severity of notes that will be saved. Default 2
    """

    cve_pattern = re.compile(r'(CVE-|CAN-)')
    false_udp_pattern = re.compile(r'.*\?$')

    tree = et.parse(nessus_file)
    root = tree.getroot()
    note_id = 1

    # Create the project dictionary which acts as foundation of document
    project_dict = dict(models.project_model)
    project_dict['commands'] = list()
    project_dict['vulnerabilities'] = list()
    project_dict['project_id'] = project

    # Used to maintain a running list of host:port vulnerabilities by plugin
    vuln_host_map = dict()

    for host in root.iter('ReportHost'):

        temp_ip = host.attrib['name']

        host_dict = dict(models.host_model)
        host_dict['os'] = list()
        host_dict['ports'] = list()
        host_dict['hostnames'] = list()

        # Tags contain host-specific information
        for tag in host.iter('tag'):

            # Operating system tag
            if tag.attrib['name'] == 'operating-system':
                os_dict = dict(models.os_model)
                os_dict['tool'] = TOOL
                os_dict['weight'] = OS_WEIGHT
                os_dict['fingerprint'] = tag.text
                host_dict['os'].append(os_dict)

            # IP address tag
            if tag.attrib['name'] == 'host-ip':
                host_dict['string_addr'] = tag.text
                host_dict['long_addr'] = helper.ip2long(tag.text)

            # MAC address tag
            if tag.attrib['name'] == 'mac-address':
                host_dict['mac_addr'] = tag.text

            # Hostname tag
            if tag.attrib['name'] == 'host-fqdn':
                host_dict['hostnames'].append(tag.text)

            # NetBIOS name tag
            if tag.attrib['name'] == 'netbios-name':
                host_dict['hostnames'].append(tag.text)

        # Track the unique port/protocol combos for a host so we don't
        # add duplicate entries
        ports_processed = dict()

        # Process each 'ReportItem'
        for item in host.findall('ReportItem'):
            plugin_id = item.attrib['pluginID']
            plugin_family = item.attrib['pluginFamily']
            severity = int(item.attrib['severity'])
            title = item.attrib['pluginName']

            port = int(item.attrib['port'])
            protocol = item.attrib['protocol']
            service = item.attrib['svc_name']
            evidence = item.find('plugin_output')

            # Ignore false positive UDP services
            if protocol == "udp" and false_udp_pattern.match(service):
                continue

            # Create a port model and temporarily store it in the dict
            # for tracking purposes. The ports_processed dict is used
            # later to add ports to the host so that no duplicates are
            # present. This is necessary due to the format of the Nessus
            # XML files.
            if '{0}:{1}'.format(port, protocol) not in ports_processed:
                port_dict = copy.deepcopy(models.port_model)
                port_dict['port'] = port
                port_dict['protocol'] = protocol
                port_dict['service'] = service
                ports_processed['{0}:{1}'.format(port, protocol)] = port_dict

            # Set the evidence as a port note if it exists
            if evidence is not None and \
                    severity >= min_note_sev and \
                    plugin_family != 'Port scanners' and \
                    plugin_family != 'Service detection':
                note_dict = copy.deepcopy(models.note_model)
                note_dict['title'] = "{0} (ID{1})".format(title, str(note_id))
                e = evidence.text.strip()
                for line in e.split("\n"):
                    line = line.strip()
                    if line:
                        note_dict['content'] += "    " + line + "\n"
                note_dict['last_modified_by'] = TOOL
                ports_processed['{0}:{1}'.format(port, protocol)]['notes'].append(note_dict)
                note_id += 1

            # This plugin is general scan info...use it for 'command' element
            if plugin_id == '19506':

                command = item.find('plugin_output')

                command_dict = dict(models.command_model)
                command_dict['tool'] = TOOL

                if command is not None:
                    command_dict['command'] = command.text

                if not project_dict['commands']:
                    project_dict['commands'].append(command_dict)

                continue

            # Check if this vulnerability has been seen in this file for
            # another host. If not, create a new vulnerability_model and
            # maintain a mapping between plugin-id and vulnerability as
            # well as a mapping between plugin-id and host. These mappings
            # are later used to completed the Hive schema such that host
            # IP and port information are embedded within each vulnerability
            # while ensuring no duplicate data exists.
            if plugin_id not in vuln_host_map:

                v = copy.deepcopy(models.vulnerability_model)
                v['cves'] = list()
                v['plugin_ids'] = list()
                v['identified_by'] = list()
                v['hosts'] = list()

                # Set the title
                v['title'] = title

                # Set the description
                description = item.find('description')
                if description is not None:
                    v['description'] = description.text

                # Set the solution
                solution = item.find('solution')
                if solution is not None:
                    v['solution'] = solution.text

                # Set the evidence
                if evidence is not None:
                    v['evidence'] = evidence.text

                # Set the vulnerability flag if exploit exists
                exploit = item.find('exploit_available')
                if exploit is not None:
                    v['flag'] = exploit.text == 'true'

                    # Grab Metasploit details
                    exploit_detail = item.find('exploit_framework_metasploit')
                    if exploit_detail is not None and \
                            exploit_detail.text == 'true':
                        note_dict = copy.deepcopy(models.note_model)
                        note_dict['title'] = 'Metasploit Exploit'
                        note_dict['content'] = 'Exploit exists. Details unknown.'
                        module = item.find('metasploit_name')
                        if module is not None:
                            note_dict['content'] = module.text
                        note_dict['last_modified_by'] = TOOL
                        v['notes'].append(note_dict)

                    # Grab Canvas details
                    exploit_detail = item.find('exploit_framework_canvas')
                    if exploit_detail is not None and \
                            exploit_detail.text == 'true':
                        note_dict = copy.deepcopy(models.note_model)
                        note_dict['title'] = 'Canvas Exploit'
                        note_dict['content'] = 'Exploit exists. Details unknown.'
                        module = item.find('canvas_package')
                        if module is not None:
                            note_dict['content'] = module.text
                        note_dict['last_modified_by'] = TOOL
                        v['notes'].append(note_dict)

                    # Grab Core Impact details
                    exploit_detail = item.find('exploit_framework_core')
                    if exploit_detail is not None and \
                            exploit_detail.text == 'true':
                        note_dict = copy.deepcopy(models.note_model)
                        note_dict['title'] = 'Core Impact Exploit'
                        note_dict['content'] = 'Exploit exists. Details unknown.'
                        module = item.find('core_name')
                        if module is not None:
                            note_dict['content'] = module.text
                        note_dict['last_modified_by'] = TOOL
                        v['notes'].append(note_dict)

                    # Grab ExploitHub SKUs
                    exploit_detail = item.find('exploit_framework_exploithub')
                    if exploit_detail is not None and \
                            exploit_detail.text == 'true':
                        note_dict = copy.deepcopy(models.note_model)
                        note_dict['title'] = 'Exploit Hub Exploit'
                        note_dict['content'] = 'Exploit exists. Details unknown.'
                        module = item.find('exploithub_sku')
                        if module is not None:
                            note_dict['content'] = module.text
                        note_dict['last_modified_by'] = TOOL
                        v['notes'].append(note_dict)

                    # Grab any and all ExploitDB IDs
                    details = item.iter('edb-id')
                    if details is not None:
                        for module in details:
                            note_dict = copy.deepcopy(models.note_model)
                            note_dict['title'] = 'Exploit-DB Exploit ' \
                                                 '({0})'.format(module.text)
                            note_dict['content'] = module.text
                            note_dict['last_modified_by'] = TOOL
                            v['notes'].append(note_dict)

                # Set the CVSS score
                cvss = item.find('cvss_base_score')
                if cvss is not None:
                    v['cvss'] = float(cvss.text)
                else:
                    risk_factor = item.find('risk_factor')
                    if risk_factor is not None:
                        rf = risk_factor.text
                        if rf == "Low":
                            v['cvss'] = 3.0
                        elif rf == "Medium":
                            v['cvss'] = 5.0
                        elif rf == "High":
                            v['cvss'] = 7.5
                        elif rf == "Critical":
                            v['cvss'] = 10.0

                # Set the CVE(s)
                for cve in item.findall('cve'):
                    c = cve_pattern.sub('', cve.text)
                    v['cves'].append(c)

                # Set the plugin information
                plugin_dict = dict(models.plugin_id_model)
                plugin_dict['tool'] = TOOL
                plugin_dict['id'] = plugin_id
                v['plugin_ids'].append(plugin_dict)

                # Set the identified by information
                identified_dict = dict(models.identified_by_model)
                identified_dict['tool'] = TOOL
                identified_dict['id'] = plugin_id
                v['identified_by'].append(identified_dict)

                # By default, don't include informational findings unless
                # explicitly told to do so.
                if v['cvss'] == 0 and not include_informational:
                    continue

                vuln_host_map[plugin_id] = dict()
                vuln_host_map[plugin_id]['hosts'] = set()
                vuln_host_map[plugin_id]['vuln'] = v

            if plugin_id in vuln_host_map:
                vuln_host_map[plugin_id]['hosts'].add(
                    "{0}:{1}:{2}".format(
                        host_dict['string_addr'],
                        str(port),
                        protocol
                    )
                )

        # In the event no IP was found, use the 'name' attribute of
        # the 'ReportHost' element
        if not host_dict['string_addr']:
            host_dict['string_addr'] = temp_ip
            host_dict['long_addr'] = helper.ip2long(temp_ip)

        # Add all encountered ports to the host
        host_dict['ports'].extend(ports_processed.values())

        project_dict['hosts'].append(host_dict)

    # This code block uses the plugin/host/vuln mapping to associate
    # all vulnerable hosts to their vulnerability data within the
    # context of the expected Hive schema structure.
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

        project_dict['vulnerabilities'].append(data['vuln'])

    if not project_dict['commands']:
        # Adds a dummy 'command' in the event the the Nessus plugin used
        # to populate the data was not run. The Lair API expects it to
        # contain a value.
        command = copy.deepcopy(models.command_model)
        command['tool'] = TOOL
        command['command'] = "Nessus scan - command unknown"
        project_dict['commands'].append(command)

    return project_dict