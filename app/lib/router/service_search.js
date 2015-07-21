/* globals Projects Router */

Router.route('/projects/:id/services', {
  name: 'serviceSearch',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id
    }
  }
})
