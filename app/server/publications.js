/* globals Meteor Projects Hosts Services Issues Settings People Credentials */
// TODO: Authorize function.
Meteor.publish('projectListing', function () {
  return Projects.find({
    $or: [{
      owner: this.userId
    }, {
      contributors: this.userId
    }]
  }, {
    fields: {
      name: 1,
      owner: 1,
      contributors: 1,
      createdAt: 1,
      industry: 1,
      description: 1
    }
  })
})

Meteor.publish('project', function (id) {
  if (!this.userId) {
    return []
  }
  return Projects.find({
    _id: id,
    $or: [{
      owner: this.userId
    }, {
      contributors: this.userId
    }]
  })
})

Meteor.publish('people', function (id) {
  if (!this.userId) {
    return []
  }
  return People.find({
    projectId: id
  })
})

Meteor.publish('hosts', function (id) {
  if (!this.userId) {
    return []
  }
  return Hosts.find({
    projectId: id
  })
})

Meteor.publish('ports', function (id) {
  if (!this.userId) {
    return []
  }
  return Services.find({
    projectId: id
  })
})

Meteor.publish('issues', function (id) {
  if (!this.userId) {
    return []
  }
  return Issues.find({
    projectId: id
  })
})

Meteor.publish('credentials', function (id) {
  if (!this.userId) {
    return []
  }
  return Credentials.find({
    projectId: id
  })
})

Meteor.publish('directory', function () {
  if (!this.userId) {
    return []
  }
  return Meteor.users.find({}, {
    fields: {
      emails: 1,
      profile: 1,
      isAdmin: 1
    }
  })
})

Meteor.publish('settings', function () {
  if (!this.userId) {
    return []
  }
  return Settings.find({})
})
