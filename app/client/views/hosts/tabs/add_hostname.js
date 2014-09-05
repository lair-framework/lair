// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addHostname.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var hostname = tpl.find('[name=hostname]').value;
    Meteor.call('addHostname', projectId, hostId, hostname, function(err) {
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
      return Router.go('/project/' + projectId + '/hosts/' + hostId + '/hostnames');
    });
  }
});
