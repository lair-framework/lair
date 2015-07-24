/* globals Template Session $ Meteor */

Template.peopleList.events({
  'keyup #people-search': function (event, tpl) {
    Session.set('peopleListSearch', tpl.find('#people-search').value)
  },

  'click .person': function () {
    Session.set('peopleListPerson', this._id)
  },

  'click #remove-people': function () {
    var inputs = $('.person-checked')
    var peopleIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        peopleIds.push($(this).attr('id'))
      }
    })
    for (var i = 0; i < peopleIds.length; i++) {
      var id = peopleIds[i]
      Meteor.call('removePerson', this.projectId, id)
    }
  }
})
