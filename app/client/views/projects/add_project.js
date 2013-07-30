// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.addProject.events({
   'submit form': function(event, tpl) {
     event.preventDefault();
     var name = tpl.find('[name=name]').value;
     var businessType = tpl.find('[name=business-type]').value;
     var description = tpl.find('[name=description]').value;
     Meteor.call('addProject', name, businessType, description, function(err, res) {
       if (err) {
         return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
       }
       return Meteor.Router.to('/project/' + res);
     });
   }
});