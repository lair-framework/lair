// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.droneLog.logs = function() {
  var project = Projects.findOne(Session.get('projectId'));
  if (!project ) {
    return {};
  }
  var l = project.drone_log;
  l.sort();
  l.reverse();
  return l;
};

Template.droneLog.commands = function() {
  var project = Projects.findOne(Session.get('projectId'));
  if (!project ) {
    return {};
  }
  var commands = [];
  project.commands.forEach(function(command){
    commands.push({'tool': command.tool, 'command': command.command});
  });
  return commands;
};
