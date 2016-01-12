/* globals Meteor Alerts Router */
Router.plugin('dataNotFound', {
  notFoundTemplate: 'notFound'
})

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
})

Router.onBeforeAction(function () {
  if (!Meteor.loggingIn() && !Meteor.user()) {
    this.redirect('signin', {}, {replaceState: true})
  }
  this.next()
}, {
  except: 'signin'
})

Router.onBeforeAction(function () {
  Alerts.remove({})
  this.next()
})
