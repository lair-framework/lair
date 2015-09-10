/* globals Template Meteor Alerts Router */

Template.issueSettings.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var title = tpl.find('[name=title-delete]').value
    tpl.find('[name=title-delete]').value = ''
    if (title !== this.issue.title) {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Title does not match'
      })
      return
    }
    var self = this
    Meteor.call('removeIssue', self.projectId, self.issue._id, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/issues')
    })
  }
})
