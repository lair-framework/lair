// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// subscribe to the list of users
Meteor.subscribe('directory');
// subscribe to a list of projects that you own or are a contributor
Meteor.subscribe('projectListing');
// this goes in an autorun because the session variable will change
Deps.autorun(function() {
  Meteor.subscribe('project', Session.get('projectId'));
});
// subscribe to settings
Meteor.subscribe('settings');

//
// setDefault on all session variable definitions
//

// main.js
Session.setDefault('previewProject', null);
Session.setDefault('projectId', null);
Session.setDefault('removeUser', null);

//login
Session.setDefault('loginAlertMessage', null);

// dashboard.js status
Session.setDefault('hostsViewIsActive', null);
Session.setDefault('servicesViewIsActive', null);
Session.setDefault('vulnerabilitiesViewIsActive', null);
Session.setDefault('credentialsViewIsActive', null);
Session.setDefault('notesViewIsActive', null);
Session.setDefault('dashboardListMakerView', null);
Session.setDefault('filesViewIsActive', null);
Session.setDefault('contributorsViewIsActive', null);
Session.setDefault('logViewIsActive', null);
Session.setDefault('chatViewIsActive', null);

// hosts view
Session.setDefault('hostsViewSearchTerm', null);
Session.setDefault('hostsViewHostId', null);
Session.setDefault('hostsViewGreyEnabled', 'enabled');
Session.setDefault('hostsViewBlueEnabled', 'enabled');
Session.setDefault('hostsViewGreenEnabled', 'enabled');
Session.setDefault('hostsViewOrangeEnabled', 'enabled');
Session.setDefault('hostsViewRedEnabled', 'enabled');

// dashboard host view
Session.setDefault('hostsViewNoteTitle', null);
Session.setDefault('hostsViewPortId', null);
Session.setDefault('hostViewOsFingerprint', null);
Session.setDefault('hostViewPortGreyEnabled', 'enabled');
Session.setDefault('hostViewPortBlueEnabled', 'enabled');
Session.setDefault('hostViewPortGreenEnabled', 'enabled');
Session.setDefault('hostViewPortOrangeEnabled', 'enabled');
Session.setDefault('hostViewPortRedEnabled', 'enabled');

// dashboard hosts port view
Session.setDefault('hostsViewPortNoteTitle', null);

// dashboard services view
Session.setDefault('servicesViewQuery', null);

// dashboard vulnerabilities view
Session.setDefault('vulnsViewSearchTerm', null);
Session.setDefault('vulnsViewVulnId', null);
Session.setDefault('vulnsViewGreyEnabled', 'enabled');
Session.setDefault('vulnsViewBlueEnabled', 'enabled');
Session.setDefault('vulnsViewGreenEnabled', 'enabled');
Session.setDefault('vulnsViewOrangeEnabled', 'enabled');
Session.setDefault('vulnsViewRedEnabled', 'enabled');

// dashboard vulnerability view
Session.setDefault('vulnsViewNoteTitle', null);

// dashboard notes view
Session.setDefault('notesViewSearchTerm', null);
Session.setDefault('notesProjectNote', null);
Session.setDefault('notesHostNote', null);
Session.setDefault('notesHostId', null);
Session.setDefault('notesVulnNote', null);
Session.setDefault('notesVulnId', null);
Session.setDefault('notesPortNote', null);
Session.setDefault('notesPortId', null);

// dashboard chat
Session.setDefault('chatMinimized', true);
