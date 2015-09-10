/* globals Meteor Template Alerts Router */

Template.newProject.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var name = tpl.find('[name=name]').value
    var industry = tpl.find('[name=industry]').value
    var description = tpl.find('[name=description]').value
    Meteor.call('createProject', name, industry, description, function (err, res) {
      if (err) {
        return Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
      return Router.go('/projects/' + res)
    })
  }
})
