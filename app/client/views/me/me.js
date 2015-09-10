/* globals Template Alerts Accounts */

Template.me.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var oldPassword = tpl.find('[name=old-password]').value
    var newPassword = tpl.find('[name=password]').value
    var confirmPassword = tpl.find('[name=confirm-password]').value

    tpl.find('[name=old-password]').value = ''
    tpl.find('[name=password]').value = ''
    tpl.find('[name=confirm-password]').value = ''

    if (newPassword !== confirmPassword) {
      return Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Passwords did not match'
      })
    }
    Accounts.changePassword(oldPassword, newPassword, function (err) {
      if (err) {
        return Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
      Alerts.insert({
        class: 'alert-success',
        strong: 'Success',
        message: 'Password changed'
      })
    })
  }
})
