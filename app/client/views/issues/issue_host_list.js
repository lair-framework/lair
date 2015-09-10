/* globals Template Meteor $ */

Template.issueHostList.events({
  'click #remove-hosts': function () {
    var projectId = this.projectId
    var issueId = this.issue._id
    var hostIds = []
    var inputs = $('.host-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        hostIds.push($(this).attr('id'))
      }
    })
    hostIds.forEach(function (id) {
      var data = id.split('-')
      Meteor.call('removeHostFromIssue', projectId, issueId, data[0], parseInt(data[1], 10), data[2])
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
