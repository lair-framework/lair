/* globals Template Meteor $ Session */

Template.netblocks.events({
  'click #remove-netblocks': function () {
    var inputs = $('.netblock-checked')
    var netblockIds = []
    inputs.each(function () {
      if ($(this).is(':checked')) {
        netblockIds.push($(this).attr('id'))
      }
    })

    for (var i = 0; i < netblockIds.length; i++) {
      var id = netblockIds[i]
      Meteor.call('removeNetblock', this.projectId, id)
    }
  },
  'click .netblock-row': function () {
    Session.set('netblocksSelected', this._id)
  }
})
