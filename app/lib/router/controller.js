/* globals Meteor RouteController Session Subs ProjectController SettingsController */
ProjectController = RouteController.extend({ // eslint-disable-line
  onBeforeAction: function () {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      this.redirect('signin')
      this.next()
      return
    }
    this.next()
  },
  onRun: function () {
    if (this.params.id) {
      Session.set('projectId', this.params.id)
    }
    if (this.params.hid) {
      Session.set('hostId', this.params.hid)
    }
    this.next()
  },
  waitOn: function () {
    return [
      Subs.subscribe('project', this.params.id),
      Subs.subscribe('hosts', this.params.id),
      Subs.subscribe('ports', this.params.id),
      Subs.subscribe('issues', this.params.id),
      Subs.subscribe('people', this.params.id),
      Subs.subscribe('credentials', this.params.id),
      Subs.subscribe('authInterfaces', this.params.id),
      Subs.subscribe('directory'),
      Subs.subscribe('settings')
    ]
  }
})

SettingsController = RouteController.extend({// eslint-disable-line
  onBeforeAction: function () {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      this.redirect('signin')
      this.next()
      return
    }
    if (!Meteor.user().isAdmin) {
      this.redirect('/')
      this.next()
      return
    }
    this.next()
  },
  waitOn: function () {
    return [
      Subs.subscribe('directory'),
      Subs.subscribe('settings')
    ]
  }
})
