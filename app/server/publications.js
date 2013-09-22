// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// owners and contributors can only see their own projects
Meteor.publish("projectListing", function() {
  return Projects.find({$or: [{owner: this.userId}, {contributors: this.userId}]},
                       {fields: {project_name: 1, owner:1, contributors: 1, creation_date: 1}});
});

// session variable controls the selected project
// returns data from hosts, ports, and vulnerabilities for the selected project
// after verifying that the user is the owner or contributor of the supplied id
Meteor.publish("project", function(id) {
   var project = Projects.findOne(id);
   if (project && (project.owner === this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
     return [Projects.find(id),
             Hosts.find({'project_id': id}),
             Ports.find({'project_id': id}),
             Vulnerabilities.find({'project_id': id})];
   }
   return false;
});

// publish meteor users so you can add contributors
// check if logged in first to avoid user account enumeration
Meteor.publish("directory", function () {
  if (this.userId) {
    return Meteor.users.find({}, {fields: {emails: 1, profile: 1, isAdmin: 1}});
  } else {
    return Meteor.users.find({}, {fields: {createdAd: 1}});
  }
});

// publish settings
Meteor.publish("settings", function() {
  return Settings.find();
});
