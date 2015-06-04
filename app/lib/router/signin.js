/* globals Router Meteor */

Router.route('/signin', {
  name: 'signin',
  onBeforeAction: function () {
    Meteor.logout()
    this.next()
  }
})

Router.route('/signout', {
  onBeforeAction: function () {
    Meteor.logout()
    this.redirect('signin')
    this.next()
  }
})
