/* globals Meteor check Models Projects _ moment Matchers AuthorizeChange */
Meteor.methods({
  createProject: createProject,
  addNote: addNote,
  removeNote: removeNote,
  setNoteContent: setNoteContent
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
