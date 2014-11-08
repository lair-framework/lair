// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostGist.host = function() {
  var host = Hosts.findOne(Session.get('hostId'));
  if (host) {
    host.os = host.os.sort(sortFingerprint).sort(sortWeight)[0];
    return host;
  }
  return {};
};

Template.hostGist.events({
  'click .flag-enabled': function() {
    return Meteor.call('disableHostFlag', Session.get('projectId'), this._id);
  },

  'click .flag-disabled': function() {
    return Meteor.call('enableHostFlag', Session.get('projectId'), this._id);
  },

  'click .host-status': function() {
    var status = STATUS_MAP[STATUS_MAP.indexOf(this.status) + 1];
    if (STATUS_MAP.indexOf(this.status) + 1 > 4) {
      status = STATUS_MAP[0];
    }
    return Meteor.call('setHostStatus', Session.get('projectId'), this._id, status);
  },

  'click #next-host': function() {
    var id = Session.get('projectId');
    var hosts = Hosts.find({"project_id": id}, {"sort": {"long_addr": 1}}).fetch();
    var i = _.indexOf(_.pluck(hosts, '_id'), Session.get('hostId')) + 1;
    if (i >= hosts.length) {
      return Router.go('/project/' + id + '/hosts/' + Session.get('hostId') + '/next');
    }
    return Router.go('/project/' + id + '/hosts/' + hosts[i]._id);
  },

  'click #previous-host': function() {
    var id = Session.get('projectId');
    var hosts = Hosts.find({"project_id": id}, {"sort": {"long_addr": 1}}).fetch();
    var i = _.indexOf(_.pluck(hosts, '_id'), Session.get('hostId')) - 1;
    if (i < 0) {
      return Router.go('/project/' + id + '/hosts/' + Session.get('hostId') + '/prev');
    }
    return Router.go('/project/' + id + '/hosts/' + hosts[i]._id);
  },

  'click #remove-host': function() {
    var id = Session.get('projectId');
    var hid = Session.get('hostId');
    var host = Hosts.findOne(Session.get('hostId'));
    Meteor.call('removeHost', id, hid, function(err) {
      if (!err) {
        Meteor.call('removeHostFromVulnerabilities', Session.get('projectId'), host.string_addr);
        return Router.go('/project/' + id);
      }
      return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
    });
  }
});
