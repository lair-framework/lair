/* globals Template Router */

Template.projectSideNav.helpers({
  isActive: function (name) {
    if (typeof Router.current().route !== 'undefined' && Router.current().route.getName() === name) {
      return 'active'
    }
  }
})
