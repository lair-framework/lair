# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

# Constants to be utilized by clients for consistency
STATUS_CLEAN = 'clean'
STATUS_EXPLOITED = 'exploited'
STATUS_IN_PROGRESS = 'in_progress'
STATUS_UNDETERMINED = 'undetermined'

PROTOCOL_TCP = 'tcp'
PROTOCOL_UDP = 'udp'

PRODUCT_UNKNOWN = 'unknown'

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
    'password': '',
    'hash': ''
}

note_model = {
    'title': '',
    'content': '',
    'last_modified_by': ''
}

port_model = {
    'port': 0,
    'protocol': PROTOCOL_TCP,
    'service': '',
    'product': PRODUCT_UNKNOWN,
    'alive': True,
    'status': STATUS_UNDETERMINED,
    'credentials': [],          # credential_models
    'notes': [],                # note_models
    'last_modified_by': ''
}

host_model = {
    'long_addr': 0,
    'string_addr': '',
    'mac_addr': '',
    'hostnames': [],            # Strings
    'os': [],                   # os_models
    'alive': True,
    'status': STATUS_UNDETERMINED,
    'ports': [],                # port_models
    'last_modified_by': '',
    'notes': []
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
    'title': '',
    'description': '',
    'solution': '',
    'status': STATUS_UNDETERMINED,
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

attack_model = {
    'title': '',
    'content': ''
}

project_model = {
    'project_id': '',
    'project_name': '',
    'industry': '',
    'creation_date': '',
    'description': '',
    'owner': '',
    'contributors': [],         # ObjectIds
    'commands': [],             # command_models
    'notes': [],                # note_models
    'hosts': [],                # host_models
    'vulnerabilities': [],      # vulnerability_models
    'attacks': [],              # attack_models
    'drone_log': []
}
