/* globals Meteor HTTP AuthorizeOwner check Models Projects _ moment Matchers AuthorizeChange Hosts Issues Services People WebDirectories AuthInterfaces Netblocks */
Meteor.methods({
  createProject: createProject,
  addNote: addNote,
  removeNote: removeNote,
  setNoteContent: setNoteContent,
  downloadProject: downloadProject,
  exportProject: exportProject,
  removeProject: removeProject,
  addContributor: addContributor,
  removeContributor: removeContributor
})

function createProject (name, industry, description) {
  if (!Meteor.user()) {
    throw new Meteor.Error(430, 'Access Denied')
  }
  check(name, Matchers.isNonEmptyString)
  check(industry, String)
  check(description, String)
  var project = Models.project()
  project = _.extend(project, {
    name: name,
    industry: industry,
    description: description,
    createdAt: moment().format('MM/DD/YYYY'),
    owner: this.userId
  })
  return Projects.insert(project)
}

function addNote (id, title, content) {
  check(id, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  check(content, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var note = _.extend(Models.note(), {
    title: title,
    content: content,
    lastModifiedBy: Meteor.user().emails[0].address
  })
  return Projects.update({
    _id: id
  }, {
    $push: {
      notes: note
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeNote (id, title) {
  check(id, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Projects.update({
    _id: id
  }, {
    $pull: {
      notes: {
        title: title
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setNoteContent (id, title, content) {
  check(id, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  check(content, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Projects.update({
    _id: id,
    'notes.title': title
  }, {
    $set: {
      'notes.$.content': content,
      'notes.$.lastModifiedBy': Meteor.user().emails[0].address,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function prepareExport (id) {
  var project = Projects.findOne({_id: id})
  if (typeof project === 'undefined') {
    return {}
  }
  var hosts = Hosts.find({projectId: id}).fetch() || []
  var issues = Issues.find({projectId: id}).fetch() || []
  hosts.forEach(function (host) {
    host.services = Services.find({hostId: host._id}).fetch()
    host.webDirectories = WebDirectories.find({hostId: host._id}).fetch()
  })
  var people = People.find({projectId: id}).fetch()
  project.hosts = hosts
  project.people = people
  project.issues = issues
  return project
}

function downloadProject (id) {
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  this.unblock()
  check(id, Matchers.isObjectId)
  return prepareExport(id)
}

function exportProject (id, url, username, password) {
  this.unblock()
  check(id, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var project = prepareExport(id)
  var result = null
  try {
    if (username && password) {
      project.username = username
      project.password = password
      result = HTTP.post(url, {data: project})
    } else if (!username && password) {
      project.password = password
      result = HTTP.post(url, {data: project})
    } else if (username && !password) {
      project.username = username
      result = HTTP.post(url, {data: project})
    } else {
      result = HTTP.post(url, {data: project})
    }
    if (result.statusCode !== 200) {
      throw new Meteor.Error(500, 'Non 200 status code returned from server: ' + result.statusCode)
    }
    return result.statusCode
  } catch (e) {
    throw new Meteor.Error(500, 'There was a network error making the request')
  }
}

function removeProject (id) {
  check(id, Matchers.isObjectId)
  if (!AuthorizeOwner(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  Projects.remove({_id: id, owner: this.userId})
  Hosts.remove({projectId: id})
  Services.remove({projectId: id})
  Issues.remove({projectId: id})
  People.remove({projectId: id})
  WebDirectories.remove({projectId: id})
  AuthInterfaces.remove({projectId: id})
  Netblocks.remove({projectId: id})
  return
}

function addContributor (id, uid) {
  check(id, Matchers.isObjectId)
  check(uid, Matchers.isObjectId)
  if (!Meteor.users.findOne(uid)) {
    throw new Meteor.Error(400, 'Could not locate Meteor userId')
  }
  return Projects.update({_id: id, $or: [{owner: this.userId}, {contributors: this.userId}]},
                         {$addToSet: {contributors: uid}})
}

function removeContributor (id, uid) {
  check(id, Matchers.isObjectId)
  check(uid, Matchers.isObjectId)
  if (!Meteor.users.findOne(uid)) {
    throw new Meteor.Error(400, 'Could not locate Meteor userId')
  }
  return Projects.update({_id: id, $or: [{owner: this.userId}, {contributors: this.userId}]},
                         {$pull: {contributors: uid}})
}
