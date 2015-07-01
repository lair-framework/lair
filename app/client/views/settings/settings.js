/* globals Template Meteor */

Template.settings.events({
  'click #toggle-client-side-updates': function () {
    return Meteor.call('toggleClientSideUpdates')
  },
  'click #toggle-persist-view-filters': function () {
    return Meteor.call('togglePersistViewFilters')
  }
})
