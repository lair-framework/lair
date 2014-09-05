// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Alerts = new Meteor.Collection(null);

Template.alerts.alerts = function() {
  return Alerts.find({}).fetch();
};

Template.alerts.events({
  'click a': function() {
    Alerts.remove(this._id);
  }
});
