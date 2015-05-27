/* globals Template Meteor Router Alerts */

Template.newPerson.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var principal = tpl.find('[name=principal]').value
    var self = this
    Meteor.call('createPerson', this.projectId, principal, function (err, res) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/people/' + res)
    })
  }
})
