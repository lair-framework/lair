/* globals $ Template Meteor Session StatusMap Issues Hosts */

Template.hostIssueList.events({
  'click .flag-enabled': function () {
    Meteor.call('disableIssueFlag', this.projectId, this._id)
  },

  'click .flag-disabled': function () {
    Meteor.call('enableIssueFlag', this.projectId, this._id)
  },

  'click #flag-filter-enable': function () {
    Session.set('hostIssueListFlagFilter', 'enabled')
  },

  'click #flag-filter-disable': function () {
    Session.set('hostIssueListFlagFilter', null)
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
      console.log(issueIds[i])
      var issue = Issues.find({_id:issueIds[i]}).fetch()
      console.log(issue[0].hosts)
      for (var k = 0; k < issue[0].hosts.length; k++) {
        console.log(issue[0].hosts[k])
        if (this.host.ipv4 == issue[0].hosts[k].ipv4){
          console.log('deleted this shit')
          Meteor.call('removeHostFromIssue', this.projectId, issueIds[i], issue[0].hosts[k].ipv4, issue[0].hosts[k].port, issue[0].hosts[k].protocol)
        
        }
      }
    }
  },

  'click #load-more': function () {
    var previousLimit = Session.get('hostIssueViewLimit') || 25
    var newLimit = previousLimit + 25
    Session.set('hostIssueViewLimit', newLimit)
  },

  'click #load-all': function () {
    Session.set('hostIssueViewLimit', 10000)
  }
})
