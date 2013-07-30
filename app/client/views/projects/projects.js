// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.projects.projects = function() {
  return Projects.find({}, {sort: {project_name: 1}});
};

Template.projects.events({
  'click .project': function() {
    Session.set('projectId', this._id);
  }
});