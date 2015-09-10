/* globals Template Router */

Template.issueNav.helpers({
  isActive: function (name) {
    if (Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
