/* globals Template Alerts Session Services Meteor $ */

Template.hostNoteList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var hostId = this.hostId
    var content = tpl.find('[name=content]').value
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value
      var port = tpl.find('[name=port]').value
      var protocol = tpl.find('[name=protocol]').value
      if ((port !== '' && protocol === '') || (port === '' && protocol !== '')) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Missing required field'
        })
        return
      }
      if (port !== '') {
        port = parseInt(port, 10)
        var service = Services.findOne({
          hostId: hostId,
          port: port,
          protocol: protocol
        })
        if (!service) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: 'Service not found for this host'
          })
          return
        }
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
        Meteor.call('addHostNote', projectId, hostId, title, content, function (err) {
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
      }
    } else {
      if (Session.equals('serviceId', null)) {
        Meteor.call('setHostNoteContent', projectId, hostId, Session.get('noteTitle'), content, function (err) {
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
      } else {
        Meteor.call('setServiceNoteContent', projectId, Session.get('serviceId'), Session.get('noteTitle'), content, function (err) {
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
    }
  },

  'click .host-note': function () {
    Session.set('serviceId', null)
    Session.set('noteTitle', this.title)
  },

  'click .service-note': function () {
    Session.set('serviceId', this.serviceId)
    Session.set('noteTitle', this.title)
  },

  'click #new-note': function () {
    Session.set('serviceId', null)
    Session.set('noteTitle', null)
  },

  'click #remove-notes': function () {
    var projectId = this.projectId
    var hostId = this.hostId
    var noteIds = []
    var serviceNoteIds = []
    var inputs = $('.note-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'))
      }
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
    inputs = $('.service-note-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        serviceNoteIds.push({
          id: $(this).attr('id'),
          serviceId: $(this).attr('data-service-id')
        })
      }
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
    noteIds.forEach(function (id) {
      Meteor.call('removeHostNote', projectId, hostId, id)
    })
    serviceNoteIds.forEach(function (data) {
      Meteor.call('removeServiceNote', projectId, data.serviceId, data.id)
    })
  }
})
