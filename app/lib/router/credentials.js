/* globals Router Credentials Projects Session */

Router.route('/projects/:id/credentials', {
  name: 'credentials',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('credentialsSearch', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var query = {
      projectId: this.params.id
    }
    var search = Session.get('credentialsSearch')
    if (search) {
      query.$or = [{
        username: {
          $regex: search,
          $options: 'i'
        }
      }, {
        password: {
          $regex: search,
          $options: 'i'
        }
      }, {
        format: {
          $regex: search,
          $options: 'i'
        }
      }, {
        hash: {
          $regex: search,
          $options: 'i'
        }
      }, {
        host: {
          $regex: search,
          $options: 'i'
        }
      }, {
        service: {
          $regex: search,
          $options: 'i'
        }
      }]
    }
    var self = this
    return {
      projectId: self.params.id,
      projectName: project.name,
      credentials: Credentials.find(query).fetch(),
      savedSearch: search,
      total: Credentials.find({projectId: self.params.id}).count()
    }
  }
})

Router.route('/projects/:id/credentials/new', {
  name: 'newCredential',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id,
      projectName: project.name
    }
  }
})

Router.route('/projects/:id/credentials/bulk', {
  name: 'newCredentialBulk',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id,
      projectName: project.name
    }
  }
})

Router.route('/projects/:id/credentials/:cid', {
  name: 'editCredential',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var credential = Credentials.findOne({
      _id: this.params.cid
    })
    if (!credential) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id,
      projectName: project.name,
      credential: credential
    }
  }
})
