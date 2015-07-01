/* globals Meteor Template Router Alerts */

Template.settingsNewUser.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var username = tpl.find('[name=email]').value
    var password = tpl.find('[name=password]').value
    var confirmPassword = tpl.find('[name=confirm-password]').value
    var isAdmin = tpl.find('[name=admin]').checked
    if (password !== confirmPassword) {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Passwords do not match'
      })
      return
    }
    Meteor.call('createLairUser', username, password, isAdmin, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason.replace(/\./g, '')
        })
        return
      }
      return Router.go('/settings/users')
    })
  }
})
