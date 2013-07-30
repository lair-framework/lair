// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostNoteList.notes = function() {
  var host = Hosts.findOne(Session.get('hostId'));
  if (!host) {
    return false;
  }
  return host.notes.sort(sortTitle);
};

Template.hostNoteList.note = function() {
  if (Session.equals('noteTitle', null)) {
    return false;
  }
  var host = Hosts.findOne(Session.get('hostId'));
  if (!host) {
    return false;
  }
  return host.notes[_.indexOf(_.pluck(host.notes, 'title'), Session.get('noteTitle'))];
};


Template.hostNoteList.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var content = '';
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value;
      content = tpl.find('[name=content]').value;
      Meteor.call('addHostNote', Session.get('projectId'), Session.get('hostId'), title, content, function(err) {
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
        return Session.set('noteTitle', title);
      });
    }
    else {
      content = tpl.find('[name=content]').value;
      Meteor.call('setHostNoteContent', projectId, hostId, Session.get('noteTitle'), content, function(err){
        if (err) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
        }
        return  Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
      });
    }
  },

  'click .host-note': function() {
    return Session.set('noteTitle', this.title);
  },

  'click #new-note': function() {
    return Session.set('noteTitle', null);
  },

  'click #remove-notes': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var noteIds = [];
    var inputs = $('.note-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'));
      }
    });
    noteIds.forEach(function(id) {
      Meteor.call('removeHostNote', projectId, hostId, id);
    });
  }
});
