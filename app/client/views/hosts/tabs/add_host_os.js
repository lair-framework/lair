// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addHostOs.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var fingerprint = tpl.find('[name=fingerprint]').value;
    var tool = tpl.find('[name=tool]').value || 'Manual';
    var weight = parseInt(tpl.find('[name=weight]').value);
    if (isNaN(weight)) {
      weight = 100;
    }
    Meteor.call('addHostOs', projectId, hostId, tool, fingerprint, weight, function(err) {
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
      return Router.go('/project/' + projectId + '/hosts/' + hostId + '/os');
    });
  }
});
