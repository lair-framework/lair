// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// subscribe to the list of users
Meteor.subscribe('directory');
// subscribe to a list of projects that you own or are a contributor
Meteor.subscribe('projectListing');
// this goes in an autorun because the session variable will change
Deps.autorun(function() {
  Meteor.subscribe('project', Session.get('projectId'), function() {
    Session.set('loading', false);
  });
  Meteor.subscribe('hosts', Session.get('projectId'), function() {
    Session.set('loading', false);
  });
  Meteor.subscribe('ports', Session.get('projectId'), function() {
    Session.set('loading', false);
  });
  Meteor.subscribe('vulnerabilities', Session.get('projectId'), function() {
    Session.set('loading', false);
  });
});
// subscribe to settings
Meteor.subscribe('settings');

// dashboard chat
Session.setDefault('chatMinimized', true);

// loading
Session.setDefault('loading', true);
