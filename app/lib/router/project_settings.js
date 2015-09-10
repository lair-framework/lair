/* globals Router Projects Meteor */

Router.route('/projects/:id/settings', {
  name: 'projectSettings',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id,
      projectName: project.name
    }
  }
})

Router.route('/projects/:id/settings/contributors', {
  name: 'projectSettingsContributors',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var self = this
    var projectUsers = Meteor.users.find({
      $and: [{
        _id: {
          $ne: project.owner
        }
      }, {
        _id: {
          $nin: project.contributors
        }
      }, {
        _id: {
          $ne: Meteor.userId()
        }
      }]
    }).fetch()
    var users = projectUsers.map(function (user) {
      return {
        _id: user._id,
        email: user.emails[0].address
      }
    })
    var projectContributors = Meteor.users.find({
      $and: [{
        _id: {
          $in: project.contributors
        }
      }, {
        _id: {
          $ne: Meteor.userId()
        }
      }]
    }).fetch()
    var contributors = projectContributors.map(function (user) {
      return {
        _id: user._id,
        email: user.emails[0].address
      }
    })
    return {
      projectId: self.params.id,
      projectName: project.name,
      users: users,
      contributors: contributors
    }
  }
})

Router.route('/projects/:id/settings/log', {
  name: 'projectSettingsLog',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    return {
      projectId: this.params.id,
      project: project,
      projectName: project.name
    }
  }
})
