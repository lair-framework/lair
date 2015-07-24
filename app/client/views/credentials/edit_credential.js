/* globals Template Meteor Alerts Router */

Template.editCredential.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var username = tpl.find('[name=username]').value || ''
    var password = tpl.find('[name=password]').value || ''
    var format = tpl.find('[name=format]').value || ''
    var hash = tpl.find('[name=hash]').value || ''
    var host = tpl.find('[name=host]').value || ''
    var service = tpl.find('[name=service]').value || ''
    var projectId = this.projectId
    Meteor.call('updateCredential', projectId, this.credential._id, username, password, format, hash, host, service, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      return Router.go('/projects/' + projectId + '/credentials')
    })
  }
})
