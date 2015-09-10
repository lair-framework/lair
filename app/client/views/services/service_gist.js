/* globals Template Meteor Alerts StatusMap */

Template.serviceGist.events({
  'submit #service-gist-set-service': function (event, tpl) {
    event.preventDefault()
    var service = tpl.find('[name=service]').value
    tpl.find('[name=service]').value = ''
    Meteor.call('setServiceService', this.projectId, this.service._id, service, function (err, r) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'submit #service-gist-set-product': function (event, tpl) {
    event.preventDefault()
    var product = tpl.find('[name=product]').value
    tpl.find('[name=product]').value = ''
    Meteor.call('setServiceProduct', this.projectId, this.service._id, product, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click .service-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.service.status) + 1]
    if (StatusMap.indexOf(this.service.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setServiceStatus', this.projectId, this.service._id, status)
  },

  'click .flag-enabled': function () {
    Meteor.call('disableServiceFlag', this.projectId, this.service._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableServiceFlag', this.projectId, this.service._id)
  }

})
