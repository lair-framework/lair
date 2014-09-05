// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.changePassword.events({
   'submit form': function(event, tpl) {
     event.preventDefault();
     var password = tpl.find('[name=password]').value;
     Meteor.call('changeLairUserPassword', Meteor.userId(), password, function(err) {
       if (err) {
         return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
       }
       return Router.go('/');
     });
   }
});
