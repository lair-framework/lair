/* globals Template Meteor Router Alerts */

Template.serviceSettings.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var port = parseInt(tpl.find('[name=service-delete]').value, 10)
    tpl.find('[name=service-delete]').value = ''
    if (port !== this.service.port) {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Port does not match'
      })
      return
    }
    var self = this
    Meteor.call('removeService', this.projectId, this.host._id, this.service._id, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/hosts/' + self.host._id)
    })
  }
})
