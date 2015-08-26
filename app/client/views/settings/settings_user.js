/* globals Template Meteor Alerts*/

Template.settingsUser.events({
  'click #toggle-user-admin': function () {
    Meteor.call('toggleLairUserIsAdmin', this.user._id, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },
  'submit form': function (event, tpl) {
    event.preventDefault()
    var newPassword = tpl.find('[name=password]').value
    var confirmPassword = tpl.find('[name=confirm-password]').value
    tpl.find('[name=password]').value = ''
    tpl.find('[name=confirm-password]').value = ''
    if (newPassword !== confirmPassword) {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Passwords did not match'
      })
      return
    }
    Meteor.call('changeLairUserPassword', this.user._id, newPassword, function (err) {
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
        message: 'Password changed'
      })
    })
  }
})
