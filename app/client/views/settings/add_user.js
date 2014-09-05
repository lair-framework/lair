// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addUser.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var email = tpl.find('[name=email]').value;
    var password = tpl.find('[name=password]').value;
    var admin = tpl.find('[name=admin]').checked;
    Meteor.call('createLairUser', email, password, admin, function(err) {
      if (err) {
        tpl.find('[name=password]').value = '';
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason.replace(/\./g, '')});
      }
      return Router.go('/settings/users');
    });
  }
});
