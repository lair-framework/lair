/* globals Router Meteor Projects */

Router.route('/', {
  onBeforeAction: function () {
    this.redirect('projectList', {}, {replaceState: true})
    this.next()
  }
})

Router.route('/projects', {
  name: 'projectList',
  waitOn: function () {
    return [
      Meteor.subscribe('directory'),
      Meteor.subscribe('projectListing')
    ]
  },
  data: function () {
    return Projects.find({}, {sort: {name: 1}}).fetch()
  }
})

Router.route('/projects/new', {
  name: 'newProject'
})

Router.route('/projects/:id', {
  controller: 'ProjectController',
  onBeforeAction: function () {
    this.redirect('/projects/' + this.params.id + '/hosts', {}, {replaceState: true})
    this.next()
  }
})
