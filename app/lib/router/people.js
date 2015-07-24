/* globals Router Projects People Session Credentials */

Router.route('/projects/:id/people', {
  name: 'peopleList',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('peopleListSearch', null)
    Session.set('peopleListPerson', null)
    this.next()
  },
  data: function () {
    if (Projects.find({
      _id: this.params.id
    }).count() < 1) {
      return null
    }
    var self = this
    return {
      projectId: this.params.id,
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
      }
    }
  }
})

Router.route('/projects/:id/people/new', {
  name: 'newPerson',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
    }).count() < 1) {
      return null
    }
    return {
      projectId: this.params.id
    }
  }
})

Router.route('/projects/:id/people/:pid', {
  name: 'person',
  controller: 'ProjectController',
  data: function () {
    if (Projects.find({
    }).count() < 1) {
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
      person: person
    }
  }
})
