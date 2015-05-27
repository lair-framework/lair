/* globals Meteor Alerts Router */
Router.plugin('dataNotFound', {
  notFoundTemplate: 'notFound'
})

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
})

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user()) {
    this.redirect('signin')
  }
  this.next()
}, {
  except: 'signin'
})

Router.onBeforeAction(function () {
  Alerts.remove({})
  this.next()
})
