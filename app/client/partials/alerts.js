/* globals Template Alerts */

Template.alerts.helpers({
  alerts: function () {
    return Alerts.find({}).fetch().map(function (alert) {
      if (alert.message === 'Match failed') {
        alert.message = 'One or more fields are invalid'
      }
      console.log(alert.message)
      if (alert.message[alert.length - 1] !== '!') {
        alert.message += '!'
      }
      return alert
    })
  }
})
