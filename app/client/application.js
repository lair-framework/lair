// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// subscribe to the list of users
Meteor.subscribe('directory');
// subscribe to a list of projects that you own or are a contributor
Meteor.subscribe('projectListing');
// this goes in an autorun because the session variable will change
Deps.autorun(function() {
  var count = 0;
  Meteor.subscribe('project', Session.get('projectId'), function() {
    count++;
    loaded();
  });
  Meteor.subscribe('counts', Session.get('projectId'), Session.get('hostQuery'), Session.get('vulnerabilityQuery'), function() {
    count++;
    loaded();
  });
  function loaded() {
    if (count === 2) {
      Session.set('loading', false);
    }
  }
});
// subscribe to settings
Meteor.subscribe('settings');

// dashboard chat
Session.setDefault('chatMinimized', true);

// loading
Session.setDefault('loading', true);

Session.setDefault('hostsViewSkip', 0);
Session.setDefault('hostsViewLimit', 25);
Session.setDefault('vulnerabilityViewSkip', 0);
Session.setDefault('vulnerabilityViewLimit', 25);
