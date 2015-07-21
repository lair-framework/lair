/* global Router Projects Services Hosts Issues*/

Router.route('/projects/:id/hosts/:hid/services/new', {
  name: 'newService',
  controller: 'ProjectController',
  data: function () {
    return {
      projectId: this.params.id,
      hostId: this.params.hid
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/hosts/' + this.params.hid + '/services/' + this.params.sid + '/issues')
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/issues', {
  name: 'serviceIssueList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid
    })
    if (!service) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    var issues = Issues.find({
      'hosts.ipv4': host.ipv4,
      'hosts.port': service.port,
      'hosts.protocol': service.protocol
    }).fetch()
    return {
      projectId: this.params.id,
      host: host,
      service: service,
      issues: issues
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/notes', {
  name: 'serviceNoteList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid
    })
    if (!service) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    return {
      projectId: this.params.id,
      host: host,
      service: service
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/credentials', {
  name: 'serviceCredentialList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid
    })
    if (!service) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    return {
      projectId: this.params.id,
      host: host,
      service: service
    }
  }

})

Router.route('/projects/:id/hosts/:hid/services/:sid/settings', {
  name: 'serviceSettings',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid
    })
    if (!service) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    return {
      projectId: this.params.id,
      host: host,
      service: service
    }
  }

})
