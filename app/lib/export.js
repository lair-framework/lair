// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

prepareExport = function(id) {
  var project = Projects.findOne({_id: id});
  if (typeof project === 'undefined') { 
    return {};
  }
  var hosts = Hosts.find({"project_id": id}).fetch() || [];
  var vulnerabilities = Vulnerabilities.find({"project_id": id}).fetch() || [];
  hosts.forEach(function(host) {
    host.ports = Ports.find({"host_id": host._id}).fetch();
  });
  project.hosts = hosts;
  project.vulnerabilities = vulnerabilities;
  return project;
};
