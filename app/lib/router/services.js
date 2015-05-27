/* global Router */

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
