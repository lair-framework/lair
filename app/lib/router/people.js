/* globals Router Projects People Session Credentials */

Router.route('/projects/:id/people', {
  name: 'peopleList',
  controller: 'ProjectController',
  onRun: function () {
    if (Settings.findOne({
      setting: 'persistViewFilters',
      enabled: true
    })) {
      this.next()
      return
    }
    Session.set('peopleListSearch', null)
    Session.set('peopleListPerson', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var search = Session.get('peopleListSearch')
    var self = this
    return {
      projectId: this.params.id,
      projectName: project.name,
      people: function () {
        var query = {
          projectId: self.params.id
        }
        var search = Session.get('peopleListSearch')
        if (search) {
          query.$or = [{
            principalName: {
              $regex: search,
              $options: 'i'
            }
          }, {
            groups: {
              $regex: search,
              $options: 'i'
            }
          }, {
            samAccountName: {
              $regex: search,
              $options: 'i'
            }
          }, {
            firstName: {
              $regex: search,
              $options: 'i'
            }
          }, {
            lastName: {
              $regex: search,
              $options: 'i'
            }
          }]
        }
        var people = People.find(query, {
          sort: {
            principalName: 1
          },
          limit: 10000
        }).fetch()
        for (var i = 0; i < people.length; i++) {
          var person = people[i]
          person.credentials = []
          Credentials.find({
            username: person.principalName
          }).fetch().forEach(function (cred) {
            person.credentials.push(cred)
          })
        }
        return people
      },
      person: function () {
        if (Session.equals('peopleListPerson', null)) {
          return null
        }
        var person = People.findOne({
          _id: Session.get('peopleListPerson')
        })
        person.credentials = []
        Credentials.find({
          username: person.principalName
        }).fetch().forEach(function (cred) {
          person.credentials.push(cred)
        })
        return person
      },
      savedSearch: search
    }
  }
})

Router.route('/projects/:id/people/new', {
  name: 'newPerson',
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

Router.route('/projects/:id/people/:pid', {
  name: 'person',
  controller: 'ProjectController',
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var person = People.findOne({
      _id: this.params.pid
    })
    if (!person) {
      return null
    }
    person.emails = person.emails.join('\n').trimRight('\n')
    person.phones = person.phones.join('\n').trimRight('\n')
    person.groups = person.groups.join('\n').trimRight('\n')
    person.loggedIn = person.loggedIn.join('\n').trimRight('\n')
    var references = ''
    for (var i = 0; i < person.references.length; i++) {
      var reference = person.references[i]
      references += reference.description + ',' + reference.username + ',' + reference.link + '\n'
    }
    person.references = references.trimRight('\n')
    return {
      projectId: this.params.id,
      projectName: project.name,
      person: person
    }
  }
})
