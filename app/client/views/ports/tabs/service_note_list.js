// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.serviceNoteList.notes = function() {
  var port = Ports.findOne({"project_id": Session.get('projectId'), "_id": Session.get('portId')});
  if (!port) {
    return false;
  }
  return port.notes.sort(sortTitle);
};

Template.serviceNoteList.note = function() {
  if (Session.equals('noteTitle', null)) {
    return false;
  }
  var port = Ports.findOne({"project_id": Session.get('projectId'), "_id": Session.get('portId')});
  if (!port) {
    return false;
  }
  return port.notes[_.indexOf(_.pluck(port.notes, 'title'), Session.get('noteTitle'))];
};


Template.serviceNoteList.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var content = '';
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value;
      content = tpl.find('[name=content]').value;
      Meteor.call('addPortNote', projectId, portId, title, content, function(err) {
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
        return Session.set('noteTitle', title);
      });
    }
    else {
      content = tpl.find('[name=content]').value;
      Meteor.call('setPortNoteContent', projectId, portId, Session.get('noteTitle'), content, function(err){
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        return  Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
      });
    }
  },

  'click .port-note': function() {
    return Session.set('noteTitle', this.title);
  },

  'click #new-note': function() {
    return Session.set('noteTitle', null);
  },

  'click #remove-notes': function() {
    var projectId = Session.get('projectId');
    var portId = Session.get('portId');
    var noteIds = [];
    var inputs = $('.note-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'));
      }
    });
    noteIds.forEach(function(id) {
      Meteor.call('removePortNote', projectId, portId, id);
    });
  }
});
