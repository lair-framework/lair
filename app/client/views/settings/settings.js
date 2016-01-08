/* globals Template Meteor */

Template.settings.events({
  'click #toggle-client-side-updates': function () {
    return Meteor.call('toggleClientSideUpdates')
  },
  'click #toggle-persist-view-filters': function () {
    return Meteor.call('togglePersistViewFilters')
  },
  'submit #set-view-increment': function (event, tpl) {
    event.preventDefault()
    var num_items = tpl.find('[name=num-items]').value
    Meteor.call('setViewIncrement', num_items, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Alerts.insert({
        class: 'alert-success',
        strong: 'Success',
        message: 'Number of view items changed'
      })

    })
  }
})
