/* globals Template Meteor Alerts Router */

Template.newHost.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var ip = tpl.find('[name=ipv4]').value
    var mac = tpl.find('[name=mac]').value
    var hostname = tpl.find('[name=hostname]').value
    var fingerprint = tpl.find('[name=os]').value
    var projectId = this.projectId
    Meteor.call('createHost', projectId, ip, mac, function (err, res) {
      if (err) {
        return Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
      }
      if (hostname) {
        Meteor.call('addHostname', projectId, res, hostname)
      }
      if (fingerprint) {
        Meteor.call('setOs', projectId, res, 'Manual', fingerprint, 100)
      }
      return Router.go('/project/' + projectId + '/hosts/' + res)
    })
  }
})
