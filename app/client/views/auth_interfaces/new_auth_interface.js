/* globals Template Meteor Alerts Router $*/

Template.newAuthInterface.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var kind = tpl.find('[name=kind]').value || ''
    var description = tpl.find('[name=description]').value || ''
    var url = tpl.find('[name=url]').value || ''
    var isMulti = $('[name=multifactor]').is(':checked')
    var projectId = this.projectId
    Meteor.call('createAuthInterface', projectId, kind, url, description, isMulti, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + projectId + '/authinterfaces')
    })
  }
})
