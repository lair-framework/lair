/* globals Router Meteor Template Alerts */

Template.newCredentialBulk.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var csv = tpl.find('[name=csv]').value.split('\n')
    for (var i = 0; i < csv.length; i++) {
      var parts = csv[i].split(',')
      if (parts.length !== 6) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Invalid csv data'
        })
        break
      }
      Meteor.call('createCredential', this.projectId, parts[0], parts[1], parts[2], parts[3], parts[4], parts[5], function (err) {
        if (err) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: 'Invalid csv data'
          })
        }
      })
    }
    Router.go('/projects/' + this.projectId + '/credentials')
  }
})
