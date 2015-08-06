/* globals Projects Router Session _ Epic */

Router.route('/projects/:id/notes', {
  name: 'notes',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('noteTitle', null)
    Epic.editorInstances = []
    Epic.editorIds = []
    this.next()
  },
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
      note: function () {
        if (Session.equals('noteTitle', null)) {
          return
        }
        return project.notes[_.indexOf(_.pluck(project.notes, 'title'), Session.get('noteTitle'))]
      }
    }
  }
})
