/* globals Template Router */

Template.projectSettingsNav.helpers({
  isActive: function (name) {
    if (Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
