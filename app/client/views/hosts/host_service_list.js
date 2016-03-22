/* globals $ Template Meteor Session StatusMap Services Hosts */

Template.hostServiceList.events({
  'click .flag-enabled': function () {
    Meteor.call('disableServiceFlag', this.projectId, this._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableServiceFlag', this.projectId, this._id)
  },

  'click #flag-filter-enable': function () {
    Session.set('hostServiceListFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('hostServiceListFlagFilter', null)
  },

  'click .service-status-button': function (event) {
    var id = 'hostServiceListStatusButton' + event.target.id
    if (Session.equals(id, null) || typeof Session.get(id) === 'undefined') {
      Session.set(id, 'disabled')
      return
    }
    Session.set(id, null)
  },

  'keyup #service-list-search': function (event, tpl) {
    Session.set('hostServiceListSearch', tpl.find('#service-list-search').value)
  },

  'click #remove-service-list-search': function (event, tpl) {
    tpl.find('#service-list-search').value = ''
    Session.set('hostServiceListSearch', null)
  },

  'click .service-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.status) + 1]
    if (StatusMap.indexOf(this.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setServiceStatus', this.projectId, this._id, status)
  },

  'click #remove-services': function () {
    var inputs = $('.service-checked')
    var serviceIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        serviceIds.push($(this).attr('id'))
      }
    })

    for (var i = 0; i < serviceIds.length; i++) {
      var id = serviceIds[i]
      var service = Services.findOne(id)
      var host = Hosts.findOne(service.hostId)
      Meteor.call('removeService', this.projectId, host._id, id)
    }
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  },

  'click #load-more': function () {
    var viewIncrement = Session.get('viewIncrement') || 25
    var previousLimit = Session.get('hostServiceViewLimit') || viewIncrement
    var newLimit = previousLimit + viewIncrement
    Session.set('hostServiceViewLimit', newLimit)
  },

  'click #load-all': function () {
    Session.set('hostServiceViewLimit', 10000)
  }
})
