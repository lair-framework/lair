// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.projects.projects = function() {
  return Projects.find({}, {sort: {project_name: 1}}).fetch();
};

Template.projects.events({
  'click .project': function() {
    Session.set('loading', true);
    Session.set('projectId', this._id);
  }
});
