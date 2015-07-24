/* globals Router Credentials Projects Session */

Router.route('/projects/:id/credentials', {
  name: 'credentials',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('credentialsSearch', null)
    this.next()
  },
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
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
      credentials: Credentials.find(query).fetch(),
      total: Credentials.find({projectId: self.params.id}).count()
    }
  }
})

Router.route('/projects/:id/credentials/new', {
  name: 'newCredential',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id
    }
  }
})

Router.route('/projects/:id/credentials/bulk', {
  name: 'newCredentialBulk',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var self = this
    return {
      projectId: self.params.id
    }
  }
})
