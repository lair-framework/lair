/* globals Template Meteor Router Alerts */

Template.newService.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var port = parseInt(tpl.find('[name=port]').value, 10)
    var protocol = tpl.find('[name=protocol]').value || 'tcp'
    var service = tpl.find('[name=service]').value || 'Unknown'
    var product = tpl.find('[name=product]').value || 'Unknown'
    var self = this
    Meteor.call('createService', this.projectId, this.hostId, port, protocol, service, product, function (err, res) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/hosts/' + self.hostId + '/services/' + res)
    })
  }
})
