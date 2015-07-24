/* globals Meteor Credentials check _ Models Matchers AuthorizeChange */
Meteor.methods({
  createCredential: createCredential,
  removeCredential: removeCredential,
  updateCredential: updateCredential
})

function createCredential (id, username, password, format, hash, host, service) {
  check(id, Matchers.isObjectId)
  check(username, String)
  check(password, String)
  check(format, String)
  check(hash, String)
  check(host, String)
  check(service, String)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var credential = _.extend(Models.credential(), {
    projectId: id,
    username: username,
    password: password,
    format: format,
    hash: hash,
    host: host,
    service: service
  })
  return Credentials.insert(credential)
}

function removeCredential (id, cid) {
  check(id, Matchers.isObjectId)
  check(cid, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Credentials.remove({
    projectId: id,
    _id: cid
  })
}

function updateCredential (id, cid, username, password, format, hash, host, service) {
  check(id, Matchers.isObjectId)
  check(cid, Matchers.isObjectId)
  check(username, String)
  check(password, String)
  check(format, String)
  check(hash, String)
  check(host, String)
  check(service, String)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var credential = _.extend(Models.credential(), {
    projectId: id,
    _id: cid,
    username: username,
    password: password,
    format: format,
    hash: hash,
    host: host,
    service: service
  })
  return Credentials.update({
    _id: cid,
    projectId: id
  }, credential)
}
