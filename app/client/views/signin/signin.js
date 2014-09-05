// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.signin.initialUser = function() {
  return Meteor.users.find().count() < 1;
};

Template.signin.events({
   'submit form': function(event, tpl) {
     event.preventDefault();
     var email = tpl.find('[name=email]').value;
     var password = tpl.find('[name=password]').value;
     if (Meteor.users.find().count() < 1) {
       Meteor.call('createLairUser', email, password, true, function(err) {
         if (err) {
           return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
         }
         return Meteor.loginWithPassword(email, password, function(err){
           if (err) {
             return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
           }
           return Router.go('/');
         });
       });
     }
     else {
       Meteor.loginWithPassword(email, password, function(err) {
          if (err) {
            return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
          }
          return Router.go('/');
       });
     }
   }
});
