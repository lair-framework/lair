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
      xhr: function () {
        var xhr = new window.XMLHttpRequest()
        xhr.upload.addEventListener("progress", function (event) {
          if (event.lengthComputable) {
            var percent = (event.loaded / event.total) * 100
            Session.set('progress', percent.toFixed(2))
          }
        }, false)
        return xhr
      },
      cache: false,
      contentType: false,
      processData: false,
      error: function (x, status, error) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'There was an error uploading the file'
        })
      },
      complete: function () {
        Session.set('progress', null)
        $('#file-input').val('')
      }
    })
  },

  'click #remove-files': function (event, tpl) {
    var fileIds = []
    var inputs = $('.file-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        fileIds.push($(this).attr('id'))
      }
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
    var token = localStorage.getItem('Meteor.loginToken')
    for (var i = 0; i < fileIds.length; i++) {
      $.ajax({
        type: 'DELETE',
        async: false,
        url: fileIds[i],
        headers: {
          Authorization: 'Basic ' + btoa(token + ':' + token)
        },
      })
    }
  }
})
