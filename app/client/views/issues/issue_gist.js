/* globals Template Meteor Alerts StatusMap */

Template.issueGist.events({
  'submit #issue-gist-set-title': function (event, tpl) {
    var title = tpl.find('[name=issue-title]').value
    tpl.find('[name=issue-title]').value = ''
    Meteor.call('setIssueTitle', this.projectId, this.issue._id, title, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'submit #issue-gist-set-cvss': function (event, tpl) {
    var cvss = parseFloat(tpl.find('[name=issue-cvss]').value)
    tpl.find('[name=issue-cvss]').value = ''
    Meteor.call('setIssueCVSS', this.projectId, this.issue._id, cvss, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click .flag-enabled': function () {
    Meteor.call('disableIssueFlag', this.projectId, this.issue._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableIssueFlag', this.projectId, this.issue._id)
  },

  'click .confirm-enabled': function () {
    Meteor.call('unconfirmIssue', this.projectId, this.issue._id)
  },

  'click .confirm-disabled': function () {
    Meteor.call('confirmIssue', this.projectId, this.issue._id)
  },

  'click .issue-status': function () {
    var status = StatusMap[StatusMap.indexOf(this.issue.status) + 1]
    if (StatusMap.indexOf(this.issue.status) === 4) {
      status = StatusMap[0]
    }
    Meteor.call('setIssueStatus', this.projectId, this.issue._id, status)
  }
})
