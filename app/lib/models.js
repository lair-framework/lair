/* globals Models Status Random */

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
      droneLog: [],
      files: []
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
      isFlagged: false,
      files: []
    }
  },

  authInterface: function () {
    return {
      projectId: '',
      isMultifactor: true,
      kind: '',
      url: '',
      description: ''
    }
  },

  netblock: function () {
    return {
      projectId: '',
      asn: '',
      asnCountryCode: '',
      asnCidr: '',
      asnDate: '',
      asnRegistry: '',
      cidr: '',
      abuseEmails: '',
      miscEmails: '',
      techEmails: '',
      name: '',
      city: '',
      country: '',
      postalCode: '',
      created: '',
      updated: '',
      description: '',
      handle: ''
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
      lastModifiedBy: '',
      notes: [],
      files: []
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
      pluginIds: [{
        tool: 'Manual',
        id: Random.id()
      }],
      cves: [],
      references: [],
      identifiedBy: [{
        tool: 'Manual'
      }],
      notes: [],
      isFlagged: false,
      status: Status.grey,
      lastModifiedBy: '',
      files: []
    }
  },

  issueHost: function () {
    return {
      ipv4: '',
      port: 0,
      protocol: ''
    }
  },

  issueReference: function () {
    return {
      link: '',
      name: ''
    }
  },

  person: function () {
    return {
      projectId: '',
      principalName: '',
      samAccountName: '',
      distinguishedName: '',
      firstName: '',
      middleName: '',
      lastName: '',
      displayName: '',
      department: '',
      description: '',
      address: '',
      emails: [],
      phones: [],
      references: [],
      groups: [],
      lastLogon: '',
      lastLogoff: '',
      loggedIn: []
    }
  },

  personReference: function () {
    return {
      description: '',
      username: '',
      link: ''
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
      format: '',
      hash: '',
      host: '',
      service: ''
    }
  },

  webDirectory: function () {
    return {
      projectId: '',
      hostId: '',
      path: '',
      port: 0,
      responseCode: '',
      lastModifiedBy: '',
      isFlagged: false
    }
  },

  file: function () {
    return {
      filename: '',
      url: ''
    }
  }
}
