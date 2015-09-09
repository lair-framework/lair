/* globals Projects Router Session Services _  Hosts IPUtils Alerts */

Router.route('/projects/:id/services', {
  name: 'serviceSearch',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('servicesViewQuery', null)
    Session.set('match', null)
    this.next()
  },
  data: function () {
    var project = Projects.findOne({
      _id: this.params.id
    })
    if (!project) {
      return null
    }
    var services = []
    if (Session.get('servicesViewQuery') === null) {
      if (Services.find({}).count() > 1000) {
        services = []
      } else {
        services = Services.find({}, {sort: {port: 1}}).fetch()
      }
    } else {
      services = Services.find(Session.get('servicesViewQuery'), {sort: {port: 1}}).fetch()
    }
    if (services.length > 1000) {
      services = []
      Alerts.insert({
        class: 'alert-warning',
        strong: 'Error',
        message: 'Data set too large. Suggest using CLI utilities'
      })
    }
    var hosts = []
    for (var i = 0; i < services.length; i++) {
      var service = services[i]
      var host = Hosts.findOne({_id: service.hostId})
      if (host) {
        hosts.push(host)
        service.ipv4 = host.ipv4
        service.longIpv4Addr = host.longIpv4Addr
      }
    }
    return {
      projectId: this.params.id,
      projectName: project.name,
      services: _.uniq(services, function (i) {
        return JSON.stringify({port: i.port, protocol: i.protocol, service: i.service, product: i.product})
      }),
      servicesWithHosts: services.sort(IPUtils.sortLongAddr),
      hosts: _.pluck(_.uniq(hosts.sort(IPUtils.sortLongAddr), function (i) {
        return i.ipv4
      }), 'ipv4').join('\n'),
      searched: (Session.get('servicesViewQuery') !== null && Session.get('servicesViewQuery') !== {})
    }
  }
})
