// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

var opts = {
  insert: function(userId, doc) {
    return (userId  && authorize(doc.project_id, userId));
  },
  update: function(userId, doc) {
    return (userId  && authorize(doc.project_id, userId));
  },
  remove: function(userId, doc) {
    return (userId  && authorize(doc.project_id, userId));
  },
  fetch: ['project_id']
};

Projects.allow({
  insert: function(userId, doc) {
    var allow = Settings.findOne({"setting": "allowClientSideUpdates", "enabled": true});
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  update: function(userId, doc) {
    var allow = Settings.findOne({"setting": "allowClientSideUpdates", "enabled": true});
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  remove: function(userId, doc) {
    var allow = Settings.findOne({"setting": "allowClientSideUpdates", "enabled": true});
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  fetch: ['owner', 'contributors']
});
Hosts.allow(opts);
Ports.allow(opts);
Vulnerabilities.allow(opts);

function authorize(id, uid) {
  var p = Projects.findOne({"_id": id, $or: [{"owner": uid}, {"contributors": uid}]});
  var allow = Settings.findOne({"setting": "allowClientSideUpdates", "enabled": true});
  return (p && allow);
}
