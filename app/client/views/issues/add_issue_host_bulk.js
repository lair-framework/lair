/* globals Router Meteor Template Alerts */

Template.addIssueHostBulk.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var csv = tpl.find('[name=csv]').value.split('\n')
    for (var i = 0; i < csv.length; i++) {
      var parts = csv[i].split(',')
      if (parts.length !== 3) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Invalid csv data'
        })
        break
      }
      Meteor.call('addHostToIssue', this.projectId, this.issueId, parts[0], parseInt(parts[1], 10), parts[2], function (err) {
        if (err) {
          Alerts.insert({
            class: 'alert-error',
            strong: 'Error',
            message: 'Invalid csv data'
          })
        }
      })
    }
    Router.go('/projects/' + this.projectId + '/issues/' + this.issueId + '/hosts')
  }
})
