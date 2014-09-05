// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.serviceCredentialList.projectId = function() {
  return Session.get('projectId');
};

Template.serviceCredentialList.portId = function () {
  return Session.get('portId');
};

Template.serviceCredentialList.credentials = function () {
  var port = Ports.findOne({"project_id": Session.get('projectId'), "_id": Session.get('portId')});
  if (!port) {
    return false;
  }
  return port.credentials;
}
Template.serviceCredentialList.events({
  'click #remove-credentials': function() {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId')
    var credentialIds = [];
    var inputs = $('.credential-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        credentialIds.push($(this).attr('id'));
      }
    });
    credentialIds.forEach(function(id) {
      var data = id.split('-');
      Meteor.call('removeCredential', projectId, portId, data[0], data[1]);
    });
  }
});
