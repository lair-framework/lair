/* globals Template Meteor $ Alerts Session */

Template.notes.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var content = tpl.find('[name=content]').value
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value
      Meteor.call('addNote', projectId, title, content, function (err) {
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
      Meteor.call('setNoteContent', projectId, Session.get('noteTitle'), content, function (err) {
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
  },

  'click #new-note': function () {
    Session.set('noteTitle', null)
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
