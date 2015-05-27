/* globals Template Router */

Template.sideNav.helpers({
  isActive: function (name) {
    if (Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
