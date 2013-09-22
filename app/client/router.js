// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Meteor.Router.add({
  '/' : {
    to: 'projects',
    and: function() {
           Session.set('projectId', null);
    }
  },
  '/signin': 'signin',
  '/signout': {
    to: 'signin',
    and: function() {
      Meteor.logout();
    }
  },
  '/changepassword': 'changePassword',
  '/settings/users': 'users',
  '/settings/users/new': 'addUser',
  '/settings': 'settings',
  '/project/new': 'addProject',
  '/project/:pid': {
     to: 'hostList',
     and: function(pid) {
            Session.set('hostsViewLimit', null);
            Session.set('projectId', pid);
            unsetHostStatusButtons();
     }
  },

  // host table and host views
  '/project/:pid/hosts': {
    to:  'hostList',
    and: function(pid) {
           Session.set('hostsViewLimit', null);
           Session.set('projectId', pid);
           unsetHostStatusButtons();
    }
  },
  '/project/:pid/hosts/new': {
    to: 'addHost',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },
  '/project/:pid/hosts/:hid': {
    to: 'hostServiceList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
           Session.set('hostServiceLimit', null);
           unsetPortStatusButtons();
    }
  },
  '/project/:pid/hosts/:hid/services': {
    to: 'hostServiceList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
           Session.set('hostServiceLimit', null);
           unsetPortStatusButtons();
    }
  },
  '/project/:pid/hosts/:hid/services/new': {
    to: 'addPort',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },
  // single service views
  '/project/:pid/services/:sid': {
    to: 'serviceVulnerabilityList',
    and: function(pid, sid) {
           Session.set('projectId', pid);
           Session.set('portId', sid);
           unsetVulnerabilityStatusButtons();
    }
  },
  '/project/:pid/services/:sid/vulnerabilities': {
    to: 'serviceVulnerabilityList',
    and: function(pid, sid) {
           Session.set('projectId', pid);
           Session.set('portId', sid);
           unsetVulnerabilityStatusButtons();
    }
  },
  '/project/:pid/services/:sid/notes': {
    to: 'serviceNoteList',
    and: function(pid, sid) {
      Session.set('projectId', pid);
      Session.set('portId', sid);
      Session.set('noteTitle', null);
    }
  },
  '/project/:pid/services/:sid/credentials': {
    to: 'serviceCredentialList',
    and: function(pid, sid) {
      Session.set('projectId', pid);
      Session.set('portId', sid);
    }
  },
  '/project/:pid/services/:sid/credentials/new': {
    to: 'addCredential',
    and: function(pid, sid) {
      Session.set('projectId', pid);
      Session.set('portId', sid);
    }
  },
  '/project/:pid/hosts/:hid/vulnerabilities': {
    to: 'hostVulnerabilityList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
           unsetVulnerabilityStatusButtons();
    }
  },
  '/project/:pid/hosts/:hid/os': {
    to: 'hostOsList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },
  '/project/:pid/hosts/:hid/os/new': {
    to: 'addHostOs',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },
  '/project/:pid/hosts/:hid/notes': {
    to: 'hostNoteList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
           Session.set('noteTitle', null);
    }
  },
  '/project/:pid/hosts/:hid/hostnames': {
    to: 'hostHostnameList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },
  '/project/:pid/hosts/:hid/hostnames/new': {
    to: 'addHostname',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },
  '/project/:pid/hosts/:hid/credentials': {
    to: 'hostCredentialList',
    and: function(pid, hid) {
           Session.set('projectId', pid);
           Session.set('hostId', hid);
    }
  },

  // service search
  '/project/:pid/services': {
    to: 'serviceSearch',
    and: function(pid) {
           Session.set('projectId', pid);
           Session.set('servicesViewQuery', null);
    }
  },

  // vulnerability list and vulnerability views
  '/project/:pid/vulnerabilities': {
    to: 'vulnerabilityList',
    and: function(pid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityViewLimit', null);
           unsetVulnerabilityStatusButtons();
    }
  },
  '/project/:pid/vulnerabilities/new': {
    to: 'addVulnerability',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },
  '/project/:pid/vulnerabilities/:vid': {
    to: 'vulnerabilityDescription',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/description': {
    to: 'vulnerabilityDescription',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/evidence': {
    to: 'vulnerabilityEvidence',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/solution': {
    to: 'vulnerabilitySolution',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/hosts': {
    to: 'vulnerabilityHostList',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/hosts/new': {
    to: 'addVulnerabilityHost',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/hosts/bulk': {
    to: 'addVulnerabilityHostBulk',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/cves': {
    to: 'vulnerabilityCveList',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
    }
  },
  '/project/:pid/vulnerabilities/:vid/notes': {
    to: 'vulnerabilityNoteList',
    and: function(pid, vid) {
           Session.set('projectId', pid);
           Session.set('vulnerabilityId', vid);
           Session.set('noteTitle', null);
    }
  },

  // notes
  '/project/:pid/notes': {
    to: 'noteList',
    and: function(pid) {
           Session.set('projectId', pid);
           Session.set('noteTitle', null);
    }
  },

  // credentials
  '/project/:pid/credentials': {
    to: 'credentialList',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },

  // contributors
  '/project/:pid/contributors': {
    to: 'contributors',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },

  // files
  '/project/:pid/files': {
    to: 'fileList',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },

  // log
  '/project/:pid/log': {
    to: 'droneLog',
    and: function(pid) {
           Session.set('projectId', pid);
    }
  },
  '*': 'notFound'
});

Meteor.Router.filters({
  'requireLogin': function(page) {
    if (Meteor.user()) {
      return page;
    }
    else if (Meteor.loggingIn()) {
      return 'loading';
    }
    else {
      return 'signin';
    }
  },
  'clearErrors': function(page) {
    Alerts.remove({});
    return page;
  }
});
Meteor.Router.filter('requireLogin');
Meteor.Router.filter('clearErrors');

function unsetVulnerabilityStatusButtons() {
  Session.set('vulnerabilitySearch', null);
  Session.set('vulnerabilityListStatusButtongrey', null);
  Session.set('vulnerabilityListStatusButtonblue', null)
  Session.set('vulnerabilityListStatusButtongreen', null)
  Session.set('vulnerabilityListStatusButtonorange', null)
  Session.set('vulnerabilityListStatusButtonred', null)
}
function unsetHostStatusButtons() {
  Session.set('hostListSearch', null);
  Session.set('hostListStatusButtongrey', null);
  Session.set('hostListStatusButtonblue', null)
  Session.set('hostListStatusButtongreen', null)
  Session.set('hostListStatusButtonorange', null)
  Session.set('hostListStatusButtonred', null)
}
function unsetPortStatusButtons() {
  Session.set('portSearch', null);
  Session.set('portListStatusButtongrey', null);
  Session.set('portListStatusButtonblue', null)
  Session.set('portListStatusButtongreen', null)
  Session.set('portListStatusButtonorange', null)
  Session.set('portListStatusButtonred', null)
}
