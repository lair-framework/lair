// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.credentialList.projectId = function() {
  return Session.get('projectId');
};

Template.credentialList.credentials = function() {
  var projectId = Session.get('projectId');
  var ports = Ports.find({"project_id": projectId}).fetch();
  var credentials = [];
  ports.forEach(function(port) {
    if (typeof port.credentials !== 'undefined' && port.credentials.length > 0) {
      var host = Hosts.findOne(port.host_id);
      port.credentials.forEach(function(cred) {
        credentials.push({'_id': port._id, 'port': port.port, 'protocol': port.protocol, 'username': cred.username,
          'password': cred.password, 'hash': cred.hash, 'string_addr': host.string_addr, 'host_id': host._id});
      });
    }
  });
  return credentials.sort(sortPort);
};

Template.credentialList.events({
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
