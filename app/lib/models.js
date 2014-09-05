// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

models = {
  project: function() {
    return {
      'project_name': '',
      'industry': '',
      'creation_date': '',
      'description': '',
      'owner': '',
      'contributors': [],
      'commands': [],
      'notes': [],
      'drone_log': [],
      'messages': [],
      'files': []
    };
  },

  file: function() {
    return {
      'name': '',
      'url': ''
    };
  },

  message: function() {
    return {
      'user': '',
      'message': ''
    };
  },

  host: function() {
    return {
      'project_id': '',
      'long_addr': 0,
      'string_addr': '',
      'mac_addr': '',
      'hostnames': [],
      'os': [],
      'notes': [],
      'tags': [],
      'alive': true,
      'status': STATUS_GREY,
      'last_modified_by': '',
      'flag': false
    };
  },

  os: function() {
    return {
      'tool': '',
      'weight': 0,
      'fingerprint': 'unknown'
    };
  },
  
  note: function() {
    return {
      'title': '',
      'content': '',
      'last_modified_by': ''
    };
  },

  port: function() {
    return {
      'project_id': '',
      'host_id': '',
      'port': 0,
      'protocol': PROTOCOL_TCP,
      'service': SERVICE_UNKNOWN,
      'product': PRODUCT_UNKNOWN,
      'alive': true,
      'status': STATUS_GREY,
      'credentials': [],
      'notes': [],
      'last_modified_by': '',
      'flag': false
    };
  },
 
  credential: function() {
    return {
      'username': '',
      'password': '',
      'hash': '',
    };
  },

  vulnerability: function() {
    return {
      'project_id': '',
      'title': '',
      'description': '',
      'solution': '',
      'status': STATUS_GREY,
      'cvss': 0,
      'cves': [],
      'plugin_ids': [],
      'identified_by': [],
      'confirmed': false,
      'notes': [],
      'tags': [],
      'evidence': '',
      'hosts': [],
      'last_modified_by': '',
      'flag': false
    };
  },

  plugin_id: function(s) {
    var hex = string2Hex(s);
    return {
      'tool': '',
      'id': hex
    };
  }
};
