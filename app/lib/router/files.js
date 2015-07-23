/* globals Router Projects */

Router.route('/projects/:id/files', {
  name: 'files',
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
