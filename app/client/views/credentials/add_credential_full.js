// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addCredentialFull.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var ip = tpl.find('[name=host]').value;
    var p = tpl.find('[name=port]').value;
    var host = Hosts.findOne({"project_id": projectId, "string_addr": ip});
    if (typeof host === 'undefined') {
      return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "The host provided doesn't exist"});
    }
    var port = Ports.findOne({"project_id": projectId, "host_id": host._id, "port": parseInt(p)});
    if (typeof port === 'undefined') {
      return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "The port provided doesn't exist"});
    }
    var username = tpl.find('[name=username]').value || 'unknown';
    var password = tpl.find('[name=password]').value || 'unknown';
    var hash = tpl.find('[name=hash]').value || 'unknown';
    Meteor.call('addCredential', projectId, port._id, username, password, hash, function(err) {
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
      return Router.go('/project/' + projectId + '/credentials');
    });
  }
});
