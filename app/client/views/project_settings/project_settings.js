/* globals Template Meteor Alerts Blob saveAs Router*/

Template.projectSettings.events({
  'click #download': function (event, tpl) {
    var projectId = this.projectId
    Meteor.call('downloadProject', projectId, function (err, res) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Download failed'
        })
        return
      }
      var blob = new Blob([JSON.stringify(res, null, 4)], {type: 'text/plain;charset=utf-8'})
      saveAs(blob, projectId + '.json')
      Alerts.insert({
        class: 'alert-success',
        strong: 'Success',
        message: 'Download complete'
      })
      return
    })
  },
  'submit form#export': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var url = tpl.find('[name=url]').value
    var username = tpl.find('[name=username]').value
    var password = tpl.find('[name=password]').value
    tpl.find('[name=url]').value = ''
    tpl.find('[name=username]').value = ''
    tpl.find('[name=password]').value = ''
    Meteor.call('exportProject', projectId, url, username, password, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Export Failed'
        })
        return
      }
      Alerts.insert({
        class: 'alert-success',
        strong: 'Success',
        message: 'Export Complete'
      })
      return
    })
  },
  'click #delete': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var submittedId = tpl.find('[name=project-id]').value
    tpl.find('[name=project-id]').value = ''
    if (projectId !== submittedId) {
      Alerts.insert({
        class: 'alert-error',
        strong: 'Error',
        message: 'Project ID not valid'
      })
      return
    }
    Meteor.call('removeProject', projectId, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Could not remove project'
        })
        return
      }
      return Router.go('/projects')
    })
  }
})
