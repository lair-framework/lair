// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission
Template.hostList.projectId = function() {
  return Session.get('projectId');
};

Template.hostList.moreToShow = function() {
  if (Template.hostList.total() > Session.get('hostsViewLimit')) {
    return true;
  } else {
    return false;
  }
};

Template.hostList.start = function() {
  var n = Session.get('hostsViewSkip') + 1;
  if (n > Template.hostList.total()) {
    n = Template.hostList.total();
  }
  return n;
};

Template.hostList.end = function() {
  var n = Session.get('hostsViewSkip') + Session.get('hostsViewLimit');
  if (n > Template.hostList.total())
    n = Template.hostList.total();
  return n;
};

Template.hostList.total = function() {
  return Counts.findOne(Session.get('projectId')).hostCount;
};

Template.hostList.flagFilter = function() {
  return Session.get('hostListFlagFilter');
};

Template.hostList.hosts = function() {
  var limit = Session.get('hostsViewLimit') || 25;
  var query = {"project_id": Session.get('projectId'), "status": {"$in": []}};
  if (Session.equals('hostListFlagFilter', 'enabled')) {
    query.flag = true;
  }
  if (!Session.equals('hostListStatusButtongrey', 'disabled')) {
    query.status.$in.push('lair-grey');
  }
  if (!Session.equals('hostListStatusButtonblue', 'disabled')) {
    query.status.$in.push('lair-blue');
  }
  if (!Session.equals('hostListStatusButtongreen', 'disabled')) {
    query.status.$in.push('lair-green');
  }
  if (!Session.equals('hostListStatusButtonorange', 'disabled')) {
    query.status.$in.push('lair-orange');
  }
  if (!Session.equals('hostListStatusButtonred', 'disabled')) {
    query.status.$in.push('lair-red');
  }
  var search = Session.get('hostListSearch');
  if (search) {
    query.$or = [
      {"string_addr": {"$regex": search, "$options": "i"}},
      {"os.fingerprint": {"$regex": search, "$options": "i"}},
      {"hostnames": {$regex: search, "$options": "i"}},
      {"last_modified_by": {$regex: search, "$options": "i"}},
      {"tags": search}
    ];
  }
  Session.set('hostQuery', query);
  var hosts = [];
  Hosts.find(query, {"sort": {"long_addr": 1}, "limit": limit}).fetch().forEach(function(host){
    host.os = host.os.sort(sortFingerprint).sort(sortWeight)[0];
    hosts.push(host);
  });
  return hosts;
};

Template.hostList.searchTerm = function() {
  return Session.get('hostListSearch');
};

Template.hostList.hostStatusButtonActive = function(status) {
  if (Session.equals('hostListStatusButton' + status, 'disabled')) {
    return 'disabled';
  }
  return false;
};

Template.hostList.loading = function() {
  return Session.get('loading');
};

Template.hostList.events({
  'click .flag-enabled': function() {
    return Meteor.call('disableHostFlag', Session.get('projectId'), this._id);
  },

  'click .flag-disabled': function() {
    return Meteor.call('enableHostFlag', Session.get('projectId'), this._id);
  },

  'click #flag-filter-enable': function() {
    return Session.set('hostListFlagFilter', 'enabled');
  },
 
  'click #flag-filter-disable': function() {
    return Session.set('hostListFlagFilter', null);
  },

  'click .host-status-button': function(event) {
    var id = 'hostListStatusButton' + event.target.id;
    if (Session.equals(id, null) || typeof Session.get(id) === 'undefined') {
      return Session.set(id, 'disabled');
    }
    return Session.set(id, null);
  },

  'keyup #host-list-search': function(event, tpl)  {
    Session.set('hostListSearch', tpl.find('#host-list-search').value);
  },

  'click .host-status': function() {
    var status = STATUS_MAP[STATUS_MAP.indexOf(this.status) + 1];
    if (STATUS_MAP.indexOf(this.status) + 1 > 4) {
      status = STATUS_MAP[0];
    }
    return Meteor.call('setHostStatus', Session.get('projectId'), this._id, status);
  },

  'click #next-page': function() {
    var id = Session.get('projectId');
    var previousSkip = Session.get('hostsViewSkip') || 0;
    var newSkip = previousSkip + 25;
    var count = Counts.findOne(Session.get('projectId')).hostCount;
    if (newSkip >= count)
        newSkip = previousSkip;
    Session.set('hostsViewSkip', newSkip);
    return Router.go('/project/' + id + '/hosts');
  },

  'click #prev-page': function() {
    var id = Session.get('projectId');
    var previousSkip = Session.get('hostsViewSkip') || 0;
    var newSkip = previousSkip - 25;
    if (newSkip < 0)
        newSkip = 0;
    Session.set('hostsViewSkip', newSkip);
    return Router.go('/project/' + id + '/hosts');
  },

  'click #load-more': function() {
    var previousLimit = Session.get('hostsViewLimit') || 25;
    var newLimit = previousLimit + 25;
    //Session.set('hostsViewLimit', newLimit);
    var id = Session.get('projectId');
    var previousSkip = Session.get('hostsViewSkip') || 0;
    var newSkip = previousSkip + 25;
    Session.set('hostsViewSkip', newSkip);
    return Router.go('/project/' + id + '/hosts');
  },

  'click #load-all': function() {
    Session.set('hostsViewLimit', 10000);
  }
});
