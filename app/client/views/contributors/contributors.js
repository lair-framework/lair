// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.contributors.users = function () {
  var project = Projects.findOne(Session.get('projectId'));
  var users = Meteor.users.find({$and: [{_id: {$ne: project['owner']}},
    {_id: {$nin: project['contributors']}},
    {_id:  {$ne: Meteor.userId()}}]});
  var ret = [];
  users.forEach(function(u) {
    var user = {
      '_id': u['_id'],
      'email': u['emails'][0]['address']
    };
    ret.push(user);
  });
  return ret;
};

Template.contributors.contributors = function () {
  var project = Projects.findOne(Session.get('projectId'));
  var users = Meteor.users.find({$and: [{_id: {$in: project['contributors']}}, {_id: {$ne: Meteor.userId()}}]});
  var ret = [];
  users.forEach(function(u) {
    var contributor = {
      '_id': u['_id'],
      'email': u['emails'][0]['address']
    };
    ret.push(contributor);
  });
  return ret;
};

Template.contributors.events({
  'click #move-users': function() {
    var projectId = Session.get('projectId');
    var userIds = [];
    var inputs = $('.user-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        userIds.push($(this).attr('id'));
      }
    });
    userIds.forEach(function(id) {
      Meteor.call('addContributor', projectId, id);
    });
  },

  'click #move-contributors': function() {
    var projectId = Session.get('projectId');
    var userIds = [];
    var inputs = $('.contributor-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        userIds.push($(this).attr('id'));
      }
    });
    userIds.forEach(function(id) {
      Meteor.call('removeContributor', projectId, id);
    });
  }
});
