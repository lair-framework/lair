/* globals Meteor AuthInterfaces check _ Models Matchers AuthorizeChange */
Meteor.methods({
  createAuthInterface: createAuthInterface,
  removeAuthInterface: removeAuthInterface
})

function createAuthInterface (id, kind, url, description, isMulti) {
  check(id, Matchers.isObjectId)
  check(kind, String)
  check(url, String)
  check(description, String)
  check(isMulti, Boolean)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var authInterface = _.extend(Models.authInterface(), {
    projectId: id,
    kind: kind,
    url: url,
    description: description,
    isMultifactor: isMulti
  })
  return AuthInterfaces.insert(authInterface)
}

function removeAuthInterface (id, aid) {
  check(id, Matchers.isObjectId)
  check(aid, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return AuthInterfaces.remove({
    projectId: id,
    _id: aid
  })
}
