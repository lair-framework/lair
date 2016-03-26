/* globals Template Meteor Alerts $ Session */

Template.hostWebDirectoryList.events({
  'click .flag-enabled': function () {
    Meteor.call('disableWebDirectoryFlag', this.projectId, this._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableWebDirectoryFlag', this.projectId, this._id)
  },

  'click #flag-filter-enable': function () {
    Session.set('webDirectoryFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('webDirectoryFlagFilter', null)
  },

  'click #remove-paths': function () {
    var projectId = this.projectId
    var inputs = $('.path-checked')
    var paths = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        paths.push($(this).attr('id'))
      }
    })
    for (var i = 0; i < paths.length; i++) {
      Meteor.call('removeWebDirectory', projectId, paths[i])
    }
    inputs.each(function () {
      $(this).prop('checked', false)
    })
    $('#select-all-shown').prop('checked', false)
  },

  'change #select-all-shown': function () {
    if ($('input[name="select-all-shown"]').is(':checked')) {
      $('.path-checked').each(function () {
        $(this).prop('checked', true)
      })
    } else {
      $('.path-checked').each(function () {
        $(this).prop('checked', false)
      })
    }
  },

  'keyup #directory-search': function (event, tpl) {
    Session.set('webDirectorySearch', tpl.find('#directory-search').value)
    $('input[type="checkbox"]').each(function () {
      $(this).removeAttr('checked')
    })
  },

  'click #remove-directory-search': function (event, tpl) {
    tpl.find('#directory-search').value = ''
    Session.set('webDirectorySearch', null)
  },

  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var hostId = this.host._id
    var path = tpl.find('[name=path]').value
    var port = parseInt(tpl.find('[name=port]').value, 10)
    var responseCode = tpl.find('[name=response-code]').value
    Meteor.call('addWebDirectory', projectId, hostId, path, port, responseCode, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      tpl.find('[name=path]').value = ''
      tpl.find('[name=port]').value = ''
      tpl.find('[name=response-code]').value = ''
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
