// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostServiceList.projectId = function() {
  return Session.get('projectId');
};

Template.hostServiceList.hostId = function() {
  return Session.get('hostId');
};

Template.hostServiceList.services = function() {
  var query = {"project_id": Session.get('projectId'), "host_id": Session.get('hostId'), "status": {"$in": []}};
  if (!Session.equals('portStatusButtongrey', 'disabled')) {
    query.status.$in.push('lair-grey');
  }
  if (!Session.equals('portStatusButtonblue', 'disabled')) {
    query.status.$in.push('lair-blue');
  }
  if (!Session.equals('portStatusButtongreen', 'disabled')) {
    query.status.$in.push('lair-green');
  }
  if (!Session.equals('portStatusButtonorange', 'disabled')) {
    query.status.$in.push('lair-orange');
  }
  if (!Session.equals('portStatusButtonred', 'disabled')) {
    query.status.$in.push('lair-red');
  }
  var search = Session.get('portSearch');
  if (search) {
    query.$or = [
      {"port": {"$regex": search, "$options": "i"}},
      {"protocol": {"$regex": search, "$options": "i"}},
      {"service": {$regex: search, "$options": "i"}},
      {"product": {$regex: search, "$options": "i"}},
      {"last_modified_by": {$regex: search, "$options": "i"}}
    ];
  }
  return Ports.find(query).fetch();
};

Template.hostServiceList.searchTerm = function() {
  return Session.get('portSearch');
};

Template.hostServiceList.portStatusButtonActive = function(status) {
  if (Session.equals('portStatusButton' + status, 'disabled')) {
    return 'disabled';
  }
  return false;
};

Template.hostServiceList.events({
  'click .port-status-button': function(event) {
    var id = 'portStatusButton' + event.toElement.id;
    if (Session.equals(id, null)) {
      return Session.set(id, 'disabled');
    }
    return Session.set(id, null);
  },

  'keyup #port-search': function(event, tpl)  {
    Session.set('portSearch', tpl.find('#port-search').value.replace(/[^a-zA-Z0-9\s]/g, ''));
  },

  'click .port-status': function() {
    var status = STATUS_MAP[STATUS_MAP.indexOf(this.status) + 1];
    if (STATUS_MAP.indexOf(this.status) + 1 > 4) {
      status = STATUS_MAP[0];
    }
    return Meteor.call('setPortStatus', Session.get('projectId'), this._id, status);
  },

  'click #remove-ports': function() {
    var projectId = Session.get('projectId');
    var portIds = [];
    var inputs = $('.port-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        portIds.push($(this).attr('id'));
      }
    });
    portIds.forEach(function(id) {
      Meteor.call('removePort', projectId, id);
    });
  }
});