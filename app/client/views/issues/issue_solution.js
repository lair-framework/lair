/* globals Template Meteor Alerts */

Template.issueSolution.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var solution = tpl.find('[name=solution]').value
    Meteor.call('setIssueSolution', this.projectId, this.issue._id, solution, function (err) {
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
        message: 'Solution saved'
      })
    })
  }
})
