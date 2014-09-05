// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.chat.messages = function() {
  var project = Projects.findOne(Session.get("projectId"));
  if (!project) {
    return [];
  }
  if (!project.messages) {
    return [];
  }
  return project.messages;
};

Template.chat.isChatMinimized = function() {
  return Session.get('chatMinimized');
};

Template.chat.rendered = function() {
  // scroll to the bottom of the div to see the latest messages
  var objDiv = document.getElementById("chat-content");
  objDiv.scrollTop = objDiv.scrollHeight;
  if (Session.equals('chatMinimized', true)) {
    $('#chat-content').hide();
    $('#chat-message').hide();
  }
};

Template.chat.events({
  'click #minimize-chat': function() {
    $('#chat-content').hide();
    $('#chat-message').hide();
    return Session.set('chatMinimized', true);
  },

  'click #expand-chat': function() {
    $('#chat-content').show();
    $('#chat-message').show();
    return Session.set('chatMinimized', false);
  },

  'keyup #chat-new-message': function(event, tpl) {
    if (event.which !== 13 && event.type === 'keyup') {
      return;
    }
    var message = tpl.find('#chat-new-message').value;
    tpl.find('#chat-new-message').value = '';
    message = message.trimRight();
    if (!message) {
      return;
    }
    Meteor.call('addMessage', Session.get('projectId'), message);
  }
});
