/* globals Template $ localStorage Alerts FormData btoa */

Template.files.events({
  'click .file-href': function (event) {
    event.preventDefault()
    window.open(this.url)
  },

  'submit form': function (event) {
    event.preventDefault()
    var form = new FormData()
    form.append('file', $('#file-input').get(0).files[0])
    var token = localStorage.getItem('Meteor.loginToken')
    $.ajax({
      type: 'POST',
      url: '/api/projects/' + this.projectId + '/files',
      data: form,
      mimeType: 'mutlipart/form-data',
      headers: {
        Authorization: 'Basic ' + btoa(token + ':' + token)
      },
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      success: function () {
        Alerts.insert({
          class: 'alert-success',
          strong: 'Success',
          message: 'File uploaded successfully'
        })
      },
      error: function (x, status, error) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'There was an error uploading the file'
        })
      }
    })
  }
})
