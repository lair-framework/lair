/* globals Projects Hosts Services Issues Settings */
var opts = {
  insert: function (userId, doc) {
    return (userId && authorize(doc.projectId, userId))
  },
  update: function (userId, doc) {
    return (userId && authorize(doc.projectId, userId))
  },
  remove: function (userId, doc) {
    return (userId && authorize(doc.projectId, userId))
  },
  fetch: ['projectId']
}

Projects.allow({
  insert: function (userId, doc) {
    var allow = Settings.findOne({setting: 'allowClientSideUpdates', enabled: true})
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  update: function (userId, doc) {
    var allow = Settings.findOne({setting: 'allowClientSideUpdates', enabled: true})
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  remove: function (userId, doc) {
    var allow = Settings.findOne({setting: 'allowClientSideUpdates', enabled: true})
    return (allow && userId && (doc.owner === userId || doc.contributors.indexOf(userId) !== -1))
  },
  fetch: ['owner', 'contributors']
})

Hosts.allow(opts)
Services.allow(opts)
Issues.allow(opts)

function authorize (id, uid) {
  var p = Projects.findOne({_id: id, $or: [{owner: uid}, {contributors: uid}]})
  var allow = Settings.findOne({setting: 'allowClientSideUpdates', enabled: true})
  return (p && allow)
}
