// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.settings.allowClientSideUpdates = function() {
  var setting = Settings.findOne({"setting": "allowClientSideUpdates"});
  if (typeof setting === 'undefined') {
    return false;
  }
  else {
    return setting.enabled;
  }
};

Template.settings.events({
  'click .toggle-client-side-updates': function() {
    return Meteor.call('toggleClientSideUpdates');
  }
});