/* globals Template Meteor Alerts */

Template.issueEvidence.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var evidence = tpl.find('[name=evidence]').value
    Meteor.call('setIssueEvidence', this.projectId, this.issue._id, evidence, function (err) {
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
        message: 'Evidence saved'
      })

    })
  }
})
