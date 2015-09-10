/* globals Template Meteor $ Alerts Session */

Template.issueNoteList.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var projectId = this.projectId
    var issueId = this.issue._id
    var content = tpl.find('[name=content]').value
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value
      Meteor.call('addIssueNote', projectId, issueId, title, content, function (err) {
        if (err) {
          Alerts.insert({
          })
          return
        }
        Alerts.insert({
        })
        Session.set('noteTitle', title)
        return
      })
    } else {
      Meteor.call('setIssueNoteContent', projectId, issueId, Session.get('noteTitle'), content, function (err) {
        if (err) {
          Alerts.insert({
          })
          return
        }
        Alerts.insert({
        })
      })
    }
  },

  'click .issue-note': function () {
    Session.set('noteTitle', this.title)
  },

  'click #new-note': function () {
    Session.set('noteTitle', null)
  },

  'click #remove-notes': function () {
    var projectId = this.projectId
    var issueId = this.issue._id
    var noteIds = []
    var inputs = $('.note-checked')
    inputs.each(function () {
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'))
      }
    })
    noteIds.forEach(function (id) {
      Meteor.call('removeIssueNote', projectId, issueId, id)
    })
    inputs.each(function () {
      $(this).prop('checked', false)
    })
  }
})
