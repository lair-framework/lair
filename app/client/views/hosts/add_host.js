// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addHost.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var ip = tpl.find('[name=string-addr]').value;
    var mac = tpl.find('[name=mac-addr]').value;
    var hostname = tpl.find('[name=hostname]').value;
    var fingerprint = tpl.find('[name=os]').value;
    var projectId = Session.get('projectId');
    Meteor.call('addHost', projectId, ip, mac, function(err, res) {
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
      if (hostname) {
        Meteor.call('addHostname', projectId, res, hostname);
      }
      if (fingerprint) {
        Meteor.call('addHostOs', projectId, res, 'Manual', fingerprint, 100);
      }
      return Router.go('/project/' + projectId + '/hosts/' + res);
    });
  }
});
