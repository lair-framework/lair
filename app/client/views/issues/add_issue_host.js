/* globals Template Meteor Router Alerts */

Template.addIssueHost.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var ip = tpl.find('[name=ip]').value
    var port = parseInt(tpl.find('[name=port]').value, 10)
    var protocol = tpl.find('[name=protocol]').value
    var self = this
    Meteor.call('addHostToIssue', self.projectId, self.issueId, ip, port, protocol, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/issues/' + self.issueId + '/hosts')
    })
  }
})
