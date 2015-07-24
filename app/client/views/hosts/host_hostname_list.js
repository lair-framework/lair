/* globals Template Meteor $ Alerts */

Template.hostHostnameList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var hostname = tpl.find('[name=hostname]').value
    tpl.find('[name=hostname]').value = ''
    Meteor.call('addHostname', this.projectId, this.hostId, hostname, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click #remove-hostnames': function (event, tpl) {
    var hostnameIds = []
    var inputs = $('.hostname-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        hostnameIds.push($(this).attr('id'))
      }
    })
    for (var i = 0; i < hostnameIds.length; i++) {
      Meteor.call('removeHostname', this.projectId, this.hostId, hostnameIds[i])
    }
  }
})
