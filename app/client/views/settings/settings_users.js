/* globals Template Meteor $ */

Template.settingsUsers.events({
  'click #remove-users': function () {
    var inputs = $('.user-checked')
    var userIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        userIds.push($(this).attr('id'))
      }
    })
    userIds.forEach(function (id) {
      Meteor.call('removeLairUser', id)
    })
  }
})
