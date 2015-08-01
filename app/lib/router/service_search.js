/* globals Projects Router Session Services _  Hosts IPUtils */

Router.route('/projects/:id/services', {
  name: 'serviceSearch',
  controller: 'ProjectController',
  onRun: function () {
    Session.set('servicesViewQuery', null)
    Session.set('match', null)
    this.next()
  },
  data: function () {
    if (Projects.find({
        _id: this.params.id
      }).count() < 1) {
      return null
    }
    var services = []
    if (Session.get('servicesViewQuery') === null) {
      services = Services.find({}, {sort: {port: 1}}).fetch()
    } else {
      services = Services.find(Session.get('servicesViewQuery'), {sort: {port: 1}}).fetch()
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
