/* globals Template Alerts Session Meteor $ */

Template.serviceNoteList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var service = this.service
    var content = tpl.find('[name=content]').value
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value
      Meteor.call('addServiceNote', projectId, service._id, title, content, function (err) {
        if (err) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: err.reason
          })
          return
        }
        Session.set('noteTitle', title)
      })
    } else {
      Meteor.call('setServiceNoteContent', projectId, service._id, Session.get('noteTitle'), content, function (err) {
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

  'click .service-note': function () {
    Session.set('noteTitle', this.title)
  },

  'click #new-note': function () {
    Session.set('noteTitle', null)
  },

  'click #remove-notes': function () {
    var serviceNoteIds = []
    var inputs = $('.note-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        serviceNoteIds.push($(this).attr('id'))
      }
    })
    for (var i = 0; i < serviceNoteIds.length; i++) {
      Meteor.call('removeServiceNote', this.projectId, this.service._id, serviceNoteIds[i])
    }
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
