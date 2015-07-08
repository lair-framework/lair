/* globals Template Meteor Alerts Router */

Template.newIssue.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var title = tpl.find('[name=title]').value
    var cvss = parseFloat(tpl.find('[name=cvss]').value)
    var description = tpl.find('[name=description]').value
    var evidence = tpl.find('[name=evidence]').value
    var solution = tpl.find('[name=solution]').value
    var projectId = this.projectId
    Meteor.call('createIssue', projectId, title, cvss, description, evidence, solution, function (err, res) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + projectId + '/issues/' + res)
    })
  }
})
