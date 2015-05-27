/* globals Meteor People Matchers check AuthorizeChange _ Models */

Meteor.methods({
  createPerson: createPerson
})

function createPerson (id, principalName) {
  check(id, Matchers.isObjectId)
  check(principalName, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  if (People.findOne({
    projectId: id,
    principalName: principalName
  })) {
    throw new Meteor.Error(400, 'A person with that principle name already exists')
  }
  var person = _.extend(Models.person(), {
    projectId: id,
    principalName: principalName
  })
  return People.insert(person)
}
