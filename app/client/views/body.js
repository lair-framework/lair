/* globals Template key Hosts Router _ StatusMap Meteor Issues Alerts Services*/

Template.body.rendered = function () {
  var hostpathre = /\/projects\/([a-zA-Z0-9]{17,24})\/hosts\/([a-zA-Z0-9]{17,24})/
  var servicepathre = /\/projects\/([a-zA-Z0-9]{17,24})\/hosts\/([a-zA-Z0-9]{17,24})\/services\/([a-zA-Z0-9]{17,24})/
  var issuepathre = /\/projects\/([a-zA-Z0-9]{17,24})\/issues\/([a-zA-Z0-9]{17,24})/
  key('alt+n', function () {
    var servicematch = getServicePathGroups(document.location.pathname, servicepathre)
    if (servicematch.isMatched) {
      var services = Services.find({
        projectId: servicematch.projectId,
        hostId: servicematch.hostId
      }, {
        sort: {
          port: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var k = _.indexOf(_.pluck(services, '_id'), servicematch.serviceId) + 1
      if (k >= services.length) {
        Router.go('/projects/' + servicematch.projectId + '/hosts/' + servicematch.hostId + '/services/' + services[0]._id)
        return
      }
      Router.go('/projects/' + servicematch.projectId + '/hosts/' + servicematch.hostId + '/services/' + services[k]._id)
      return
    }
    var hostmatch = getHostPathGroups(document.location.pathname, hostpathre)
    if (hostmatch.isMatched) {
      var hosts = Hosts.find({
        projectId: hostmatch.projectId
      }, {
        sort: {
          longIpv4Addr: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var i = _.indexOf(_.pluck(hosts, '_id'), hostmatch.hostId) + 1
      if (i >= hosts.length) {
        Router.go('/projects/' + hostmatch.projectId + '/hosts/' + hosts[0]._id + '/services')
        return
      }
      Router.go('/projects/' + hostmatch.projectId + '/hosts/' + hosts[i]._id + '/services')
      return
    }
    var issuematch = getIssuePathGroups(document.location.pathname, issuepathre)
    if (issuematch.isMatched) {
      var issues = Issues.find({
        projectId: issuematch.projectId
      }, {
        sort: {
          cvss: -1,
          title: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var j = _.indexOf(_.pluck(issues, '_id'), issuematch.issueId) + 1
      if (j >= issues.length) {
        Router.go('/projects/' + issuematch.projectId + '/issues/' + issues[0]._id + '/description')
        return
      }
      Router.go('/projects/' + issuematch.projectId + '/issues/' + issues[j]._id + '/description')
      return
    }
  })

  key('alt+p', function () {
    var servicematch = getServicePathGroups(document.location.pathname, servicepathre)
    if (servicematch.isMatched) {
      var services = Services.find({
        projectId: servicematch.projectId,
        hostId: servicematch.hostId
      }, {
        sort: {
          port: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var k = _.indexOf(_.pluck(services, '_id'), servicematch.serviceId) - 1
      if (k < 0) {
        Router.go('/projects/' + servicematch.projectId + '/hosts/' + servicematch.hostId + '/services/' + services[services.length - 1]._id)
        return
      }
      Router.go('/projects/' + servicematch.projectId + '/hosts/' + servicematch.hostId + '/services/' + services[k]._id)
      return
    }
    var hostmatch = getHostPathGroups(document.location.pathname, hostpathre)
    if (hostmatch.isMatched) {
      var hosts = Hosts.find({
        projectId: hostmatch.projectId
      }, {
        sort: {
          longIpv4Addr: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var i = _.indexOf(_.pluck(hosts, '_id'), hostmatch.hostId) - 1
      if (i < 0) {
        Router.go('/projects/' + hostmatch.projectId + '/hosts/' + hosts[hosts.length - 1]._id + '/services')
        return
      }
      Router.go('/projects/' + hostmatch.projectId + '/hosts/' + hosts[i]._id + '/services')
      return
    }
    var issuematch = getIssuePathGroups(document.location.pathname, issuepathre)
    if (issuematch.isMatched) {
      var issues = Issues.find({
        projectId: issuematch.projectId
      }, {
        sort: {
          cvss: -1,
          title: 1
        },
        fields: {
          _id: 1
        }
      }).fetch()
      var j = _.indexOf(_.pluck(issues, '_id'), issuematch.issueId) - 1
      if (j < 0) {
        Router.go('/projects/' + issuematch.projectId + '/issues/' + issues[issues.length - 1]._id + '/description')
        return
      }
      Router.go('/projects/' + issuematch.projectId + '/issues/' + issues[j]._id + '/description')
      return
    }
  })

  key('alt+s', function () {
    var servicematch = getServicePathGroups(document.location.pathname, servicepathre)
    if (servicematch.isMatched) {
      var service = Services.findOne({
        _id: servicematch.serviceId
      })
      if (!service) {
        return
      }
      var servicestatus = StatusMap[StatusMap.indexOf(service.status) + 1]
      if (StatusMap.indexOf(service.status) === 4) {
        servicestatus = StatusMap[0]
      }
      Meteor.call('setServiceStatus', servicematch.projectId, servicematch.serviceId, servicestatus)
      return
    }
    var hostmatch = getHostPathGroups(document.location.pathname, hostpathre)
    if (hostmatch.isMatched) {
      var host = Hosts.findOne({
        _id: hostmatch.hostId
      })
      if (!host) {
        return
      }
      var hoststatus = StatusMap[StatusMap.indexOf(host.status) + 1]
      if (StatusMap.indexOf(host.status) === 4) {
        hoststatus = StatusMap[0]
      }
      Meteor.call('setHostStatus', hostmatch.projectId, hostmatch.hostId, hoststatus)
      return
    }
    var issuematch = getIssuePathGroups(document.location.pathname, issuepathre)
    if (issuematch.isMatched) {
      var issue = Issues.findOne({
        _id: issuematch.issueId
      })
      if (!issue) {
        return
      }
      var issuestatus = StatusMap[StatusMap.indexOf(issue.status) + 1]
      if (StatusMap.indexOf(issue.status) === 4) {
        issuestatus = StatusMap[0]
      }
      Meteor.call('setIssueStatus', issuematch.projectId, issuematch.issueId, issuestatus)
      return
    }
  })

  key('alt+f', function () {
    var servicematch = getServicePathGroups(document.location.pathname, servicepathre)
    if (servicematch.isMatched) {
      var service = Services.findOne({
        _id: servicematch.serviceId
      })
      if (!service) {
        return
      }
      if (service.isFlagged) {
        Meteor.call('disableServiceFlag', servicematch.projectId, servicematch.serviceId)
        return
      }
      Meteor.call('enableServiceFlag', servicematch.projectId, servicematch.serviceId)
      return
    }
    var hostmatch = getHostPathGroups(document.location.pathname, hostpathre)
    if (hostmatch.isMatched) {
      var host = Hosts.findOne({
        _id: hostmatch.hostId
      })
      if (!host) {
        return
      }
      if (host.isFlagged) {
        Meteor.call('disableHostFlag', hostmatch.projectId, hostmatch.hostId)
        return
      }
      Meteor.call('enableHostFlag', hostmatch.projectId, hostmatch.hostId)
      return
    }
    var issuematch = getIssuePathGroups(document.location.pathname, issuepathre)
    if (issuematch.isMatched) {
      var issue = Issues.findOne({
        _id: issuematch.issueId
      })
      if (!issue) {
        return
      }
      if (issue.isFlagged) {
        Meteor.call('disableIssueFlag', issuematch.projectId, issuematch.issueId)
        return
      }
      Meteor.call('enableIssueFlag', issuematch.projectId, issuematch.issueId)
      return
    }
  })

  setInterval(function () {
    Alerts.remove({})
  }, 5000)
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

function getServicePathGroups (path, re) {
  var match = {
    isMatched: false,
    projectId: '',
    hostId: '',
    serviceId: ''
  }
  var m = path.match(re)
  if (!m) {
    return match
  }
  match.isMatched = true
  match.projectId = m[1]
  match.hostId = m[2]
  match.serviceId = m[3]
  return match
}

function getIssuePathGroups (path, re) {
  var match = {
    isMatched: false,
    projectId: '',
    issueId: ''
  }
  var m = path.match(re)
  if (!m) {
    return match
  }
  match.isMatched = true
  match.projectId = m[1]
  match.issueId = m[2]
  return match
}
