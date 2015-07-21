/* globals Router */

Router.route('/info/hotkeys', {
  name: 'hotKeys',
  controller: 'SettingsController',
  data: function () {
    return {
      isInfo: true
    }
  }
})

Router.route('/info', {
  onBeforeAction: function () {
    this.redirect('hotKeys')
    this.next()
  }
})

