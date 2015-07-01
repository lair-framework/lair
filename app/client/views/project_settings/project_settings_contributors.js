/* globals Template Meteor $ */

Template.projectSettingsContributors.events({
  'click #move-users': function () {
    var projectId = this.projectId
    var userIds = []
    var inputs = $('.user-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        userIds.push($(this).attr('id'))
      }
    })
    userIds.forEach(function (id) {
      Meteor.call('addContributor', projectId, id)
    })
  },

  'click #move-contributors': function () {
    var projectId = this.projectId
    var userIds = []
    var inputs = $('.contributor-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        userIds.push($(this).attr('id'))
      }
    })
    userIds.forEach(function (id) {
      Meteor.call('removeContributor', projectId, id)
    })
  }
})
