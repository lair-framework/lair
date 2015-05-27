/* globals Template Meteor Router Alerts */

Template.hostSettings.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var ip = tpl.find('[name=ip-delete]').value
    tpl.find('[name=ip-delete]').value = ''
    if (ip !== this.host.ipv4) {
      Alerts.insert({
        class: 'alert-warning',
        strong: 'Error',
        message: 'IP Address does not match'
      })
      return
    }
    var self = this
    Meteor.call('removeHost', this.projectId, this.host._id, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/hosts')
    })

  }
})
