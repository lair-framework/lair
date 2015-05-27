/* globals Template Meteor Alerts StatusMap */

Template.hostGist.events({
  'submit #host-gist-add-tag': function (event, tpl) {
    event.preventDefault()
    var tag = tpl.find('[name=tag]').value
    tpl.find('[name=tag]').value = ''
    Meteor.call('addHostTag', this.projectId, this.host._id, tag, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'submit #host-gist-set-status': function (event, tpl) {
    event.preventDefault()
    var status = tpl.find('[name=status-message]').value
    tpl.find('[name=status-message]').value = ''
    Meteor.call('setHostStatusMessage', this.projectId, this.host._id, status, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-warning',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'submit #host-gist-set-os': function (event, tpl) {
    event.preventDefault()
    var fingerprint = tpl.find('[name=os-fingerprint]').value
    tpl.find('[name=os-fingerprint]').value = ''
    Meteor.call('setOs', this.projectId, this.host._id, 'Manual', fingerprint, 100)
  },

  'click .remove-tag': function (event, tpl) {
    return Meteor.call('removeHostTag', tpl.data.projectId, tpl.data.host._id, this.valueOf())
  },

  'click .host-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.host.status) + 1]
    if (StatusMap.indexOf(this.host.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setHostStatus', this.projectId, this.host._id, status)
  },

  'click .flag-enabled': function () {
    Meteor.call('disableHostFlag', this.projectId, this.host._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableHostFlag', this.projectId, this.host._id)
  }
})
