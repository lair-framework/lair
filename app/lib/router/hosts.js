/* globals Projects Router Hosts Session Settings Services _ Credentials */

Router.route('/projects/:id/hosts', {
  name: 'hostList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      settings: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
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
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var total = Hosts.find({
      projectId: this.params.id
    }).count()
    var self = this
    return {
      moreToShow: function () {
        return total > Session.get('hostViewLimit')
      },
      flagFilter: Session.get('hostListFlagFilter'),
      total: total,
      projectId: self.params.id,
      hostStatusButtonActive: function (color) {
        if (Session.equals('hostListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      hosts: function () {
        var limit = Session.get('hostViewLimit') || 25
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
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id
    }
  }
})

Router.route('/projects/:id/hosts/:hid', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/hosts/' + this.params.hid + '/services')
    this.next()
  }
})

Router.route('/projects/:id/hosts/:hid/services', {
  name: 'hostServiceList',
  controller: 'ProjectController',
   onRun: function () {
    if (Settings.findOne({
      settings: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
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
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    if (Hosts.find({
        _id: this.params.hid
      }).count() < 1) {
      return null
    }
    var total = Services.find({
      projectId: this.params.id
    }).count()
    var self = this
    return {
      projectId: this.params.id,
      hostId: this.params.hid,
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
        var limit = Session.get('hostServiceViewLimit') || 25
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
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
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
      projectId: this.params.id,
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
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    if (Hosts.find({
        _id: this.params.hid
      }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      host: Hosts.findOne({
        _id: this.params.hid
      })
    }
  }
})

Router.route('/projects/:id/hosts/:hid/hostnames', {
  name: 'hostHostnameList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
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
      projectId: this.params.id,
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
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
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
      projectId: self.params.id,
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
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    if (Hosts.find({
        _id: this.params.hid
      }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      host: Hosts.findOne({
        _id: this.params.hid
      })
    }
  }
})
