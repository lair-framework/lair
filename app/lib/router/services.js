/* global Router Projects Services Hosts Issues Settings Session Credentials*/

Router.route('/projects/:id/hosts/:hid/services/new', {
  name: 'newService',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    return {
      projectId: this.params.id,
      projectName: project.name,
      hostId: this.params.hid
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/hosts/' + this.params.hid + '/services/' + this.params.sid + '/issues', {}, {replaceState: true})
    this.next()
  }
})


Router.route('/projects/:id/hosts/:hid/services/:sid/:page/next', {
  name: 'nextService',
  controller: 'ProjectController',
  onBeforeAction: function () {
    console.log("Executing service next route")
    var next = getNextService(this.params.id, this.params.hid, this.params.sid, 1)
    this.redirect('/projects/' + next.projectId + '/hosts/' + next.hostId + '/services/' + next.serviceId + '/' + this.params.page, {}, {replaceState: true})
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/:page/prev', {
  name: 'prevService',
  controller: 'ProjectController',
  onBeforeAction: function () {
    console.log("Executing service prev route")
    var next = getNextService(this.params.id, this.params.hid, this.params.sid, -1)
    this.redirect('/projects/' + next.projectId + '/hosts/' + next.hostId + '/services/' + next.serviceId + '/' + this.params.page, {}, {replaceState: true})
    this.next()
  }
})


Router.route('/projects/:id/hosts/:hid/services/:sid/issues', {
  name: 'serviceIssueList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('serviceIssueListSearch', null)
    Session.set('serviceIssueListStatusButtongrey', null)
    Session.set('serviceIssueListStatusButtonblue', null)
    Session.set('serviceIssueListStatusButtongreen', null)
    Session.set('serviceIssueListStatusButtonorange', null)
    Session.set('serviceIssueListStatusButtonred', null)
    Session.set('serviceIssueListFlagFilter', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid,
      hostId: this.params.hid
    })
    if (!service) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    var self = this
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: host,
      service: service,
      flagFilter: Session.get('serviceIssueListFlagFilter'),
      serviceIssueStatusButtonActive: function (color) {
        if (Session.equals('serviceIssueListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      issues: function () {
        var query = {
          projectId: self.params.id,
          'hosts.ipv4': host.ipv4,
          'hosts.port': service.port,
          'hosts.protocol': service.protocol,
          status: {
            $in: []
          }
        }
        if (Session.equals('serviceIssueListFlagFilter', 'enabled')) {
          query.isFlagged = true
        }
        if (!Session.equals('serviceIssueListStatusButtongrey', 'disabled')) {
          query.status.$in.push('lair-grey')
        }
        if (!Session.equals('serviceIssueListStatusButtonblue', 'disabled')) {
          query.status.$in.push('lair-blue')
        }
        if (!Session.equals('serviceIssueListStatusButtongreen', 'disabled')) {
          query.status.$in.push('lair-green')
        }
        if (!Session.equals('serviceIssueListStatusButtonorange', 'disabled')) {
          query.status.$in.push('lair-orange')
        }
        if (!Session.equals('serviceIssueListStatusButtonred', 'disabled')) {
          query.status.$in.push('lair-red')
        }
        var search = Session.get('serviceIssueListSearch')
        if (search) {
          query.$or = [
            {statusMessage: {$regex: search, $options: 'i'}},
            {cvss: parseInt(search, 10)},
            {title: {$regex: search, $options: 'i'}},
            {lastModifiedBy: {$regex: search, $options: 'i'}}
          ]
        }
        return Issues.find(query, {
          sort: {
            cvss: -1
          }
        }).fetch()
      },
      total: Issues.find({
        projectId: self.params.id,
        'hosts.ipv4': host.ipv4,
        'hosts.port': service.port,
        'hosts.protocol': service.protocol
      }).count()
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/notes', {
  name: 'serviceNoteList',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('noteTitle', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid,
      hostId: this.params.hid
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
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: host,
      service: service,
      note: function () {
        if (Session.equals('noteTitle', null)) {
          return
        }
        for (var i = 0; i < service.notes.length; i++) {
          if (Session.equals('noteTitle', service.notes[i].title)) {
            return service.notes[i]
          }
        }
      }
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/credentials', {
  name: 'serviceCredentialList',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid,
      hostId: this.params.hid
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
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: host,
      service: service,
      credentials: Credentials.find({
        $or: [{
          host: {
            $in: host.hostnames
          }
        }, {
          host: host.ipv4,
          service: {
            $regex: service.port.toString()
          }
        }]
      }).fetch()
    }
  }
})

Router.route('/projects/:id/hosts/:hid/services/:sid/settings', {
  name: 'serviceSettings',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var service = Services.findOne({
      _id: this.params.sid,
      hostId: this.params.hid
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
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: host,
      service: service
    }
  }
})

function getNextService(projectId, hostId, currentServiceId, increment) {
  var services = Services.find({
    projectId: projectId,
    hostId: hostId
  }, {
    sort: {
      port: 1
    },
    fields: {
      _id: 1
    }
  }).fetch()
  var i = getNextItemIndex(services, currentServiceId, increment)
  var next = {
    projectId: projectId,
    hostId: hostId,
    serviceId: services[i]._id
  }
  return next
}

function getNextItemIndex(idArray, matchId, increment) {
  // Gets the ID of the next item from the array in a circular fashion
  // idArray is expected to be an array of objects returned from a
  // find(...).fetch() operation
  // The returned item index will wrap as necessary to return a valid item (if any are present)
  increment = increment || 1
  var k = _.indexOf(_.pluck(idArray, '_id'), matchId)
  // increment (or decrement) and return a positive index
  k = (((k + increment) % idArray.length) + idArray.length) % idArray.length

  return k
}
