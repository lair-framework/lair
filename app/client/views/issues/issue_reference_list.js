/* globals Template Meteor Alerts $ */

Template.issueReferenceList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var name = tpl.find('[name=name]').value
    var link = tpl.find('[name=link]').value
    tpl.find('[name=name]').value = ''
    tpl.find('[name=link]').value = ''
    Meteor.call('addReference', this.projectId, this.issue._id, link, name, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
      }
    })
  },

  'click #remove-references': function () {
    var projectId = this.projectId
    var issueId = this.issue._id
    var referenceIds = []
    var inputs = $('.reference-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        referenceIds.push({
          name: $(this).attr('data-name'),
          link: $(this).attr('data-link')
        })
      }
    })
    referenceIds.forEach(function (id) {
      Meteor.call('removeReference', projectId, issueId, id.link, id.name)
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
