#!/usr/bin/env python
# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

import os
import copy
import xml.etree.ElementTree as et
from lairdrone import drone_models as models
from lairdrone import helper

OS_WEIGHT = 50
TOOL = "nmap"


def parse(project, resource):
    """Parses an Nmap XML file and updates the Lair database

    :param project: The project id
    :param resource: The Nmap xml file or xml string to be parsed
    """

    # Attempt to parse resource as file or string
    try:
        if os.path.isfile(resource):
            tree = et.parse(resource)
            root = tree.getroot()
        else:
            root = et.fromstring(resource)
    except et.ParseError:
        raise

    # Create the project dictionary which acts as foundation of document
    project_dict = copy.deepcopy(models.project_model)
    project_dict['project_id'] = project

    # Pull the command from the file
    command_dict = copy.deepcopy(models.command_model)
    command_dict['tool'] = TOOL

    if root.tag == 'nmaprun':
        command_dict['command'] = root.attrib['args']
    else:
        command = root.find('nmaprun')
        if command is not None:
            command_dict['command'] = command.attrib['args']

    project_dict['commands'].append(command_dict)

    # Process each 'host' in the file
    for host in root.findall('host'):

        host_dict = copy.deepcopy(models.host_model)

        # Find the host status
        status = host.find('status')
        if status is not None:
            if status.attrib['state'] != 'up':
                host_dict['alive'] = False

        # Find the IP address and/or MAC address
        for addr in host.findall('address'):

            # Get IP address
            if addr.attrib['addrtype'] == 'ipv4':
                host_dict['string_addr'] = addr.attrib['addr']
                host_dict['long_addr'] = helper.ip2long(addr.attrib['addr'])
            elif addr.attrib['addrtype'] == 'mac':
                host_dict['mac_addr'] = addr.attrib['addr']

        # Find the host names
        for hostname in host.iter('hostname'):
            host_dict['hostnames'].append(hostname.attrib['name'])

        # Find the ports
        for port in host.iter('port'):
            port_dict = copy.deepcopy(models.port_model)
            port_dict['port'] = int(port.attrib['portid'])
            port_dict['protocol'] = port.attrib['protocol']

            # Find port status
            status = port.find('state')
            if status is not None:
                if status.attrib['state'] != 'open':
                    continue
                port_dict['alive'] = True

            # Find port service and product
            service = port.find('service')
            if service is not None:
                port_dict['service'] = service.attrib['name']
                if 'product' in service.attrib:
                    port_dict['product'] = service.attrib['product']
                else:
                    port_dict['product'] = "unknown"

            # Find NSE script output
            for script in port.findall('script'):
                note_dict = copy.deepcopy(models.note_model)
                note_dict['title'] = script.attrib['id']
                note_dict['content'] = script.attrib['output']
                note_dict['last_modified_by'] = TOOL
                port_dict['notes'].append(note_dict)

            host_dict['ports'].append(port_dict)

        # Find the Operating System
        os_dict = copy.deepcopy(models.os_model)
        os_dict['tool'] = TOOL
        os_list = list(host.iter('osmatch'))
        if os_list:
            os_dict['weight'] = OS_WEIGHT
            os_dict['fingerprint'] = os_list[0].attrib['name']

        host_dict['os'].append(os_dict)

        project_dict['hosts'].append(host_dict)

    return project_dict