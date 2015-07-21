/* globals Template Meteor Alerts $*/

Template.authInterfaces.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var kind = tpl.find('[name=kind]').value || ''
    var description = tpl.find('[name=description]').value || ''
    var url = tpl.find('[name=url]').value || ''
    var projectId = this.projectId
    tpl.find('[name=kind]').value = ''
    tpl.find('[name=description]').value = ''
    tpl.find('[name=url]').value = ''
    Meteor.call('createAuthInterface', projectId, kind, url, description, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click #remove-interfaces': function () {
    var inputs = $('.interface-checked')
    var interfaceIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        interfaceIds.push($(this).attr('id'))
      }
    })

    for (var i = 0; i < interfaceIds.length; i++) {
      var id = interfaceIds[i]
      Meteor.call('removeAuthInterface', this.projectId, id)
    }
  }
})
