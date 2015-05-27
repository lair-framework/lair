/* globals Template Session */

Template.peopleList.events({
  'keyup #people-search': function (event, tpl) {
    Session.set('peopleListSearch', tpl.find('#people-search').value)
  }
})
