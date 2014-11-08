// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission


Meteor.methods({
  // project collections functions
  'addProject': addProject,
  'removeProject': removeProject,
  'exportProject': exportProject,
  'downloadProject': downloadProject,
  'addContributor': addContributor,
  'removeContributor': removeContributor,
  'addProjectNote': addProjectNote,
  'removeProjectNote': removeProjectNote,
  'setProjectNoteContent': setProjectNoteContent,
  'addFile': addFile,
  'removeFile': removeFile,
  'addMessage': addMessage,
  'removeMessages': removeMessages,
  // hosts collection functions
  'addHost': addHost,
  'removeHost': removeHost,
  'setHostStatus': setHostStatus,
  'addHostname': addHostname,
  'removeHostname': removeHostname,
  'addHostTag': addHostTag,
  'removeHostTag': removeHostTag,
  'addHostOs': addHostOs,
  'removeHostOs': removeHostOs,
  'setOsWeight': setOsWeight,
  'addHostNote': addHostNote,
  'removeHostNote': removeHostNote,
  'setHostNoteContent': setHostNoteContent,
  'enableHostFlag': enableHostFlag,
  'disableHostFlag': disableHostFlag,
  // ports collection functions
  'addPort': addPort,
  'removePort': removePort,
  'setPortStatus': setPortStatus,
  'setService': setService,
  'setProduct': setProduct,
  'addCredential': addCredential,
  'removeCredential': removeCredential,
  'addPortNote': addPortNote,
  'removePortNote': removePortNote,
  'setPortNoteContent': setPortNoteContent,
  'enablePortFlag': enablePortFlag,
  'disablePortFlag': disablePortFlag,
  // vulnerabilities collection functions
  'addVulnerability': addVulnerability,
  'addServiceVulnerability': addServiceVulnerability,
  'removeVulnerability': removeVulnerability,
  'setVulnerabilityStatus': setVulnerabilityStatus,
  'setVulnerabilityTitle': setVulnerabilityTitle,
  'setVulnerabilityDescription': setVulnerabilityDescription,
  'setVulnerabilityEvidence': setVulnerabilityEvidence,
  'setVulnerabilitySolution': setVulnerabilitySolution,
  'setVulnerabilityCvss': setVulnerabilityCvss,
  'addVulnerabilityNote': addVulnerabilityNote,
  'removeVulnerabilityNote': removeVulnerabilityNote,
  'setVulnerabilityNoteContent': setVulnerabilityNoteContent,
  'addHostToVulnerability': addHostToVulnerability,
  'removeHostFromVulnerability': removeHostFromVulnerability,
  'removeHostFromVulnerabilities': removeHostFromVulnerabilities,
  'removePortFromVulnerabilities': removePortFromVulnerabilities,
  'enableVulnerabilityFlag': enableVulnerabilityFlag,
  'disableVulnerabilityFlag': disableVulnerabilityFlag,
  'enableVulnerabilityConfirmed': enableVulnerabilityConfirmed,
  'disableVulnerabilityConfirmed': disableVulnerabilityConfirmed,
  'addCve': addCve,
  'removeCve': removeCve,
  'addVulnerabilityTag': addVulnerabilityTag,
  'removeVulnerabilityTag': removeVulnerabilityTag,
  // users
  'createLairUser': createLairUser,
  'removeLairUser': removeLairUser,
  'changeLairUserPassword': changeLairUserPassword,
  // settings
  'toggleClientSideUpdates': toggleClientSideUpdates,
  'togglePersistViewFilters': togglePersistViewFilters
});

//
// The authorization of most, if not all changes to the database
// is dependent on checking if the this.userId is the owner
// or a contributor of the project document. Each document in the
// ports, vulns, or hosts collection will have a "project_id" key.
// Most functions should take as their first argument a project doc id.
// If changing anything besides the project collection be sure to 
// include "project_id": id in your document specifier to prevent
// unauthorized changes. Never allow the client to specify the userid.
//

// convenience function which should be used to authorize a change to
// the hosts, ports, or vulns collection. If changing the projects
// collection, it's not efficient to make this call.
// returns true if authorized, undefined if not.
function authorize(id, uid) {
   return Projects.findOne({"_id": id, $or: [{"owner": uid}, {"contributors": uid}]});
}

function addProject(name, industry, description) {
  if (!Meteor.user()) {
    throw new Meteor.Error(430, 'Access Denied');
  }
  if (typeof name === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof name !== 'string' || !name.match(/^[a-zA-Z0-9\s]+$/)) {
    throw new Meteor.Error(400, 'Invalid project name');
  }
  if (Projects.findOne({"project_name": name, "owner": this.userId})) {
    throw new Meteor.Error(400, 'Duplicate project name');
  }
  var project = models.project();
  if (industry) {
    project.industry = industry;
  }
  if (description) {
    project.description = description;
  }
  project.creation_date = moment().format('MM/DD/YYYY');
  project.project_name = name;
  project.owner = this.userId;
  return Projects.insert(project);
}

function removeProject(id) {
  if (typeof id === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  Projects.remove({"_id": id, "owner": this.userId});
  Hosts.remove({"project_id": id});
  Ports.remove({"project_id": id});
  return Vulnerabilities.remove({"project_id": id});
}

function downloadProject(id) {
  this.unblock();
  if (typeof id === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  return prepareExport(id);
}

function exportProject(id, url, username, password) {
  this.unblock();
  if (typeof id === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  var project = prepareExport(id);
  var result = null;
  if (username && password) {
    project.username = username;
    project.password = password;
    result = HTTP.post(url, {"data": project});
  }
  else if (!username && password) {
    project.password = password;
    result = HTTP.post(url, {"data": project});
  }
  else if (username && !password) {
    project.username = username;
    result = HTTP.post(url, {"data": project});
  }
  else {
    result = HTTP.post(url, {"data": project});
  }
  if (result.statusCode !== 200) {
    throw new Meteor.Error(500, 'Non 200 status code returned from server: ' + result.statusCode);
  }
  return result.statusCode;
}

function addContributor(id, uid) {
  if (typeof id === 'undefined' || typeof uid === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof uid !== 'string' || !uid.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid userId');
  }
  if (!Meteor.users.findOne(uid)) {
    throw new Meteor.Error(400, 'Could not locate Meteor userId');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$addToSet: {"contributors": uid}});
}

function removeContributor(id, uid) {
  if (typeof id === 'undefined' || typeof uid === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof uid !== 'string' || !uid.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid userId');
  }
  if (!Meteor.users.findOne(uid)) {
    throw new Meteor.Error(400, 'Could not locate Meteor userId');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$pull: {"contributors": uid}});
}

function addProjectNote(id, title, content) {
  if (typeof id === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (Projects.findOne({"_id": id, "notes.title": title})) {
    throw new Meteor.Error(400, 'A note with that title already exists');
  }
  var note = models.note();
  if (content) {
    note.content = content;
  }
  note.title = title;
  note.last_modified_by = Meteor.user().emails[0].address;
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$addToSet: {"notes": note}});
}

function removeProjectNote(id, title) {
  if (typeof id === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$pull: { "notes": {"title": title}}});
}

function setProjectNoteContent(id,title, content) {
  if (typeof id === 'undefined' || typeof title === 'undefined' || typeof content === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid note title');
  }
  if (typeof content !== 'string') {
    throw new Meteor.Error(400, 'Invalid note content');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}],
                         "notes.title": title},
                         {$set: {"notes.$.content": content,
                                 "notes.$.last_modified_by": Meteor.user().emails[0].address}});
}

function addFile(id, name, url) {
  if (typeof id === 'undefined' || typeof name === 'undefined' || typeof url === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof name !== 'string' || !name.match(/^[a-zA-Z0-9\._-]+$/)) {
    throw new Meteor.Error(400, 'Invalid file name');
  }
  if (typeof url !== 'string' ||
     !url.match(/^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/)) {
    throw new Meteor.Error(400, 'Invalid url');
  }
  var f = models.file();
  f.name = name;
  f.url = url;
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$addToSet: {"files": f}});
}

function removeFile(id, name, url) {
  if (typeof id === 'undefined' || typeof name === 'undefined' || typeof url === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof name !== 'string' || !name.match(/^[a-zA-Z0-9\._-]+$/)) {
    throw new Meteor.Error(400, 'Invalid file name');
  }
  if (typeof url !== 'string' ||
      !url.match(/^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/)) {
    throw new Meteor.Error(400, 'Invalid url');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$pull: {"files": {"name": name, "url": url}}});
}

function addMessage(id, msg) {
  if (typeof id === 'undefined' || typeof msg === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof msg !== 'string') {
    throw new Meteor.Error(400, 'Invalid message');
  }
  var message = models.message();
  message.user = Meteor.user().emails[0].address.split('@')[0];
  message.message = msg;
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$push: {"messages": message}});
}

function removeMessages(id) {
  if (typeof id === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  return Projects.update({"_id": id, $or: [{"owner": this.userId}, {"contributors": this.userId}]},
                         {$unset: {"messages": ""}});
}

function addHost(id, ip, mac) {
  if (typeof id === 'undefined' || typeof ip === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof ip !== 'string' || !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    throw new Meteor.Error(400, 'Invalid IP Address');
  }
  if (mac && !mac.match(/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/)) {
    throw new Meteor.Error(400, 'Invalid MAC Address');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  if (Hosts.findOne({"string_addr": ip, "project_id": id})) {
    throw new Meteor.Error(400, 'Host with that IP already exists');
  }
  var host = models.host();
  if (mac) {
    host.mac = mac;
  }
  // generate a long int style number and then use mongodb to convert it to a Long object
  host.long_addr = ipUtils.ip2Long(ip);
  host.string_addr = ip;
  host.last_modified_by = Meteor.user().emails[0].address;
  host.project_id = id;
  return Hosts.insert(host);
}

function removeHost(id, hostId) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  Ports.remove({"project_id": id, "host_id": hostId});
  return Hosts.remove({"project_id": id, "_id": hostId});
}

function setHostStatus(id, hostId, status) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof status === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof status !== 'string' || STATUS_MAP.indexOf(status) === -1) {
    throw new Meteor.Error(400, 'Ivalid status');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$set: {"status": status, "last_modified_by": Meteor.user().emails[0].address}});
}

function addHostname(id, hostId, hostname) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof hostname === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof hostname !== 'string') {
    throw new Meteor.Error(400, 'Invalid hostname');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$addToSet: {"hostnames": hostname},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeHostname(id, hostId, hostname) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof hostname === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof hostname !== 'string') {
    throw new Meteor.Error(400, 'Invalid hostname');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$pull: {"hostnames": hostname},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function addHostTag(id, hostId, tag) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof tag === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof tag !== 'string') {
    throw new Meteor.Error(400, 'Invalid tag');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$addToSet: {"tags": tag},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeHostTag(id, hostId, tag) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof tag === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof tag !== 'string') {
    throw new Meteor.Error(400, 'Invalid tag');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$pull: {"tags": tag},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function addHostOs(id, hostId, tool, fingerprint, weight) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof tool === 'undefined' || typeof fingerprint === 'undefined' || typeof weight === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof tool !== 'string' || !tool.match(/^[a-zA-Z0-9\s]+$/)) {
    throw new Meteor.Error(400, 'Invalid OS tool');
  }
  if (typeof fingerprint !== 'string') {
    throw new Meteor.Error(400, 'Invalid OS fingerprint');
  }
  if (isNaN(weight) || weight > 100 || weight < 0) {
    throw new Meteor.Error(400, 'Invalid OS weight');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var os = models.os();
  os.tool = tool;
  os.fingerprint = fingerprint;
  os.weight = weight;
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$addToSet: {"os": os},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeHostOs(id, hostId, tool, fingerprint, weight) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof tool === 'undefined' || typeof fingerprint === 'undefined' || typeof weight === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof tool !== 'string' || !tool.match(/^[a-zA-Z0-9\s]+$/)) {
    throw new Meteor.Error(400, 'Invalid OS tool');
  }
  if (typeof fingerprint !== 'string') {
    throw new Meteor.Error(400, 'Invalid OS fingerprint');
  }
  if (isNaN(weight) || weight > 100 || weight < 0) {
    throw new Meteor.Error(400, 'Invalid OS weight');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var os = models.os();
  os.tool = tool;
  os.fingerprint = fingerprint;
  os.weight = weight;
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$pull: {"os": os},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function setOsWeight(id, hostId, os, weight) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof os === 'undefined' || typeof os.weight === 'undefined' || typeof os.fingerprint === 'undefined' || typeof os.tool === 'undefined' || typeof weight === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (isNaN(weight) || weight > 100 || weight < 0) {
    throw new Meteor.Error(400, 'Invalid Os weight');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId, os: {$elemMatch: {"fingerprint": os.fingerprint, "weight": os.weight, "tool": os.tool}}},
                      {$set: {"os.$.weight": weight, "last_modified_by": Meteor.user().emails[0].address}});
}

function addHostNote(id, hostId, title, content) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid note title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  if (Hosts.findOne({"project_id": id, "_id": hostId, "notes.title": title})) {
    throw new Meteor.Error(400, 'A note with that title already exists for this host');
  }
  var note = models.note();
  note.title = title;
  if (content) {
    note.content = content;
  }
  var email = Meteor.user().emails[0].address;
  note.last_modified_by = email;
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$addToSet: {"notes": note},
                       $set: {"last_modified_by": email}});
}

function removeHostNote(id, hostId, title) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid note title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Hosts.update({"project_id": id, "_id": hostId},
                      {$pull: { "notes": {"title": title}},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function setHostNoteContent(id, hostId, title, content) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof title === 'undefined' || typeof content === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid note title');
  }
  if (typeof content !== 'string') {
    throw new Meteor.Error(400, 'Invalid note content');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var email = Meteor.user().emails[0].address;
  return Hosts.update({"project_id": id, "_id": hostId, "notes.title": title},
                      {$set: {"notes.$.content": content, "notes.$.last_modified_by": email,
                       "last_modified_by": email}});
}

function enableHostFlag(id, hostId) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  var email = Meteor.user().emails[0].address;
  return Hosts.update({"project_id": id, "_id": hostId}, {$set: {"flag": true, "last_modified_by": email}});
}

function disableHostFlag(id, hostId) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  var email = Meteor.user().emails[0].address;
  return Hosts.update({"project_id": id, "_id": hostId}, {$set: {"flag": false, "last_modified_by": email}});
}

function addPort(id, hostId, port, protocol, service, product) {
  if (typeof id === 'undefined' || typeof hostId === 'undefined' || typeof port === 'undefined' || typeof protocol === 'undefined' || typeof service === 'undefined' || typeof product === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof hostId !== 'string' || !hostId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid host id');
  }
  port = parseInt(port);
  if (isNaN(port) || port > 655535 || port < 0) {
    throw new Meteor.Error(400, 'Invalid port number');
  }
  if (typeof protocol !== 'string' || !protocol.match(/^[a-zA-Z]{0,4}$/)) {
    throw new Meteor.Error(400, 'Invalid protocol');
  }
  if (typeof service !== 'string') {
    throw new Meteor.Error(400, 'Invalid service');
  }
  if (typeof product !== 'string') {
    throw new Meteor.Error(400, 'Invalid product');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  if (Ports.findOne({"project_id": id, "host_id": hostId, "port": port, "protocol": protocol})) {
    throw new Meteor.Error(400, 'Duplicate Port');
  }
  var newPort = models.port();
  newPort.project_id = id;
  newPort.host_id = hostId;
  newPort.port = port;
  newPort.protocol = protocol;
  newPort.service = service;
  newPort.product = product;
  newPort.last_modified_by = Meteor.user().emails[0].address;
  return Ports.insert(newPort);
}

function removePort(id, portId) {
  if (typeof id === 'undefined' || typeof portId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id')
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.remove({"project_id": id, "_id": portId});
}

function enablePortFlag(id, portId) {
  if (typeof id === 'undefined' || typeof portId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  var email = Meteor.user().emails[0].address;
  return Ports.update({"project_id": id, "_id": portId}, {$set: {"flag": true, "last_modified_by": email}});
}

function disablePortFlag(id, portId) {
  if (typeof id === 'undefined' || typeof portId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  var email = Meteor.user().emails[0].address;
  return Ports.update({"project_id": id, "_id": portId}, {$set: {"flag": false, "last_modified_by": email}});
}

function setPortStatus(id, portId, status) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof status === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof status !== 'string' || STATUS_MAP.indexOf(status) === -1) {
    throw new Meteor.Error(400, 'Invalid port status');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId},
                      {$set: {"status": status, "last_modified_by": Meteor.user().emails[0].address}});
}

function setService(id, portId, service) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof service === 'undefined') {
    throw new Meteor.Error(400, 'Missing required arugment');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof service !== 'string') {
    throw new Meteor.Error(400, 'Invalid service');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId},
                      {$set: {"service": service, "last_modified_by": Meteor.user().emails[0].address}});
}

function setProduct(id, portId, product) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof product === 'undefined') {
    throw new Meteor.Error(400, 'Missing required arugment');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof product !== 'string') {
    throw new Meteor.Error(400, 'Invalid product');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId},
                      {$set: {"product": product, "last_modified_by": Meteor.user().emails[0].address}});
}

function addCredential(id, portId, username, password, hash) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof username === 'undefined' || typeof password === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof username !== 'string') {
    throw new Meteor.Error(400, 'Invalid username');
  }
  if (typeof password !== 'string') {
    throw new Meteor.Error(400, 'Invalid password');
  }
  if (typeof hash !== 'string') {
    throw new Meteor.Error(400, 'Invalid hash');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  Ports.update({"project_id": id, "_id": portId},
               {$addToSet: {"credentials": {"username": username, "password": password, "hash": hash}},
                $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeCredential(id, portId, username, password) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof username === 'undefined' || typeof password === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof username !== 'string') {
    throw new Meteor.Error(400, 'Invalid username');
  }
  if (typeof password !== 'string') {
    throw new Meteor.Error(400, 'Invalid password');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId},
                      {$pull: {"credentials": {"username": username, "password": password}},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function addPortNote(id, portId, title, content) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  if (Ports.findOne({"project_id": id,  "_id": portId, "notes.title": title})) {
    throw new Meteor.Error(400, 'A note with this title already exists');
  }
  var note = models.note();
  if (content) {
    note.content = content;
  }
  note.title = title;
  note.last_modified_by = Meteor.user().emails[0].address;
  return Ports.update({"project_id": id, "_id": portId},
                      {$push: {"notes": note},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removePortNote(id, portId, title) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId},
                      {$pull: {"notes": {"title": title}},
                       $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function setPortNoteContent(id, portId, title, content) {
  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (typeof content !== 'string') {
    throw new Meteor.Error(400, 'Invalid content');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Ports.update({"project_id": id, "_id": portId, "notes.title": title},
                      {$set: {"notes.$.content": content, "last_modified_by": Meteor.user().emails[0].address}});
}

function addVulnerability(id, title, cvss, description, evidence, solution) {
  if (typeof id === 'undefined' || typeof title === 'undefined' || typeof cvss === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof title !== 'string' || title === "") {
    throw new Meteor.Error(400, 'Invalid title');
  }
  cvss = parseFloat(cvss);
  if (isNaN(cvss) || cvss > 10.0 || cvss < 0.01) {
    throw new Meteor.Error(400, 'Invalid cvss');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var vuln = models.vulnerability();
  vuln.title = title;
  vuln.cvss = cvss;
  vuln.project_id = id;
  vuln.last_modified_by = Meteor.user().emails[0].address;
  vuln.identified_by.push({'tool': 'Manual'});
  var plugin = models.plugin_id(title);
  plugin.tool = 'Manual';
  vuln.plugin_ids.push(plugin);
  if (description) {
    vuln.description = description;
  }
  if (evidence) {
    vuln.evidence = evidence;
  }
  if (solution) {
    vuln.solution = solution;
  }
  return Vulnerabilities.insert(vuln);
}

function addServiceVulnerability(id, portId, title, cvss, description, evidence, solution) {

  if (typeof id === 'undefined' || typeof portId === 'undefined' || typeof title === 'undefined' || typeof cvss === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof portId !== 'string' || !portId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid port id');
  }
  if (typeof title !== 'string' || title === "") {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var port = Ports.findOne({"project_id": id, "_id": portId});
  if (!port) {
    throw new Meteor.Error(400, 'Port not found ' + port);
  }
  var host = Hosts.findOne({"project_id": id, "_id": port.host_id});
  if (!host) {
    throw new Meteor.Error(400, 'Host not found');
  }
  var vuln = Vulnerabilities.findOne({"project_id": id, "title": title});
  if (vuln) {
    return Vulnerabilities.update({"project_id": id, "_id": vuln._id},
                                  {$addToSet: {"hosts": {"string_addr": host.string_addr, "port": port.port, "protocol": port.protocol}},
                                  $set: {"last_modified_by": Meteor.user().emails[0].address}});
  }
  cvss = parseFloat(cvss);
  if (isNaN(cvss) || cvss > 10.0 || cvss < 0.01) {
    throw new Meteor.Error(400, 'Invalid cvss');
  }
  var vuln = models.vulnerability();
  vuln.title = title;
  vuln.cvss = cvss;
  vuln.project_id = id;
  vuln.last_modified_by = Meteor.user().emails[0].address;
  vuln.hosts.push({'string_addr': host.string_addr, 'protocol': port.protocol, 'port': port.port});
  vuln.identified_by.push({'tool': 'Manual'});
  var plugin = models.plugin_id(title);
  plugin.tool = 'Manual';
  vuln.plugin_ids.push(plugin);
  if (description) {
    vuln.description = description;
  }
  if (evidence) {
    vuln.evidence = evidence;
  }
  if (solution) {
    vuln.solution = solution;
  }
  return Vulnerabilities.insert(vuln);
}

function removeVulnerability(id, vulnId) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.remove({"project_id": id, "_id": vulnId});
}

function setVulnerabilityStatus(id, vulnId, status) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof status === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof status !== 'string' || STATUS_MAP.indexOf(status) === -1) {
    throw new Meteor.Error(400, 'Invalid status');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"status": status, "last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilityTitle(id, vulnId, title) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"title": title, "last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilityDescription(id, vulnId, description) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof description === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof description !== 'string') {
    throw new Meteor.Error(400, 'Invalid description');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"description": description,
                                        "last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilityEvidence(id, vulnId, evidence) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof evidence === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof evidence !== 'string') {
    throw new Meteor.Error(400, 'Invalid evidence');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"evidence": evidence, "last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilitySolution(id, vulnId, solution) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof solution === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof solution !== 'string') {
    throw new Meteor.Error(400, 'Invalid solution');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"solution": solution, "last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilityCvss(id, vulnId, cvss) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof cvss === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  cvss = parseFloat(cvss);
  if (isNaN(cvss) || cvss > 10.0 || cvss < 0.1) {
    throw new Meteor.Error(400, 'Invalid cvss');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$set: {"cvss": cvss, "last_modified_by": Meteor.user().emails[0].address}});
}

function addVulnerabilityNote(id, vulnId, title, content) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var note = models.note();
  if (content) {
    note.content = content;
  }
  note.title = title;
  note.last_modified_by = Meteor.user().emails[0].address;
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$push: {"notes": note},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeVulnerabilityNote(id, vulnId, title) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof title === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$pull: {"notes": {"title": title}},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function setVulnerabilityNoteContent(id, vulnId, title, content) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof title === 'undefined' || typeof content === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof title !== 'string') {
    throw new Meteor.Error(400, 'Invalid title');
  }
  if (typeof content !== 'string') {
    throw new Meteor.Error(400, 'Invalid content');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId, "notes.title": title},
                                {$set: {"notes.$.content": content,
                                        "last_modified_by": Meteor.user().emails[0].address}});
}

function addHostToVulnerability(id, vulnId, ip, port, protocol) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof ip === 'undefined' || typeof port === 'undefined' || typeof protocol === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument')
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof ip !== 'string' || !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    throw new Meteor.Error(400, 'Invalid IP Address');
  }
  if (isNaN(port) || port > 655535 || port < 0) {
    throw new Meteor.Error(400, 'Invalid port number');
  }
  if (typeof protocol !== 'string' || !protocol.match(/^[a-zA-Z]{0,4}$/)) {
    throw new Meteor.Error(400, 'Invalid protocol');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var host = Hosts.findOne({"project_id": id, "string_addr": ip}, {fields: {"_id": 1}});
  if (!host) {
    throw new Meteor.Error(400, 'Host not found');
  }
  hostId = host._id;
  if (!Ports.findOne({"project_id": id, "host_id": hostId, "port": port, "protocol": protocol})) {
    throw new Meteor.Error(400, 'Port not found');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$addToSet: {"hosts": {"string_addr": ip, "port": port, "protocol": protocol}},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeHostFromVulnerability(id, vulnId, ip, port, protocol) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof ip === 'undefined' || typeof port === 'undefined' || typeof protocol === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument')
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof ip !== 'string' || !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    throw new Meteor.Error(400, 'Invalid IP Address');
  }
  if (isNaN(port) || port > 655535 || port < 0) {
    throw new Meteor.Error(400, 'Invalid port number');
  }
  if (typeof protocol !== 'string' || !protocol.match(/^[a-zA-Z]{0,4}$/)) {
    throw new Meteor.Error(400, 'Invalid protocol');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$pull: {"hosts": {"string_addr": ip, "port": port, "protocol": protocol}},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function removeHostFromVulnerabilities(id, ip) {
  if (typeof id === 'undefined' || typeof ip === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument')
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof ip !== 'string' || !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    throw new Meteor.Error(400, 'Invalid IP Address');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id},
                                {$pull: {"hosts": {"string_addr": ip}},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}},
                                 {multi: true});
}

function removePortFromVulnerabilities(id, ip, port, protocol) {
  if (typeof id === 'undefined' || typeof ip === 'undefined' || typeof port === 'undefined' || typeof protocol === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument')
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof ip !== 'string' || !ip.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) {
    throw new Meteor.Error(400, 'Invalid IP Address');
  }
  if (isNaN(port) || port > 655535 || port < 0) {
    throw new Meteor.Error(400, 'Invalid port number');
  }
  if (typeof protocol !== 'string' || !protocol.match(/^[a-zA-Z]{0,4}$/)) {
    throw new Meteor.Error(400, 'Invalid protocol');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id},
                                {$pull: {"hosts": {"string_addr": ip, "port": port, "protocol": protocol}},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}},
                                 {multi: true});
}

function addCve(id, vulnId, cve) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof cve === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof cve !== 'string' || !cve.match(/^[0-9]{4}-[0-9]{4}$/)) {
    throw new Meteor.Error(400, 'Invalid cve');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$addToSet: {"cves": cve},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}
 
function removeCve(id, vulnId, cve) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof cve === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof cve !== 'string' || !cve.match(/^[0-9]{4}-[0-9]{4}$/)) {
    throw new Meteor.Error(400, 'Invalid cve');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$pull: {"cves": cve},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function addVulnerabilityTag(id, vulnId, tag) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof tag === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof tag !== 'string') {
    throw new Meteor.Error(400, 'Invalid tag');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$addToSet: {"tags": tag},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}
 
function removeVulnerabilityTag(id, vulnId, tag) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined' || typeof tag === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  if (typeof tag !== 'string') {
    throw new Meteor.Error(400, 'Invalid tag');
  }
  if (!authorize(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  return Vulnerabilities.update({"project_id": id, "_id": vulnId},
                                {$pull: {"tags": tag},
                                 $set: {"last_modified_by": Meteor.user().emails[0].address}});
}

function enableVulnerabilityFlag(id, vulnId) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  var email = Meteor.user().emails[0].address;
  return Vulnerabilities.update({"project_id": id, "_id": vulnId}, {$set: {"flag": true, "last_modified_by": email}});
}

function disableVulnerabilityFlag(id, vulnId) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  var email = Meteor.user().emails[0].address;
  return Vulnerabilities.update({"project_id": id, "_id": vulnId}, {$set: {"flag": false, "last_modified_by": email}});
}

function enableVulnerabilityConfirmed(id, vulnId) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  var email = Meteor.user().emails[0].address;
  return Vulnerabilities.update({"project_id": id, "_id": vulnId}, {$set: {"confirmed": true, "last_modified_by": email}});
}

function disableVulnerabilityConfirmed(id, vulnId) {
  if (typeof id === 'undefined' || typeof vulnId === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid project id');
  }
  if (typeof vulnId !== 'string' || !vulnId.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid vulnerability id');
  }
  var email = Meteor.user().emails[0].address;
  return Vulnerabilities.update({"project_id": id, "_id": vulnId}, {$set: {"confirmed": false, "last_modified_by": email}});
}

function createLairUser(email, password, isAdmin) {
  if (Meteor.users.find().count() !== 0) {
    if (!Meteor.user().isAdmin) {
      throw new Meteor.Error(403, 'Only admins may create new users');
    }
  }
  isAdmin = isAdmin || false;
  if (typeof email === 'undefined'&& typeof password === 'undefined') {
    throw new Meteor.Error(400, 'Missing required argument');
  }
  // the internet told me this matches 99% of email addresses
  if (typeof email !== 'string' || !email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
    throw new Meteor.Error(400, 'Invalid user email');
  }
  if (typeof password !== 'string') {
    throw new Meteor.Error(400, 'Invalid password');
  }
  if (password.length < 10) {
    throw new Meteor.Error(400, 'Passwords must be greater than 9 characters in length');
  }
  if (typeof isAdmin !== 'boolean') {
    throw new Meteor.Error(400, 'Invalid parameter');
  }
  return Accounts.createUser({'email': email, 'password': password, 'isAdmin': isAdmin});

}

function removeLairUser(id) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Only admins may delete users')
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid user id');
  }
  Projects.update({"contributors": id}, {$pull: {"contributors": id}});
  var projects = Projects.find({"owner": id}, {fields: {"_id": 1}}).fetch();
  projects.forEach(function(id) {
    Hosts.remove({"project_id": id});
    Ports.remove({"project_id": id});
    Vulnerabilities.remove({"project_id": id});
  });
  Projects.remove({"owner": id});
  return Meteor.users.remove(id);
}

function changeLairUserPassword(id, password) {
  if (!Meteor.user().isAdmin && id !== this.userId) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  if (typeof id !== 'string' || !id.match(/^[a-zA-Z0-9]{17,24}$/)) {
    throw new Meteor.Error(400, 'Invalid user id');
  }
  if (typeof password !== 'string') {
    throw new Meteor.Error(400, 'Invalid password');
  }
  if (password.length < 10) {
    throw new Meteor.Error(400, 'Passwords must be greater than 9 characters in length');
  }
  return Accounts.setPassword(id, password);
}

function toggleClientSideUpdates() {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var setting = Settings.findOne({"setting": "allowClientSideUpdates"});
  if (typeof setting == 'undefined') {
    return Settings.insert({"setting": "allowClientSideUpdates", "enabled": true});
  }
  else if (setting.enabled === false) {
    return Settings.update({"setting": "allowClientSideUpdates"}, {"$set": {"enabled": true}});
  }
  else {
    return Settings.update({"setting": "allowClientSideUpdates"}, {"$set": {"enabled": false}});
  }
}

function togglePersistViewFilters() {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied');
  }
  var setting = Settings.findOne({"setting": "persistViewFilters"});
  if (typeof setting == 'undefined') {
    return Settings.insert({"setting": "persistViewFilters", "enabled": true});
  }
  else if (setting.enabled === false) {
    return Settings.update({"setting": "persistViewFilters"}, {"$set": {"enabled": true}});
  }
  else {
    return Settings.update({"setting": "persistViewFilters"}, {"$set": {"enabled": false}});
  }
}
