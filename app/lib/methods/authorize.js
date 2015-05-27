/* globals Projects */
AuthorizeChange = function (id, uid) { // eslint-disable-line
  return Projects.findOne({
    _id: id,
    $or: [{
      owner: uid
    }, {
      contributors: uid
    }]
  })
}
