/* globals Template key Hosts Router _ StatusMap Meteor */

Template.body.rendered = function () {
  var hostpathre = /\/projects\/([a-zA-Z0-9]{17,24})\/hosts\/([a-zA-Z0-9]{17,24})/
  key('alt+n', function () {
    var match = getHostPathGroups(document.location.pathname, hostpathre)
    if (match.isMatched) {
      var hosts = Hosts.find({
          projectId: match.projectId
        }, {
          sort: {
            longIpv4Addr: 1
          },
          fields: {
            _id: 1
          }
        }).fetch()
      var i = _.indexOf(_.pluck(hosts, '_id'), match.hostId) + 1
      if (i >= hosts.length) {
        Router.go('/projects/' + match.projectId + '/hosts/' + hosts[0]._id + '/services')
        return
      }
      Router.go('/projects/' + match.projectId + '/hosts/' + hosts[i]._id + '/services')
    }
  })

  key('alt+p', function () {
    var match = getHostPathGroups(document.location.pathname, hostpathre)
    if (match.isMatched) {
      var hosts = Hosts.find({
          projectId: match.projectId
        }, {
          sort: {
            longIpv4Addr: 1
          },
          fields: {
            _id: 1
          }
        }).fetch()
      var i = _.indexOf(_.pluck(hosts, '_id'), match.hostId) - 1
      if (i < 0) {
        Router.go('/projects/' + match.projectId + '/hosts/' + hosts[hosts.length - 1]._id + '/services')
        return
      }
      Router.go('/projects/' + match.projectId + '/hosts/' + hosts[i]._id + '/services')
    }
  })

  key('alt+s', function () {
    var match = getHostPathGroups(document.location.pathname, hostpathre)
    if (match.isMatched) {
      var host = Hosts.findOne({
        _id: match.hostId
      })
      if (!host) {
        return
      }
      var status = StatusMap[StatusMap.indexOf(host.status) + 1]
      if (StatusMap.indexOf(host.status) === 4) {
        status = StatusMap[0]
      }
      Meteor.call('setHostStatus', match.projectId, match.hostId, status)
      return
    }
  })
  key('alt+f', function () {
    var match = getHostPathGroups(document.location.pathname, hostpathre)
    if (match.isMatched) {
      var host = Hosts.findOne({
        _id: match.hostId
      })
      if (!host) {
        return
      }
      if (host.isFlagged) {
        Meteor.call('disableHostFlag', match.projectId, match.hostId)
        return
      }
      Meteor.call('enableHostFlag', match.projectId, match.hostId)
      return
    }
  })
}

function getHostPathGroups (path, re) {
  var match = {
    isMatched: false,
    projectId: '',
    hostId: ''
  }
  var m = path.match(re)
  if (!m) {
    return match
  }
  match.isMatched = true
  match.projectId = m[1]
  match.hostId = m[2]
  return match
}
