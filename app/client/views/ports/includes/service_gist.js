// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.serviceGist.projectId = function() {
  return Session.get('projectId');
};

Template.serviceGist.port = function() {
  var projectId = Session.get('projectId');
  var port = Ports.findOne({"project_id": projectId, "_id": Session.get('portId')});
  if (!port) {
    return {};
  }
  var host = Hosts.findOne({"project_id": projectId, "_id": port.host_id});
  if (!host) {
    return port;
  }
  port.string_addr = host.string_addr;
  return port;
};

Template.serviceGist.events({
  'click .flag-enabled': function() {
    return Meteor.call('disablePortFlag', Session.get('projectId'), this._id);
  },

  'click .flag-disabled': function() {
    return Meteor.call('enablePortFlag', Session.get('projectId'), this._id);
  },

  'click .port-status': function() {
    var status = STATUS_MAP[STATUS_MAP.indexOf(this.status) + 1];
    if (STATUS_MAP.indexOf(this.status) + 1 > 4) {
      status = STATUS_MAP[0];
    }
    return Meteor.call('setPortStatus', Session.get('projectId'), Session.get('portId'), status);
  },

  'click #previous-port': function() {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var port = Ports.findOne({"project_id": projectId, "_id": portId});
    var hostId = port.host_id;
    var ports = Ports.find({"host_id": hostId, "project_id": projectId}).fetch();
    ports.sort(sortPort);
    var i = _.indexOf(_.pluck(ports, '_id'), portId) - 1;
    if (i < 0) {
      i = ports.length - 1;
    }
    return Router.go('/project/' + projectId + '/services/' + ports[i]._id);
  },

  'click #next-port': function() {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var port = Ports.findOne({"project_id": projectId, "_id": portId});
    var hostId = port.host_id;
    var ports = Ports.find({"host_id": hostId, "project_id": projectId}).fetch();
    ports.sort(sortPort);
    var i = _.indexOf(_.pluck(ports, '_id'), portId) + 1;
    if (i >= ports.length) {
      i = 0;
    }
    return Router.go('/project/' + projectId + '/services/' + ports[i]._id);
  },

  'click #remove-port': function() {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var port = Ports.findOne(portId);
    var host = Hosts.findOne(port.host_id);
    Meteor.call('removePort', projectId, portId, function(err) {
      if (!err) {
        Meteor.call('removePortFromVulnerabilities', projectId, host.string_addr, port.port, port.protocol);
        Router.go('/project/' + projectId + '/hosts/' + host._id);
      }
    });
  },

  'click #edit-port': function(event, tpl) {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var service = tpl.find('[name=edit-service]').value;
    var product = tpl.find('[name=edit-product]').value;
    tpl.find('[name=edit-service]').value = '';
    tpl.find('[name=edit-product]').value = '';
    if (service) {
      Meteor.call('setService', projectId, portId, service);
    }
    if (product) {
      Meteor.call('setProduct', projectId, portId, product);
    }
  }
});
