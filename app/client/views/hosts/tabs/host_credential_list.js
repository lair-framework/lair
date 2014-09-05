// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostCredentialList.projectId = function() {
  return Session.get('projectId');
};

Template.hostCredentialList.credentials = function() {
  var projectId = Session.get('projectId');
  var hostId = Session.get('hostId');
  var ports = Ports.find({"project_id": projectId, "host_id": hostId}).fetch();
  var credentials = [];
  ports.forEach(function(port) {
    port.credentials.forEach(function(cred) {
      credentials.push({'_id': port._id, 'port': port.port, 'protocol': port.protocol, 'username': cred.username,
        'password': cred.password, 'hash': cred.hash});
    });
  });
  return credentials.sort(sortPort);
};

Template.hostCredentialList.events({
  'click #remove-credentials': function() {
    var projectId = Session.get('projectId');
    var credentialIds = [];
    var inputs = $('.credential-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        credentialIds.push($(this).attr('id'));
      }
    });
    credentialIds.forEach(function(id) {
      var data = id.split('-');
      Meteor.call('removeCredential', projectId, data[0], data[1], data[2]);
    });
  }
});
