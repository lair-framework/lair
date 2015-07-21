/* globals Models Status */

Models = { // eslint-disable-line
  project: function () {
    return {
      name: '',
      industry: '',
      createdAt: '',
      description: '',
      owner: '',
      contributors: [],
      commands: [],
      notes: [],
      droneLog: []
    }
  },

  host: function () {
    return {
      projectId: '',
      longIpv4Addr: 0,
      ipv4: '',
      mac: '',
      hostnames: [],
      os: '',
      notes: [],
      statusMessage: '',
      tags: [],
      status: Status.grey,
      lastModifiedBy: '',
      isFlagged: false
    }
  },

  authInterface: function () {
    return {
      projectId: '',
      kind: '',
      url: '',
      description: ''
    }
  },

  netblock: function () {
    return {
      projectId: ''
    }
  },

  os: function () {
    return {
      tool: '',
      fingerprint: 'Unknown',
      weight: 0
    }
  },

  service: function () {
    return {
      projectId: '',
      hostId: '',
      port: 0,
      protocol: 'tcp',
      service: 'Unknown',
      product: 'Unknown',
      status: Status.grey,
      isFlagged: false,
      lastModifiedBy: ''
    }
  },

  issue: function () {
    return {
      projectId: '',
      title: '',
      cvss: 0,
      rating: '',
      isConfirmed: false,
      description: '',
      evidence: '',
      solution: '',
      hosts: [],
      pluginIds: [],
      cves: [],
      refrences: [],
      identifiedBy: [{
        tool: 'Manual'
      }],
      isFlagged: false,
      status: Status.grey,
      lastModifiedBy: ''
    }
  },

  person: function () {
    return {
      projectId: '',
      principalName: '',
      department: '',
      description: '',
      emails: [],
      phones: [],
      social: [],
      groups: [],
      credentials: [],
      loggedIn: []
    }
  },

  note: function () {
    return {
      title: '',
      content: '',
      lastModifiedBy: ''
    }
  },

  credential: function () {
    return {
      username: '',
      password: '',
      hash: '',
      host: '',
      service: ''
    }
  }
}
