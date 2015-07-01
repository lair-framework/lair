/* globals Meteor Accounts check Matchers Projects Hosts Services Issues WebDirectories */

Meteor.methods({
  createLairUser: createLairUser,
  removeLairUser: removeLairUser,
  changeLairUserPassword: changeLairUserPassword
})

function createLairUser (email, password, isAdmin) {
  if (Meteor.users.find().count() !== 0) {
    if (!Meteor.user().isAdmin) {
      throw new Meteor.Error(403, 'Only admins may create new users')
    }
  }
  isAdmin = isAdmin || false
  check(email, Matchers.isEmail)
  check(password, Matchers.isNonEmptyString)
  return Accounts.createUser({
    email: email,
    password: password,
    isAdmin: isAdmin
  })
}

function removeLairUser (id) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Only admins may delete users')
  }
  check(id, Matchers.isObjectId)
  Projects.update({
    contributors: id
    }, {
      $pull: {
        contributors: id
      }
  })
  var projects = Projects.find({
    owner: id
    }, {
      fields: {
        _id: 1
      }
    }).fetch()
  projects.forEach(function (id) {
    Hosts.remove({projectId: id})
    Services.remove({projectId: id})
    WebDirectories.remove({projectId: id})
    Issues.remove({projectId: id})
  })
  Projects.remove({owner: id})
  return Meteor.users.remove(id)
}

function changeLairUserPassword (id, password) {
  if (!Meteor.user().isAdmin && id !== this.userId) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  check(id, Matchers.isObjectId)
  check(password, Matchers.isNonEmptyString)
  return Accounts.setPassword(id, password)
}
