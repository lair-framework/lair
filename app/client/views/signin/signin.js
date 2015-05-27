/* globals Template Meteor Alerts Router */

Template.signin.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var email = tpl.find('[name=email]').value
    var password = tpl.find('[name=password]').value
    Meteor.loginWithPassword(email, password, function (err) {
      if (err) {
        return Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
      Router.go('/')
    })
  }
})
