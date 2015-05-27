/* globals Template Meteor StatusMap Session */
Template.issueList.events({
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
    Session.set('issueListFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('issueListFlagFilter', null)
  },

  'click .issue-status-button': function (event) {
    var id = 'issueListStatusButton' + event.target.id
    if (Session.equals(id, null) || typeof Session.get(id) === 'undefined') {
      Session.set(id, 'disabled')
      return
    }
    Session.set(id, null)
  },

  'keyup #issue-list-search': function (event, tpl) {
    Session.set('issueListSearch', tpl.find('#issue-list-search').value)
  },

  'click .issue-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.status) + 1]
    if (StatusMap.indexOf(this.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setIssueStatus', this.projectId, this._id, status)
  },

  'click #load-more': function () {
    var previouslimit = Session.get('issuesViewLimit') || 25
    var newlimit = previouslimit + 25
    Session.set('issuesViewLimit', newlimit)
  },

  'click #load-all': function () {
    Session.set('issuesViewLimit', 10000)
  }
})
