/* globals Template Meteor Alerts */

Template.issueDescription.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var description = tpl.find('[name=description]').value
    Meteor.call('setIssueDescription', this.projectId, this.issue._id, description, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Alerts.insert({
        class: 'alert-success',
        strong: 'Success',
        message: 'Description saved'
      })
    })
  }
})
