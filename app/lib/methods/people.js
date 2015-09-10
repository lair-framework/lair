/* globals Meteor People Matchers check AuthorizeChange _ Models */

Meteor.methods({
  createPerson: createPerson,
  removePerson: removePerson,
  updatePerson: updatePerson
})

function createPerson (id, person) {
  check(id, Matchers.isObjectId)
  check(person, Object)
  check(person.principalName, Matchers.isNonEmptyString)
  check(person.samAccountName, String)
  check(person.distinguishedName, String)
  check(person.firstName, String)
  check(person.lastName, String)
  check(person.middleName, String)
  check(person.displayName, String)
  check(person.department, String)
  check(person.description, String)
  check(person.address, String)
  check(person.lastLogon, String)
  check(person.lastLogoff, String)
  check(person.phones, Array)
  for (var i = 0; i < person.phones.length; i++) {
    check(person.phones[i], String)
  }
  check(person.references, Array)
  for (var j = 0; j < person.references.length; j++) {
    var reference = person.references[j]
    check(reference, Object)
    check(reference.description, String)
    check(reference.username, String)
    check(reference.link, String)
  }
  check(person.emails, Array)
  for (var k = 0; k < person.emails.length; k++) {
    check(person.emails[k], String)
  }
  check(person.groups, Array)
  for (var l = 0; l < person.groups.length; l++) {
    check(person.groups[l], String)
  }
  check(person.loggedIn, Array)
  for (var n = 0; n < person.loggedIn.length; n++) {
    check(person.loggedIn[n], String)
  }
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  if (People.findOne({
    projectId: id,
    principalName: person.principalName
  })) {
    throw new Meteor.Error(400, 'A person with that principle name already exists')
  }
  var p = _.extend(Models.person(), {
    projectId: id,
    principalName: person.principalName,
    samAccountName: person.samAccountName,
    distinguishedName: person.distinguishedName,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    displayName: person.displayName,
    department: person.department,
    description: person.description,
    address: person.address,
    emails: person.emails,
    phones: person.phones,
    groups: person.groups,
    references: person.references,
    lastLogon: person.lastLogon,
    lastLogoff: person.lastLogoff,
    loggedIn: person.loggedIn
  })
  return People.insert(p)
}

function removePerson (id, pid) {
  check(id, Matchers.isObjectId)
  check(pid, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return People.remove({
    _id: pid,
    projectId: id
  })
}

function updatePerson (id, pid, person) {
  check(id, Matchers.isObjectId)
  check(pid, Matchers.isObjectId)
  check(person, Object)
  check(person.principalName, Matchers.isNonEmptyString)
  check(person.samAccountName, String)
  check(person.distinguishedName, String)
  check(person.firstName, String)
  check(person.lastName, String)
  check(person.middleName, String)
  check(person.displayName, String)
  check(person.department, String)
  check(person.description, String)
  check(person.address, String)
  check(person.lastLogon, String)
  check(person.lastLogoff, String)
  check(person.phones, Array)
  for (var i = 0; i < person.phones.length; i++) {
    check(person.phones[i], String)
  }
  check(person.references, Array)
  for (var j = 0; j < person.references.length; j++) {
    var reference = person.references[j]
    check(reference, Object)
    check(reference.description, String)
    check(reference.username, String)
    check(reference.link, String)
  }
  check(person.emails, Array)
  for (var k = 0; k < person.emails.length; k++) {
    check(person.emails[k], String)
  }
  check(person.groups, Array)
  for (var l = 0; l < person.groups.length; l++) {
    check(person.groups[l], String)
  }
  check(person.loggedIn, Array)
  for (var n = 0; n < person.loggedIn.length; n++) {
    check(person.loggedIn[n], String)
  }
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  if (!People.findOne({
    projectId: id,
    principalName: person.principalName
  })) {
    throw new Meteor.Error(400, 'A person with that principle name does not exist')
  }
  var p = _.extend(Models.person(), {
    projectId: id,
    _id: pid,
    principalName: person.principalName,
    samAccountName: person.samAccountName,
    distinguishedName: person.distinguishedName,
    firstName: person.firstName,
    middleName: person.middleName,
    lastName: person.lastName,
    displayName: person.displayName,
    department: person.department,
    description: person.description,
    address: person.address,
    emails: person.emails,
    phones: person.phones,
    groups: person.groups,
    references: person.references,
    lastLogon: person.lastLogon,
    lastLogoff: person.lastLogoff,
    loggedIn: person.loggedIn
  })
  return People.update({
    _id: pid,
    projectId: id
  }, p)
}
