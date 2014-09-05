// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Router.configure({
    layoutTemplate: 'layout'
});

Router.map(function() {
    this.route('projects',
        {
            path: '/'
        }
    );
    this.route('signin', {path: '/signin'});
    this.route('signin',
        {
            path: '/signout',
            onBeforeAction: function() {
                Session.set('projectId', null);
                Meteor.logout();
            }
        }
    );
    this.route('changePassword', {path: '/changepassword'});
    this.route('users', {path: '/settings/users'});
    this.route('addUser', {path: '/settings/users/new'});
    this.route('settings', {path: '/settings'});
    this.route('addProject', {path: '/project/new'});
    this.route('hostList',
        {
            path: '/project/:pid',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                applyHostFilter();
            }
        }
    );
    this.route('hostList',
        {
            template: 'hostList',
            path: '/project/:pid/hosts',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                applyHostFilter();
            }
        }
    );
    this.route('addHost',
        {
            path: '/project/:pid/hosts/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('hostServiceList',
        {
            path: '/project/:pid/hosts/:hid',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
                applyPortFilter();
            }
        }
    );
    this.route('hostServiceList',
        {
            path: '/project/:pid/hosts/:hid/services',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
                applyPortFilter();
            }
        }
    );
    this.route('addPort',
        {
            path: '/project/:pid/hosts/:hid/services/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('serviceVulnerabilityList',
        {
            path: '/project/:pid/services/:sid',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
                applyVulnerabilityFilter();
            }
        }
    );
    this.route('serviceVulnerabilityList',
        {
            path: '/project/:pid/services/:sid/vulnerabilities',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
                applyVulnerabilityFilter();
            }
        }
    );
    this.route('serviceNoteList',
        {
            path: '/project/:pid/services/:sid/notes',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
                Session.set('noteTitle', null);
            }
        }
    );
    this.route('serviceCredentialList',
        {
            path: '/project/:pid/services/:sid/credentials',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
            }
        }
    );
    this.route('addCredential',
        {
            path: '/project/:pid/services/:sid/credentials/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
            }
        }
    );
    this.route('hostVulnerabilityList',
        {
            path: '/project/:pid/hosts/:hid/vulnerabilities',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
                applyVulnerabilityFilter();
            }
        }
    );
    this.route('hostOsList',
        {
            path: '/project/:pid/hosts/:hid/os',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('addHostOs',
        {
            path: '/project/:pid/hosts/:hid/os/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('hostNoteList',
        {
            path: '/project/:pid/hosts/:hid/notes',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
                Session.set('noteTitle', null);
            }
        }
    );
    this.route('hostHostnameList',
        {
            path: '/project/:pid/hosts/:hid/hostnames',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('addHostname',
        {
            path: '/project/:pid/hosts/:hid/hostnames/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('hostCredentialList',
        {
            path: '/project/:pid/hosts/:hid/credentials',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('hostTagList',
        {
            path: '/project/:pid/hosts/:hid/tags',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('hostId', this.params.hid);
            }
        }
    );
    this.route('serviceSearch',
        {
            path: '/project/:pid/services',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('servicesViewQuery', null);
            }
        }
    );
    this.route('vulnerabilityList',
        {
            path: '/project/:pid/vulnerabilities',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                applyVulnerabilityFilter();
            }
        }
    );
    this.route('addVulnerability',
        {
            path: '/project/:pid/vulnerabilities/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('addServiceVulnerability',
        {
            path: '/project/:pid/services/:sid/vulnerabilities/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('portId', this.params.sid);
            }
        }
    );
    this.route('vulnerabilityDescription',
        {
            path: '/project/:pid/vulnerabilities/:vid',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilityDescription',
        {
            path: '/project/:pid/vulnerabilities/:vid/description',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilityEvidence',
        {
            path: '/project/:pid/vulnerabilities/:vid/evidence',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilitySolution',
        {
            path: '/project/:pid/vulnerabilities/:vid/solution',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilityHostList',
        {
            path: '/project/:pid/vulnerabilities/:vid/hosts',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('addVulnerabilityHost',
        {
            path: '/project/:pid/vulnerabilities/:vid/hosts/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('addVulnerabilityHostBulk',
        {
            path: '/project/:pid/vulnerabilities/:vid/hosts/bulk',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilityCveList',
        {
            path: '/project/:pid/vulnerabilities/:vid/cves',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('vulnerabilityNoteList',
        {
            path: '/project/:pid/vulnerabilities/:vid/notes',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
                Session.set('noteTitle', null);
            }
        }
    );
    this.route('vulnerabilityTagList',
        {
            path: '/project/:pid/vulnerabilities/:vid/tags',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('vulnerabilityId', this.params.vid);
            }
        }
    );
    this.route('noteList',
        {
            path: '/project/:pid/notes',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
                Session.set('noteTitle', null);
            }
        }
    );
    this.route('credentialList',
        {
            path: '/project/:pid/credentials',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('addCredentialFull',
        {
            path: '/project/:pid/credentials/new',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('contributors',
        {
            path: '/project/:pid/contributors',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('fileList',
        {
            path: '/project/:pid/files',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('droneLog',
        {
            path: '/project/:pid/log',
            onBeforeAction: function() {
                Session.set('projectId', this.params.pid);
            }
        }
    );
    this.route('notFound', {path: '*'});
});

// 1. login filter
Router.onBeforeAction(function() {
    if(!Meteor.loggingIn() && !Meteor.user()) {
        this.redirect('signin');
    }
}, {except: 'signin'});

// 2. clear alerts filter
Router.onBeforeAction(function() {
    Alerts.remove({});
});

function applyVulnerabilityFilter() {
  var persist = Settings.findOne({"setting": "persistViewFilters", "enabled": true});
  if(!persist) {
      unsetVulnerabilityStatusButtons();
      Session.set('vulnerabilityViewLimit', 25);
  }
}
function applyHostFilter() {
  var persist = Settings.findOne({"setting": "persistViewFilters", "enabled": true});
  if(!persist) {
      unsetHostStatusButtons();
      Session.set('hostsViewLimit', 25);
  }
}
function applyPortFilter() {
  var persist = Settings.findOne({"setting": "persistViewFilters", "enabled": true});
  if(!persist) {
      unsetPortStatusButtons();
      Session.set('hostServiceLimit', 25);
  }
}

function unsetVulnerabilityStatusButtons() {
  Session.set('vulnerabilitySearch', null);
  Session.set('vulnerabilityListStatusButtongrey', null);
  Session.set('vulnerabilityListStatusButtonblue', null);
  Session.set('vulnerabilityListStatusButtongreen', null);
  Session.set('vulnerabilityListStatusButtonorange', null);
  Session.set('vulnerabilityListStatusButtonred', null);
  Session.set('vulnerabilityListFlagFilter', null);
}
function unsetHostStatusButtons() {
  Session.set('hostListSearch', null);
  Session.set('hostListStatusButtongrey', null);
  Session.set('hostListStatusButtonblue', null);
  Session.set('hostListStatusButtongreen', null);
  Session.set('hostListStatusButtonorange', null);
  Session.set('hostListStatusButtonred', null);
  Session.set('hostListFlagFilter', null);
}
function unsetPortStatusButtons() {
  Session.set('portSearch', null);
  Session.set('portListStatusButtongrey', null);
  Session.set('portListStatusButtonblue', null);
  Session.set('portListStatusButtongreen', null);
  Session.set('portListStatusButtonorange', null);
  Session.set('portListStatusButtonred', null);
  Session.set('portListFlagFilter', null);
}
