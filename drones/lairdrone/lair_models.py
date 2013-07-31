# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

# Constants to be utilized by clients for consistency
VERSION = '0.1.0'
STATUS_GREY = 'lair-grey'
STATUS_BLUE = 'lair-blue'
STATUS_GREEN = 'lair-green'
STATUS_ORANGE = 'lair-orange'
STATUS_RED = 'lair-red'
STATUS_MAP = [STATUS_GREY, STATUS_BLUE, STATUS_GREEN, STATUS_ORANGE, STATUS_RED]
PROTOCOL_TCP = 'tcp'
PROTOCOL_UDP = 'udp'
PRODUCT_UNKNOWN = 'unknown'
SERVICE_UNKNOWN = 'unknown'

# Model definitions
command_model = {
    'tool': '',
    'command': ''
}

os_model = {
    'tool': '',
    'weight': 0,
    'fingerprint': 'unknown'
}

credential_model = {
    'username': '',
    'password': ''
}

note_model = {
    'title': '',
    'content': '',
    'last_modified_by': ''
}

port_model = {
    'project_id': '',
    'host_id': '',
    'port': 0,
    'protocol': PROTOCOL_TCP,
    'service': SERVICE_UNKNOWN,
    'product': PRODUCT_UNKNOWN,
    'alive': True,
    'status': STATUS_GREY,
    'credentials': [],          # credential_models
    'notes': [],                # note_models
    'last_modified_by': ''
}

host_model = {
    'project_id': '',
    'long_addr': 0,
    'string_addr': '',
    'mac_addr': '',
    'hostnames': [],            # Strings
    'os': [],                   # os_models
    'notes': [],
    'alive': True,
    'status': STATUS_GREY,
    'last_modified_by': ''
}

plugin_id_model = {
    'tool': '',
    'id': ''
}

identified_by_model = {
    'tool': '',
    'id': ''
}

host_key_model = {
    'string_addr': '',
    'port': 0,
    'protocol': PROTOCOL_TCP
}

vulnerability_model = {
    'project_id': '',
    'title': '',
    'description': '',
    'solution': '',
    'status': STATUS_GREY,
    'cvss': 0,
    'cves': [],                 # Strings
    'plugin_ids': [],           # plugin_id_models
    'identified_by': [],        # identified_by_models
    'confirmed': False,
    'notes': [],                # note_models
    'evidence': '',
    'hosts': [],                # host_key_model
    'last_modified_by': ''
}

project_model = {
    'project_name': '',
    'owner': '',
    'contributors': [],         # ObjectIds
    'commands': [],             # command_models
    'notes': [],                # note_models
    'drone_log': [],
    'messages': [],             # attack_models
    'files': []
}