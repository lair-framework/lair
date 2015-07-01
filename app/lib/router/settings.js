/* globals Router Meteor Settings*/

Router.route('/settings', {
  name: 'settings',
  controller: 'SettingsController',
  data: function () {
    return {
      allowClientSideUpdates: Settings.findOne({
        setting: 'allowClientSideUpdates'
      }),
      persistViewFilters: Settings.findOne({
        setting: 'persistViewFilters'
      })
    }
  }
})

Router.route('/settings/users', {
  name: 'settingsUsers',
  controller: 'SettingsController',
  data: function () {
    var users = Meteor.users.find().fetch().map(function (user) {
      return {
        _id: user._id,
        email: user.emails[0].address
      }
    })
    return {
      users: users
    }
  }
})

Router.route('/settings/users/new', {
  name: 'settingsNewUser',
  controller: 'SettingsController'
})

Router.route('/settings/users/:id', {
  name: 'settingsUser',
  controller: 'SettingsController',
  data: function () {
    var user = Meteor.users.findOne({
      _id: this.params.id
    })
    console.log(user)
    if (!user) {
      return null
    }
    return {
      user: user
    }
  }
})
