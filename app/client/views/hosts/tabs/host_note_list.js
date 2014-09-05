// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.hostNoteList.notes = function() {
  var projectId = Session.get('projectId');
  var host = Hosts.findOne(Session.get('hostId'));
  if (!host) {
    return false;
  }
  var ports = Ports.find({"project_id": projectId, "host_id": host._id}).fetch();
  var notes = host.notes;
  ports.forEach(function(port) {
      port.notes.forEach(function(note) {
        var portNote = note;
        portNote.port = port.port;
        portNote.protocol = port.protocol;
        portNote.id = port._id;
        notes.push(portNote);
      });
  });
  return notes.sort(sortTitle);
};

Template.hostNoteList.note = function() {
  if (Session.equals('noteTitle', null)) {
    return false;
  }
  if (Session.equals('portId', null)) {
    var host = Hosts.findOne(Session.get('hostId'));
    if (!host) {
      return false;
    }
    return host.notes[_.indexOf(_.pluck(host.notes, 'title'), Session.get('noteTitle'))];
  } else {
    var port = Ports.findOne({"_id": Session.get('portId'), "host_id": Session.get('hostId')});
    if (!port) {
      return false;
    }
    var p = port.notes[_.indexOf(_.pluck(port.notes, 'title'), Session.get('noteTitle'))];
    p.port = port.port;
    p.protocol = port.protocol;
    p.id = port._id;
    return p;
  }
};


Template.hostNoteList.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var portId = Session.get('portId');
    var content = '';
    if (Session.equals('noteTitle', null)) {
      var title = tpl.find('[name=title]').value;
      var port = tpl.find('[name=port]').value;
      var protocol = tpl.find('[name=protocol]').value;
      content = tpl.find('[name=content]').value;
      if((port !== '' && protocol === '') || (port === '' && protocol !== '')) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Missing required field"});
      }
      if(port !== '') {
        port = parseInt(port);
        if (isNaN(port) || port > 655535 || port < 0) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Invalid port number"});
        }
        port = Ports.findOne({'host_id': hostId, 'port': port, 'protocol': protocol});
        if (!port) {
          return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Service not found for host"});
        }
        Meteor.call('addPortNote', Session.get('projectId'), port._id, title, content, function(err) {
          if (err) {
            return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
          }
          Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
          Session.set('portId', port._id);
          return Session.set('noteTitle', title);
        });
      } else {
        Meteor.call('addHostNote', Session.get('projectId'), Session.get('hostId'), title, content, function(err) {
          if (err) {
            return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
          }
          Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
          return Session.set('noteTitle', title);
        });
      }
    }
    else {
      content = tpl.find('[name=content]').value;
      if(Session.equals('portId', null)) {
        Meteor.call('setHostNoteContent', projectId, hostId, Session.get('noteTitle'), content, function(err){
          if (err) {
            return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
          }
          return  Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
        });
      } else {
        Meteor.call('setPortNoteContent', projectId, portId, Session.get('noteTitle'), content, function(err){
          if (err) {
            return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
          }
          return  Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Note saved"});
        });
      }
    }
  },

  'click .host-note': function() {
    Session.set('portId', null);
    return Session.set('noteTitle', this.title);
  },

  'click .service-note': function() {
    Session.set('portId', this.id);
    return Session.set('noteTitle', this.title);
  },

  'click #new-note': function() {
    Session.set('portId', null);
    return Session.set('noteTitle', null);
  },

  'click #remove-notes': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var noteIds = [];
    var serviceNoteIds = [];
    var inputs = $('.note-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        noteIds.push($(this).attr('id'));
        var portId = $(this).attr('data-port');
      }
    });
    inputs = $('.service-note-checked');
    inputs.each(function(){
      if ($(this).is(':checked')) {
        serviceNoteIds.push({'id': $(this).attr('id'), 'portId': $(this).attr('data-port')});
      }
    });
    noteIds.forEach(function(id) {
      Meteor.call('removeHostNote', projectId, hostId, id);
    });
    serviceNoteIds.forEach(function(data) {
      Meteor.call('removePortNote', projectId, data.portId, data.id);
    });
  }
});
