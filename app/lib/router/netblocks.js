/* globals Router Netblocks Projects Session */

Router.route('/projects/:id/netblocks', {
  name: 'netblocks',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('netblocksSelected', null)
    this.next()
  },
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
      projectName: project.name,
      netblocks: Netblocks.find({}).fetch(),
      netblock: Netblocks.findOne({
        _id: Session.get('netblocksSelected')
      })
    }
  }
})

Router.route('/projects/:id/netblocks/new', {
  name: 'newNetblock',
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
