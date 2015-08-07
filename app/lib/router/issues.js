/* globals Router Session Projects Issues Settings _ Hosts Services */

Router.route('/projects/:id/issues', {
  name: 'issueList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      settings: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('issueViewLimit', 25)
    Session.set('issueListSearch', null)
    Session.set('issueListStatusButtongrey', null)
    Session.set('issueListStatusButtonblue', null)
    Session.set('issueListStatusButtongreen', null)
    Session.set('issueListStatusButtonorange', null)
    Session.set('issueListStatusButtonred', null)
    Session.set('issueListFlagFilter', null)
    this.next()
  },
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    var total = Issues.find({
      projectId: this.params.id
    }).count()
    var self = this
    return {
      moreToShow: function () {
        return total > Session.get('issueViewLimit')
      },
      flagFilter: Session.get('issueListFlagFilter'),
      total: total,
      projectId: self.params.id,
      issueStatusButtonActive: function (color) {
        if (Session.equals('issueListStatusButton' + color, 'disabled')) {
          return 'disabled'
        }
      },
      issues: function () {
        var limit = Session.get('issueViewLimit') || 25
        var query = {
          projectId: self.params.id,
          status: {
            $in: []
          }
        }
        if (Session.equals('issueListFlagFilter', 'enabled')) {
          query.isFlagged = true
        }
        if (!Session.equals('issueListStatusButtongrey', 'disabled')) {
          query.status.$in.push('lair-grey')
        }
        if (!Session.equals('issueListStatusButtonblue', 'disabled')) {
          query.status.$in.push('lair-blue')
        }
        if (!Session.equals('issueListStatusButtongreen', 'disabled')) {
          query.status.$in.push('lair-green')
        }
        if (!Session.equals('issueListStatusButtonorange', 'disabled')) {
          query.status.$in.push('lair-orange')
        }
        if (!Session.equals('issueListStatusButtonred', 'disabled')) {
          query.status.$in.push('lair-red')
        }
        var search = Session.get('issueListSearch')
        if (search) {
          query.$or = [
            {cvss: {$regex: search, $options: 'i'}},
            {title: {$regex: search, $options: 'i'}},
            {lastModifiedBy: {$regex: search, $options: 'i'}},
            {tags: search}
          ]
        }
        return Issues.find(query, {
          sort: {
            cvss: -1,
            title: 1
          },
          limit: limit
        }).fetch()
      }
    }
  }
})

Router.route('/projects/:id/issues/new', {
  name: 'newIssue',
  controller: 'ProjectController',
  data: function () {
    return {
      projectId: this.params.id
    }
  }
})

Router.route('/projects/:id/issues/:iid', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/issues/' + this.params.iid + '/description')
    this.next()
  }
})

Router.route('/projects/:id/issues/:iid/description', {
  name: 'issueDescription',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})

Router.route('/projects/:id/issues/:iid/evidence', {
  name: 'issueEvidence',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})

Router.route('/projects/:id/issues/:iid/solution', {
  name: 'issueSolution',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})

Router.route('/projects/:id/issues/:iid/hosts', {
  name: 'issueHostList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    var issue = Issues.findOne({
      _id: this.params.iid
    })
    if (!issue) {
      return null
    }
    var self = this
    issue.hosts.forEach(function (host) {
      var h = Hosts.findOne({
        projectId: self.params.id,
        ipv4: host.ipv4
      })
      host.hostId = h._id
      host.longIpv4Addr = h.longIpv4Addr
      host.serviceId = Services.findOne({
        projectId: self.params.id,
        hostId: host.hostId,
        port: host.port,
        protocol: host.protocol})._id
    })
    issue.hosts.sort(function (a, b) {
      return (a.longIpv4Addr > b.longIpv4Addr) ? 1 : ((b.longIpv4Addr > a.longIpv4Addr) ? -1 : 0)
    })
    return {
      projectId: this.params.id,
      issue: issue
    }
  }
})

Router.route('/projects/:id/issues/:iid/hosts/new', {
  name: 'addIssueHost',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issueId: this.params.iid
    }
  }
})

Router.route('/projects/:id/issues/:iid/hosts/bulk', {
  name: 'addIssueHostBulk',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issueId: this.params.iid
    }
  }
})

Router.route('/projects/:id/issues/:iid/cves', {
  name: 'issueCVEList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})

Router.route('/projects/:id/issues/:iid/references', {
  name: 'issueReferenceList',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})

Router.route('/projects/:id/issues/:iid/notes', {
  name: 'issueNoteList',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('noteTitle', null)
    this.next()
  },
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    var issue = Issues.findOne({
      _id: this.params.iid
    })
    if (!issue) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: issue,
      note: function () {
        if (Session.equals('noteTitle', null)) {
          return
        }
        return issue.notes[_.indexOf(_.pluck(issue.notes, 'title'), Session.get('noteTitle'))]
      }
    }
  }
})

Router.route('/projects/:id/issues/:iid/settings', {
  name: 'issueSettings',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    if (Issues.find({
      _id: this.params.iid
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id,
      issue: Issues.findOne({
        _id: this.params.iid
      })
    }
  }
})
