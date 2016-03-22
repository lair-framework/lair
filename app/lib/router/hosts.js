/* globals Projects Router Hosts Session Settings Services _ Credentials Issues WebDirectories */

Router.route('/projects/:id/hosts', {
  name: 'hostList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('viewIncrement', 25)
    Session.set('hostViewLimit', 25)
    Session.set('hostListSearch', null)
    Session.set('hostListStatusButtongrey', null)
    Session.set('hostListStatusButtonblue', null)
    Session.set('hostListStatusButtongreen', null)
    Session.set('hostListStatusButtonorange', null)
    Session.set('hostListStatusButtonred', null)
    Session.set('hostListFlagFilter', null)
    this.next()
  },
  data: function () {
    // Handle updating of the number of items to view by default
    var numViewItems = 25
    var numViewItemsSetting = Settings.findOne({setting: 'numViewItems'})
    if (numViewItemsSetting) {
      numViewItems = numViewItemsSetting.value
    }
    if (Session.get('hostViewLimit') === Session.get('viewIncrement')) {
      Session.set('hostViewLimit', numViewItems)
    } else if (Session.get('hostViewLimit') < numViewItems) {
      Session.set('hostViewLimit', numViewItems)
    }
    Session.set('viewIncrement', numViewItems)

    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var total = Hosts.find({
      projectId: this.params.id
    }).count()
    var search = Session.get('hostListSearch')
    var self = this
    return {
      moreToShow: function () {
        return total > Session.get('hostViewLimit')
      },
      flagFilter: Session.get('hostListFlagFilter'),
      total: total,
      projectId: self.params.id,
      projectName: project.name,
      savedSearch: search,
      hostStatusButtonActive: function (color) {
        if (Session.equals('hostListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      hosts: function () {
        var limit = Session.get('hostViewLimit') || Session.get('viewIncrement') || 25
        var query = {
          projectId: self.params.id,
          status: {
            $in: []
          }
        }
        if (Session.equals('hostListFlagFilter', 'enabled')) {
          query.isFlagged = true
        }
        if (!Session.equals('hostListStatusButtongrey', 'disabled')) {
          query.status.$in.push('lair-grey')
        }
        if (!Session.equals('hostListStatusButtonblue', 'disabled')) {
          query.status.$in.push('lair-blue')
        }
        if (!Session.equals('hostListStatusButtongreen', 'disabled')) {
          query.status.$in.push('lair-green')
        }
        if (!Session.equals('hostListStatusButtonorange', 'disabled')) {
          query.status.$in.push('lair-orange')
        }
        if (!Session.equals('hostListStatusButtonred', 'disabled')) {
          query.status.$in.push('lair-red')
        }
        var search = Session.get('hostListSearch')
        if (search) {
          query.$or = [
            {ipv4: {$regex: search, $options: 'i'}},
            {statusMessage: {$regex: search, $options: 'i'}},
            {'os.fingerprint': {$regex: search, $options: 'i'}},
            {hostnames: {$regex: search, $options: 'i'}},
            {lastModifiedBy: {$regex: search, $options: 'i'}},
            {tags: search}
          ]
        }
        return Hosts.find(query, {
          sort: {
            longIpv4Addr: 1
          },
          limit: limit
        }).fetch()
      }
    }
  }
})

Router.route('/projects/:id/hosts/new', {
  name: 'newHost',
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
      projectName: project.name
    }
  }
})

Router.route('/projects/:id/hosts/:hid', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/hosts/' + this.params.hid + '/services', {}, {replaceState: true})
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/:page/next', {
  name: 'nextHost',
  controller: 'ProjectController',
  onBeforeAction: function () {
    var next = getNextHost(this.params.id, this.params.hid, 1)
    this.redirect('/projects/' + next.projectId + '/hosts/' + next.hostId + '/' + this.params.page, {}, {replaceState: true})
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/:page/prev', {
  name: 'prevHost',
  controller: 'ProjectController',
  onBeforeAction: function () {
    var next = getNextHost(this.params.id, this.params.hid, -1)
    this.redirect('/projects/' + next.projectId + '/hosts/' + next.hostId + '/' + this.params.page, {}, {replaceState: true})
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/services', {
  name: 'hostServiceList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('viewIncrement', 25)
    Session.set('hostServiceViewLimit', 25)
    Session.set('hostServiceListSearch', null)
    Session.set('hostServiceListStatusButtongrey', null)
    Session.set('hostServiceListStatusButtonblue', null)
    Session.set('hostServiceListStatusButtongreen', null)
    Session.set('hostServiceListStatusButtonorange', null)
    Session.set('hostServiceListStatusButtonred', null)
    Session.set('hostServiceListFlagFilter', null)
    this.next()
  },
  data: function () {
    // Handle updating of the number of items to view by default
    var numViewItems = 25
    var numViewItemsSetting = Settings.findOne({setting: 'numViewItems'})
    if (numViewItemsSetting) {
      numViewItems = numViewItemsSetting.value
    }
    if (Session.get('hostServiceViewLimit') === Session.get('viewIncrement')) {
      Session.set('hostServiceViewLimit', numViewItems)
    } else if (Session.get('hostServiceViewLimit') < numViewItems) {
      Session.set('hostServiceViewLimit', numViewItems)
    }
    Session.set('viewIncrement', numViewItems)

    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    if (Hosts.find({
      _id: this.params.hid
    }).count() < 1) {
      return null
    }
    var total = Services.find({
      projectId: this.params.id,
      hostId: this.params.hid
    }).count()
    var search = Session.get('hostServiceListSearch')
    var self = this
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      hostId: this.params.hid,
      savedSearch: search,
      host: Hosts.findOne({
        _id: this.params.hid
      }),
      total: total,
      moreToShow: function () {
        return total > Session.get('hostServiceViewLimit')
      },
      flagFilter: Session.get('hostServiceListFlagFilter'),
      serviceStatusButtonActive: function (color) {
        if (Session.equals('hostServiceListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      services: function () {
        var limit = Session.get('hostServiceViewLimit') || Session.get('viewIncrement') || 25
        var query = {
          projectId: self.params.id,
          hostId: self.params.hid,
          status: {
            $in: []
          }
        }
        if (Session.equals('hostServiceListFlagFilter', 'enabled')) {
          query.isFlagged = true
        }
        if (!Session.equals('hostServiceListStatusButtongrey', 'disabled')) {
          query.status.$in.push('lair-grey')
        }
        if (!Session.equals('hostServiceListStatusButtonblue', 'disabled')) {
          query.status.$in.push('lair-blue')
        }
        if (!Session.equals('hostServiceListStatusButtongreen', 'disabled')) {
          query.status.$in.push('lair-green')
        }
        if (!Session.equals('hostServiceListStatusButtonorange', 'disabled')) {
          query.status.$in.push('lair-orange')
        }
        if (!Session.equals('hostServiceListStatusButtonred', 'disabled')) {
          query.status.$in.push('lair-red')
        }
        var search = Session.get('hostServiceListSearch')
        if (search) {
          query.$or = [
            {statusMessage: {$regex: search, $options: 'i'}},
            {port: parseInt(search, 10)},
            {protocol: {$regex: search, $options: 'i'}},
            {product: {$regex: search, $options: 'i'}},
            {service: {$regex: search, $options: 'i'}},
            {lastModifiedBy: {$regex: search, $options: 'i'}}
          ]
        }
        return Services.find(query, {
          sort: {
            port: 1
          },
          limit: limit
        }).fetch()
      }
    }
  }
})

Router.route('/projects/:id/hosts/:hid/notes', {
  name: 'hostNoteList',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('noteTitle', null)
    Session.set('serviceId', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    var services = Services.find({
      hostId: host._id
    }).fetch()
    if (services) {
      for (var i = 0; i < services.length; i++) {
        var service = services[i]
        if (!service.notes) {
          continue
        }
        for (var j = 0; j < service.notes.length; j++) {
          var note = _.extend(service.notes[j], {
            serviceId: service._id,
            port: service.port,
            protocol: service.protocol
          })
          host.notes.push(note)
        }
      }
    }
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      hostId: this.params.hid,
      host: host,
      notes: host.notes,
      note: function () {
        if (Session.equals('noteTitle', null)) {
          return
        }
        if (Session.equals('serviceId', null)) {
          return host.notes[_.indexOf(_.pluck(host.notes, 'title'), Session.get('noteTitle'))]
        }
        var service = Services.findOne({
          _id: Session.get('serviceId')
        })
        if (!service) {
          return
        }
        return _.extend(service.notes[_.indexOf(_.pluck(service.notes, 'title'), Session.get('noteTitle'))], {
          serviceId: service._id,
          port: service.port,
          protocol: service.protocol
        })
      }
    }
  }
})

Router.route('/projects/:id/hosts/:hid/issues', {
  name: 'hostIssueList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('hostIssueListSearch', null)
    Session.set('hostIssueListStatusButtongrey', null)
    Session.set('hostIssueListStatusButtonblue', null)
    Session.set('hostIssueListStatusButtongreen', null)
    Session.set('hostIssueListStatusButtonorange', null)
    Session.set('hostIssueListStatusButtonred', null)
    Session.set('hostIssueListFlagFilter', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    var ipv4 = host.ipv4
    var query = {
      projectId: this.params.id,
      hosts: {
        $elemMatch: {ipv4: ipv4}
      },
      status: {
        $in: []
      }
    }
    if (Session.equals('hostIssueListFlagFilter', 'enabled')) {
      query.isFlagged = true
    }
    if (!Session.equals('hostIssueListStatusButtongrey', 'disabled')) {
      query.status.$in.push('lair-grey')
    }
    if (!Session.equals('hostIssueListStatusButtonblue', 'disabled')) {
      query.status.$in.push('lair-blue')
    }
    if (!Session.equals('hostIssueListStatusButtongreen', 'disabled')) {
      query.status.$in.push('lair-green')
    }
    if (!Session.equals('hostIssueListStatusButtonorange', 'disabled')) {
      query.status.$in.push('lair-orange')
    }
    if (!Session.equals('hostIssueListStatusButtonred', 'disabled')) {
      query.status.$in.push('lair-red')
    }
    var search = Session.get('hostIssueListSearch')
    if (search) {
      query.$or = [
        {statusMessage: {$regex: search, $options: 'i'}},
        {cvss: parseInt(search, 10)},
        {protocol: {$regex: search, $options: 'i'}},
        {port: {$regex: search, $options: 'i'}},
        {title: {$regex: search, $options: 'i'}},
        {lastModifiedBy: {$regex: search, $options: 'i'}}
      ]
    }
    var self = this
    var issues = []
    Issues.find(query, {
      sort: {
        cvss: -1
      }
    }).fetch().forEach(function (issue) {
      issue.hosts.forEach(function (h) {
        if (h.ipv4 !== host.ipv4) {
          return
        }
        var service = Services.findOne({
          hostId: host._id,
          port: h.port,
          protocol: h.protocol
        })
        if (!service) {
          return
        }
        h.serviceId = service._id
        h.hostId = host._id
        issues.push({
          projectId: self.params.id,
          issueId: issue._id,
          title: issue.title,
          cvss: issue.cvss,
          rating: issue.rating,
          lastModifiedBy: issue.lastModifiedBy,
          isFlagged: issue.isFlagged,
          isConfirmed: issue.isConfirmed,
          status: issue.status,
          host: h
        })
      })
    })
    var total = 0
    Issues.find({
      projectId: this.params.id,
      hosts: {
        $elemMatch: {ipv4: ipv4}
      }
    }).fetch().forEach(function (i) {
      total += i.hosts.length
    })

    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      hostId: this.params.hid,
      host: host,
      flagFilter: Session.get('hostIssueListFlagFilter'),
      issueStatusButtonActive: function (color) {
        if (Session.equals('hostIssueListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      issues: issues,
      savedSearch: search,
      total: total
    }
  }
})

Router.route('/projects/:id/hosts/:hid/hostnames', {
  name: 'hostHostnameList',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var host = Hosts.findOne(this.params.hid)
    if (!host) {
      return null
    }
    var linkList = []
    var names = host.hostnames
    var query = {
      projectId: this.params.id,
      hostId: this.params.hid,
      service: {
        $regex: 'web|www|ssl|http|https',
        $options: 'i'
      }
    }
    var services = Services.find(query).fetch()
    for (var i = 0; i < services.length; i++) {
      var protocol = 'http://'
      var service = services[i]
      if (service.service.match(/(ssl|https)/gi) || service.port === 443 || service.port === 8443) {
        protocol = 'https://'
      }
      linkList.push(protocol + host.ipv4 + ':' + service.port)
      for (var j = 0; j < names.length; j++) {
        linkList.push(protocol + names[j] + ':' + service.port)
      }
    }
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      hostId: this.params.hid,
      host: host,
      links: linkList
    }
  }
})

Router.route('/projects/:id/hosts/:hid/credentials', {
  name: 'hostCredentialList',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }

    if (Hosts.find({
      _id: this.params.hid
    }).count() < 1) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    var self = this
    return {
      routeName: Router.current().route.getName(),
      projectId: self.params.id,
      projectName: project.name,
      host: host,
      credentials: Credentials.find({
        $or: [{
          host: {
            $in: host.hostnames
          }
        }, {
          host: host.ipv4
        }]
      }).fetch()
    }
  }
})

Router.route('/projects/:id/hosts/:hid/settings', {
  name: 'hostSettings',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    if (Hosts.find({
      _id: this.params.hid
    }).count() < 1) {
      return null
    }
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: Hosts.findOne({
        _id: this.params.hid
      })
    }
  }
})

Router.route('/projects/:id/hosts/:hid/files', {
  name: 'hostFileList',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    if (Hosts.find({
      _id: this.params.hid
    }).count() < 1) {
      return null
    }
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: Hosts.findOne({
        _id: this.params.hid
      }),
      progress: Session.get('progress')
    }
  }
})

Router.route('/projects/:id/hosts/:hid/directories', {
  name: 'hostWebDirectoryList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('webDirectoryFlagFilter', null)
    Session.set('webDirectorySearch', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    if (!host) {
      return null
    }
    var query = {
      projectId: this.params.id,
      hostId: host._id
    }
    if (Session.equals('webDirectoryFlagFilter', 'enabled')) {
      query.isFlagged = true
    }
    var search = Session.get('webDirectorySearch')
    if (search) {
      query.$or = [{
        port: parseInt(search, 10)
      }, {
        responseCode: {
          $regex: search,
          $options: 'i'
        }
      }, {
        path: {
          $regex: search,
          $options: 'i'
        }
      }, {
        lastModifiedBy: {
          $regex: search,
          $options: 'i'
        }
      }]
    }
    return {
      routeName: Router.current().route.getName(),
      projectId: this.params.id,
      projectName: project.name,
      host: host,
      paths: WebDirectories.find(query).fetch(),
      flagFilter: Session.equals('webDirectoryFlagFilter', 'enabled'),
      savedSearch: search
    }
  }
})

function getNextHost (projectId, currentHostId, increment) {
  var hosts = Hosts.find({
    projectId: projectId
  }, {
    sort: {
      longIpv4Addr: 1
    },
    fields: {
      _id: 1
    }
  }).fetch()
  var i = getNextItemIndex(hosts, currentHostId, increment)
  var next = {
    projectId: projectId,
    hostId: hosts[i]._id
  }
  return next
}

function getNextItemIndex (idArray, matchId, increment) {
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

