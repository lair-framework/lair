/* globals $ Template Meteor Session StatusMap */

Template.serviceIssueList.events({
  'click .flag-enabled': function () {
    Meteor.call('disableIssueFlag', this.projectId, this._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableIssueFlag', this.projectId, this._id)
  },

  'click .confirm-enabled': function () {
    Meteor.call('unconfirmIssue', this.projectId, this._id)
  },

  'click .confirm-disabled': function () {
    Meteor.call('confirmIssue', this.projectId, this._id)
  },

  'click #flag-filter-enable': function () {
    Session.set('serviceIssueListFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('serviceIssueListFlagFilter', null)
  },

  'click .issue-status-button': function (event) {
    var id = 'serviceIssueListStatusButton' + event.target.id
    if (Session.equals(id, null) || typeof Session.get(id) === 'undefined') {
      Session.set(id, 'disabled')
      return
    }
    Session.set(id, null)
  },

  'keyup #issue-list-search': function (event, tpl) {
    Session.set('serviceIssueListSearch', tpl.find('#issue-list-search').value)
  },

  'click .issue-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.status) + 1]
    if (StatusMap.indexOf(this.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setIssueStatus', this.projectId, this._id, status)
  },

  'click #remove-issues': function () {
    var inputs = $('.issue-checked')
    var issueIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        issueIds.push($(this).attr('id'))
      }
    })

    for (var i = 0; i < issueIds.length; i++) {
      var issueId = issueIds[i]
      Meteor.call('removeHostFromIssue', this.projectId, issueId, this.host.ipv4, this.service.port, this.service.protocol)
    }
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
