/* globals Template Meteor $ Alerts Session Epic Projects _*/

Template.notes.rendered = function () {
  Epic.update('### New Note')
}

Template.notes.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var content = tpl.find('[class=epicarea]').value
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value
      Meteor.call('addNote', projectId, title, content, true, function (err) {
        if (err) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: err.reason
          })
          return
        }
        Alerts.insert({
          class: 'alert-success',
          strong: 'Success',
          message: 'Note saved'
        })
        Session.set('noteTitle', title)
        return
      })
    } else {
      Meteor.call('setNoteContent', projectId, Session.get('noteTitle'), content, true, function (err) {
        if (err) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: err.reason
          })
          return
        }
        Alerts.insert({
          class: 'alert-success',
          strong: 'Success',
          message: 'Note saved'
        })
      })
    }
  },

  'click .note': function () {
    Session.set('noteTitle', this.title)
    var project = Projects.findOne({
      _id: Session.get('projectId')
    }, {notes: 1})
    if (!project) {
      return
    }
    var note = project.notes[_.indexOf(_.pluck(project.notes, 'title'), Session.get('noteTitle'))]
    Epic.update(note.content)
  },

  'click #new-note': function () {
    Session.set('noteTitle', null)
    Epic.update('### New Note')
  },

  'click #remove-notes': function () {
    var projectId = this.projectId
    var noteIds = []
    var inputs = $('.note-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'))
      }
    })
    noteIds.forEach(function (id) {
      Meteor.call('removeNote', projectId, id)
    })
  }
})
