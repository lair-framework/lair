/* globals Meteor check Matchers AuthorizeChange Issues _ Models IssueRating Hosts Services */
Meteor.methods({
  createIssue: createIssue,
  removeIssue: removeIssue,
  setIssueTitle: setIssueTitle,
  setIssueDescription: setIssueDescription,
  setIssueEvidence: setIssueEvidence,
  setIssueSolution: setIssueSolution,
  setIssueCVSS: setIssueCVSS,
  addIssueNote: addIssueNote,
  removeIssueNote: removeIssueNote,
  setIssueNoteContent: setIssueNoteContent,
  enableIssueFlag: enableIssueFlag,
  disableIssueFlag: disableIssueFlag,
  setIssueStatus: setIssueStatus,
  confirmIssue: confirmIssue,
  unconfirmIssue: unconfirmIssue,
  addHostToIssue: addHostToIssue,
  removeHostFromIssue: removeHostFromIssue,
  removeHostFromIssues: removeHostFromIssues,
  removeServiceFromIssues: removeServiceFromIssues,
  addCVE: addCVE,
  removeCVE: removeCVE,
  addReference: addReference,
  removeReference: removeReference,
  addIssueTag: addIssueTag,
  removeIssueTag: removeIssueTag
})

function createIssue (id, title, cvss, description, evidence, solution) {
  check(id, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  check(cvss, Matchers.isCVSS)
  check(description, String)
  check(evidence, String)
  check(solution, String)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  if (Issues.findOne({
    title: title
  })) {
    throw new Meteor.Error(400, 'An Issue with that title alrady exists')
  }
  var issue = _.extend(Models.issue(), {
    projectId: id,
    title: title,
    cvss: cvss,
    description: description,
    evidence: evidence,
    solution: solution,
    rating: IssueRating(cvss),
    lastModifiedBy: Meteor.user().emails[0].address
  })
  return Issues.insert(issue)
}

function disableIssueFlag (id, issueId) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      isFlagged: false,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function enableIssueFlag (id, issueId) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      isFlagged: true,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueStatus (id, issueId, status) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(status, Matchers.isValidStatus)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      status: status,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function unconfirmIssue (id, issueId) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      isConfirmed: false,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function confirmIssue (id, issueId) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      isConfirmed: true,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeIssue (id, issueId) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.remove({
    projectId: id,
    _id: issueId
  })
}

// function removeHostIpIssue (id, issueId,ipv4) {
//   check(id, Matchers.isObjectId)
//   check(issueId, Matchers.isObjectId)
//   if (!AuthorizeChange(id, this.userId)) {
//     throw new Meteor.Error(403, 'Access Denied')
//   }
//   return Issues.update({
//     projectId: id,
//     _id: issueId
//   },{$pull:{hosts:ipv4}})
// }

function setIssueTitle (id, issueId, title) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  if (Issues.findOne({
    title: title
  })) {
    throw new Meteor.Error(400, 'An Issue with that title alrady exists')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      title: title,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueDescription (id, issueId, description) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(description, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      description: description,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueEvidence (id, issueId, evidence) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(evidence, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      evidence: evidence,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueSolution (id, issueId, solution) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(solution, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      solution: solution,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueCVSS (id, issueId, cvss) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(cvss, Matchers.isCVSS)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $set: {
      cvss: cvss,
      rating: IssueRating(cvss),
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function addIssueNote (id, issueId, title, content) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  check(content, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var note = _.extend(Models.note(), {
    title: title,
    content: content,
    lastModifiedBy: Meteor.user().emails[0].address
  })
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $push: {
      notes: note
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeIssueNote (id, issueId, title) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $pull: {
      notes: {
        title: title
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function setIssueNoteContent (id, issueId, title, content) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(title, Matchers.isNonEmptyString)
  check(content, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId,
    'notes.title': title
  }, {
    $set: {
      'notes.$.content': content,
      'notes.$.lastModifiedBy': Meteor.user().emails[0].address,
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function addHostToIssue (id, issueId, ip, port, protocol) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(ip, Matchers.isIPv4)
  check(port, Matchers.isPort)
  check(protocol, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var host = Hosts.findOne({
    projectId: id,
    ipv4: ip
  })
  if (!host) {
    throw new Meteor.Error(404, 'Host not found')
  }
  if (!Services.findOne({
    projectId: id,
    hostId: host._id,
    port: port,
    protocol: protocol
  })) {
    throw new Meteor.Error(404, 'Service not found')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $addToSet: {
      hosts: {
        ipv4: ip,
        port: port,
        protocol: protocol
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeHostFromIssue (id, issueId, ip, port, protocol) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(ip, Matchers.isIPv4)
  check(port, Matchers.isPort)
  check(protocol, Matchers.isNonEmptyString)
  console.log(id,issueId,ip,port,protocol)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $pull: {
      hosts: {
        ipv4: ip,
        port: port,
        protocol: protocol
        
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeHostFromIssues (id, ip) {
  check(id, Matchers.isObjectId)
  check(ip, Matchers.isIPv4)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id
  }, {
    $pull: {
      hosts: {
        ipv4: ip
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeServiceFromIssues (id, ip, port, protocol) {
  check(id, Matchers.isObjectId)
  check(ip, Matchers.isIPv4)
  check(port, Matchers.isPort)
  check(protocol, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id
  }, {
    $pull: {
      hosts: {
        ipv4: ip,
        port: port,
        protocol: protocol
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function addCVE (id, issueId, cve) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(cve, Matchers.isCVE)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $addToSet: {
      cves: cve
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeCVE (id, issueId, cve) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(cve, Matchers.isCVE)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $pull: {
      cves: cve
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function addIssueTag (id, issueId, tag) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(tag, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $addToSet: {
      tags: tag
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeIssueTag (id, issueId, tag) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(tag, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $pull: {
      tags: tag
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function addReference (id, issueId, link, name) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(link, Matchers.isNonEmptyString)
  check(name, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $addToSet: {
      references: {
        link: link,
        name: name
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}

function removeReference (id, issueId, link, name) {
  check(id, Matchers.isObjectId)
  check(issueId, Matchers.isObjectId)
  check(link, Matchers.isNonEmptyString)
  check(name, Matchers.isNonEmptyString)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Issues.update({
    projectId: id,
    _id: issueId
  }, {
    $pull: {
      references: {
        link: link,
        name: name
      }
    },
    $set: {
      lastModifiedBy: Meteor.user().emails[0].address
    }
  })
}
