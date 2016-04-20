/* globals Template Meteor $ Blob saveAs */

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
  },

  'click #download-hosts': function (event, tpl) {
    var hosts = this.issue.hosts.map(function (host) {
      return host.ipv4 + ':' + host.port.toString()
    })
    var blob = new Blob([hosts.join('\n')], {type: 'text/plain'})
    saveAs(blob, this.issue.title + '_hosts.txt')
  }
})
