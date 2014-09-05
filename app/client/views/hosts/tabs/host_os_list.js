// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostOsList.projectId = function() {
  return Session.get('projectId');
};
Template.hostOsList.hostId = function() {
  return Session.get('hostId');
};

Template.hostOsList.fingerprints = function() {
  var host = Hosts.findOne(Session.get('hostId'));
  if (!host) {
    return false
  }
  return host.os.sort(sortFingerprint).sort(sortWeight);
};

Template.hostOsList.events({
  'click #remove-fingerprints': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var fingerprintIds = [];
    var inputs = $('.os-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        fingerprintIds.push($(this).attr('id'));
      }
    });
    fingerprintIds.forEach(function(id) {
      var data = id.split('-');
      Meteor.call('removeHostOs', projectId, hostId, data[0], data[1], parseInt(data[2]));
    });
  },
  'click .increase-weight': function() {
    var newWeight = parseInt(this.weight) + 5;
    if (newWeight > 100) {
      newWeight = 100;
    }
    var os = {};
    os.tool = this.tool;
    os.weight = parseInt(this.weight);
    os.fingerprint = this.fingerprint;
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    Meteor.call('setOsWeight', projectId, hostId, os, newWeight);
  },

  'click .decrease-weight': function() {
    var newWeight =  parseInt(this.weight) - 5;
    if (newWeight < 0) {
      newWeight = 0;
    }
    var os = {};
    os.tool = this.tool;
    os.weight = parseInt(this.weight);
    os.fingerprint = this.fingerprint;
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    Meteor.call('setOsWeight', projectId, hostId, os, newWeight);
  }

});
