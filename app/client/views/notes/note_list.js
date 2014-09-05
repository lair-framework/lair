// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.noteList.notes = function() {
  var project = Projects.findOne(Session.get('projectId'));
  if (!project) {
    return false;
  }
  return project.notes.sort(sortTitle);
};

Template.noteList.note = function() {
  if (Session.equals('noteTitle', null)) {
    return false;
  }
  var project = Projects.findOne(Session.get('projectId'));
  if (!project) {
    return false;
  }
  return project.notes[_.indexOf(_.pluck(project.notes, 'title'), Session.get('noteTitle'))];
};


Template.noteList.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var content = '';
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value;
      content = tpl.find('[name=content]').value;
      Meteor.call('addProjectNote', Session.get('projectId'), title, content, function(err) {
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
        return Session.set('noteTitle', title);
      });
    }
    else {
      content = tpl.find('[name=content]').value;
      Meteor.call('setProjectNoteContent', projectId, Session.get('noteTitle'), content, function(err){
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        return  Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
      });
    }
  },

  'click .project-note': function() {
    return Session.set('noteTitle', this.title);
  },

  'click #new-note': function() {
    return Session.set('noteTitle', null);
  },

  'click #remove-notes': function() {
    var projectId = Session.get('projectId');
    var noteIds = [];
    var inputs = $('.note-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'));
      }
    });
    noteIds.forEach(function(id) {
      Meteor.call('removeProjectNote', projectId, id);
    });
  }
});
