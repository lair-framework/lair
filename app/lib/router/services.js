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
   onRun: function () {
     if (Settings.findOne({
      settings: 'persistViewFilters',
      enabled: true
    })) {
       this.next()
       return
    }
     Session.set('serviceIssueViewLimit', 25)
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
    var total = Issues.find({
      projectId: this.params.id
    }).count()
    var host = Hosts.findOne({
      _id: this.params.hid
    })
    var self = this
    return {
      projectId: this.params.id,
      host: host,
      moreToShow: function () {
        return total > Session.get('serviceIssueViewLimit')
      },
      flagFilter: Session.get('serviceIssueListFlagFilter'),
      serviceIssueStatusButtonActive: function (color) {
        if (Session.equals('serviceIssueListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      issues: function () {
        var limit = Session.get('hostIssueViewLimit') || 25
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
          },
          limit: limit
        }).fetch()
      }
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
