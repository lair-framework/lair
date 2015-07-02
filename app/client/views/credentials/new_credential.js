/* globals Template Meteor Alerts Router */

Template.newCredential.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var username = tpl.find('[name=username]').value || ''
    var password = tpl.find('[name=password]').value || ''
    var hash = tpl.find('[name=hash]').value || ''
    var host = tpl.find('[name=host]').value || ''
    var service = tpl.find('[name=service]').value || ''
    var projectId = this.projectId
    Meteor.call('createCredential', projectId, username, password, hash, host, service, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      return Router.go('/projects/' + projectId + '/credentials')
    })
  }
})
