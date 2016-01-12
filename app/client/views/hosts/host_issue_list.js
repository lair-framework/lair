/* globals $ Template Meteor Session StatusMap */

Template.hostIssueList.events({
  'click .flag-enabled': function () {
    Meteor.call('disableIssueFlag', this.projectId, this.issueId)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableIssueFlag', this.projectId, this.issueId)
  },

  'click #flag-filter-enable': function () {
    Session.set('hostIssueListFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('hostIssueListFlagFilter', null)
  },

  'click .confirm-enabled': function () {
    Meteor.call('unconfirmIssue', this.projectId, this.issueId)
  },

  'click .confirm-disabled': function () {
    Meteor.call('confirmIssue', this.projectId, this.issueId)
  },

  'click .issue-status-button': function (event) {
    var id = 'hostIssueListStatusButton' + event.target.id
    if (Session.equals(id, null) || typeof Session.get(id) === 'undefined') {
      Session.set(id, 'disabled')
      return
    }
    Session.set(id, null)
  },

  'keyup #issue-list-search': function (event, tpl) {
    Session.set('hostIssueListSearch', tpl.find('#issue-list-search').value)
  },

  'click #remove-issue-list-search': function (event, tpl) {
    tpl.find('#issue-list-search').value = ""
    Session.set('hostIssueListSearch', null)
  },

  'click .issue-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.status) + 1]
    if (StatusMap.indexOf(this.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setIssueStatus', this.projectId, this.issueId, status)
  },

  'click #remove-issues': function () {
    var inputs = $('.issue-checked')
    var issuesToRemove = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        var parts = $(this).attr('id').split('-')
        issuesToRemove.push({
          issueId: parts[0],
          port: parseInt(parts[1], 10),
          protocol: parts[2]
        })
      }
    })

    for (var i = 0; i < issuesToRemove.length; i++) {
      var issue = issuesToRemove[i]
      Meteor.call('removeHostFromIssue', this.projectId, issue.issueId, this.host.ipv4, issue.port, issue.protocol)
    }
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
