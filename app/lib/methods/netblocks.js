/* globals Meteor Netblocks check _ Models Matchers AuthorizeChange */
Meteor.methods({
  createNetblock: createNetblock,
  removeNetblock: removeNetblock
})

function createNetblock (id, netblock) {
  check(id, Matchers.isObjectId)
  for (var key in netblock) {
    check(netblock[key], String)
  }
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var n = _.extend(Models.netblock(), {
    projectId: id,
    asn: netblock.asn,
    asnCountryCode: netblock.asnCountryCode,
    asnCidr: netblock.asnCidr,
    asnDate: netblock.asnDate,
    asnRegistry: netblock.asnRegistry,
    cidr: netblock.cidr,
    abuseEmails: netblock.abuseEmails,
    miscEmails: netblock.miscEmails,
    techEmails: netblock.techEmails,
    name: netblock.name,
    address: netblock.address,
    city: netblock.city,
    state: netblock.state,
    country: netblock.country,
    potalCode: netblock.potalCode,
    created: netblock.created,
    updated: netblock.updated,
    description: netblock.description,
    handle: netblock.handle
  })
  return Netblocks.insert(n)
}

function removeNetblock (id, nid) {
  check(id, Matchers.isObjectId)
  check(nid, Matchers.isObjectId)
  if (!AuthorizeChange(id, this.userId)) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  return Netblocks.remove({
    projectId: id,
    _id: nid
  })
}
