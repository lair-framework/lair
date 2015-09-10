/* globals Meteor Accounts Versions Random DOCVERSION */
Meteor.startup(function () {
  Versions.remove({})
  Versions.insert({
    version: DOCVERSION
  })
  if (Meteor.users.find({}).count() > 0) {
    return
  }
  var password = Random.hexString(15)
  Accounts.createUser({
    email: 'admin@localhost',
    password: password,
    isAdmin: true
  })
  console.log('Created admin@localhost with password ' + password)
})
