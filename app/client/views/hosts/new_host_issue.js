/* globals Template Meteor Router Alerts Issues*/

Template.newHostIssue.onRendered(function () {
  Meteor.typeahead.inject()
})

Template.newHostIssue.helpers({
  justTitles: function () {
    return this.issues.map(function (i) {
      return i.title
    })
  },

  justServices: function () {
    return this.services.map(function (s) {
      return s.port.toString() + '/' + s.protocol
    })
  }
})

Template.newHostIssue.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var title = tpl.find('[name=title]').value
    var service = tpl.find('[name=service]').value
    var parts = service.split('/')
    var port = parseInt(parts[0], 10)
    var protocol = parts[1]
    var self = this
    var issue = Issues.findOne({
      title: title
    }, {
      _id: 1
    })
    if (typeof issue === 'undefined') {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'An issue with that title does not exist'
      })
      return
    }
    var issueId = issue._id
    Meteor.call('addHostToIssue', self.projectId, issueId, self.host.ipv4, port, protocol, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/hosts/' + self.hostId + '/issues')
    })
  }
})
