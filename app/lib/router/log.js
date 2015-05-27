/* globals Projects Router */

Router.route('/projects/:id/log', {
  name: 'log',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      project: Projects.findOne({
        _id: this.params.id
      })
    }
  }
})
