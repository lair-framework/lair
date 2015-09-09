/* globals Router AuthInterfaces Projects */

Router.route('/projects/:id/authinterfaces', {
  name: 'authInterfaces',
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
      projectName: project.name,
      authInterfaces: AuthInterfaces.find({}).fetch()
    }
  }
})

Router.route('/projects/:id/authinterfaces/new', {
  name: 'newAuthInterface',
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
