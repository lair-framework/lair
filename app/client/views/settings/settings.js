// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
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

Template.settings.persistViewFilters = function() {
  var setting = Settings.findOne({"setting": "persistViewFilters"});
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
  },
  'click .toggle-persist-view-filters': function() {
    return Meteor.call('togglePersistViewFilters');
  }
});
