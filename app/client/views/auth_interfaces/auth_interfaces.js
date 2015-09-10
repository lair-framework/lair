/* globals Template Meteor $*/

Template.authInterfaces.events({
  'click #remove-interfaces': function () {
    var inputs = $('.interface-checked')
    var interfaceIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        interfaceIds.push($(this).attr('id'))
      }
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })

    for (var i = 0; i < interfaceIds.length; i++) {
      var id = interfaceIds[i]
      Meteor.call('removeAuthInterface', this.projectId, id)
    }
  }
})
