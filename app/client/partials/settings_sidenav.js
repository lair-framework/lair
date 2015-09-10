/* globals Template Router */

Template.settingsSideNav.helpers({
  isActive: function (name) {
    if (Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
