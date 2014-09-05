// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.header.projectId = function() {
  return Session.get('projectId');
};

Template.header.projectName = function() {
  var project = Projects.findOne(Session.get('projectId'));
  if (typeof project === 'undefined') {
    return null;
  } else {
    return project.project_name;
  }
};
