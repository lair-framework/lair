/* globals Template Meteor $ Alerts */

Template.issueCVEList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var cve = tpl.find('[name=cve]').value
    tpl.find('[name=cve]').value = ''
    Meteor.call('addCVE', this.projectId, this.issue._id, cve, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click #remove-cves': function () {
    var projectId = this.projectId
    var issueId = this.issue._id
    var cveIds = []
    var inputs = $('.cve-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        cveIds.push($(this).attr('id'))
      }
    })
    cveIds.forEach(function (id) {
      Meteor.call('removeCVE', projectId, issueId, id)
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
