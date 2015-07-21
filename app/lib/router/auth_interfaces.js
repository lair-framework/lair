/* globals Router AuthInterfaces Projects */

Router.route('/projects/:id/authinterfaces', {
  name: 'authInterfaces',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id,
      authInterfaces: AuthInterfaces.find({}).fetch()
    }
  }
})

Router.route('/projects/:id/authinterfaces/new', {
  name: 'newAuthInterface',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id
    }
  }
})
