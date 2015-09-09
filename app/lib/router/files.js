/* globals Router Projects */

Router.route('/projects/:id/files', {
  name: 'files',
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
      project: project,
      projectName: project.name,
      progress: Session.get('progress')
    }
  }
})
