/* globals Router Projects People Session */

Router.route('/projects/:id/people', {
  name: 'peopleList',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('peopleListSearch', null)
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
          }]
        }
        return People.find(query, {
          sort: {
            principalName: 1
          },
          limit: 10000
        })
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
    return {
      projectId: this.params.id,
      person: person
    }
  }
})
