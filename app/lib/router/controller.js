/* globals Meteor RouteController Session Meteor ProjectController SettingsController */
ProjectController = RouteController.extend({ // eslint-disable-line
  onBeforeAction: function () {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      this.redirect('signin', {}, {replaceState: true})
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
      Meteor.subscribe('project', this.params.id),
      Meteor.subscribe('hosts', this.params.id),
      Meteor.subscribe('services', this.params.id),
      Meteor.subscribe('issues', this.params.id),
      Meteor.subscribe('people', this.params.id),
      Meteor.subscribe('credentials', this.params.id),
      Meteor.subscribe('authInterfaces', this.params.id),
      Meteor.subscribe('netblocks', this.params.id),
      Meteor.subscribe('web', this.params.id),
      Meteor.subscribe('directory'),
      Meteor.subscribe('settings')
    ]
  }
})

SettingsController = RouteController.extend({// eslint-disable-line
  onBeforeAction: function () {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      this.redirect('signin', {}, {replaceState: true})
      this.next()
      return
    }
    if (!Meteor.user().isAdmin) {
      this.redirect('/', {}, {replaceState: true})
      this.next()
      return
    }
    this.next()
  },
  waitOn: function () {
    return [
      Meteor.subscribe('directory'),
      Meteor.subscribe('settings')
    ]
  }
})

MeController = RouteController.extend({// eslint-disable-line
  onBeforeAction: function () {
    if (!(Meteor.loggingIn() || Meteor.user())) {
      this.redirect('signin', {}, {replaceState: true})
      this.next()
      return
    }
    this.next()
  },
  waitOn: function () {
    return [
      Meteor.subscribe('directory')
    ]
  }
})
