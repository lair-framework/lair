// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// Inserts the current version number
Meteor.startup(function() {
  Versions.remove({});
  Versions.insert({"version": DOC_VERSION})
});
