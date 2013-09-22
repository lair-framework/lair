// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.header.projectId = function() {
  return Session.get('projectId');
};

Template.header.projectName = function() {
  return Projects.findOne(Session.get('projectId')).project_name;
};
