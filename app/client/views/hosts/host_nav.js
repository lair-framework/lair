/* globals Template Router */

Template.hostNav.helpers({
  isActive: function (name) {
    if (Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
