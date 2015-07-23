/* globals Router Credentials Projects */

Router.route('/projects/:id/credentials', {
  name: 'credentials',
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
      credentials: Credentials.find({}).fetch()
    }
  }
})

Router.route('/projects/:id/credentials/new', {
  name: 'newCredential',
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

Router.route('/projects/:id/credentials/bulk', {
  name: 'newCredentialBulk',
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
