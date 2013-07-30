// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

var hostIds = [];

Template.serviceSearch.services = function() {
  var match = null;
  if (Session.equals('servicesViewQuery', null)) {
    match = Ports.find({"project_id": Session.get('projectId')}, {sort: {"port": 1, "product": 1}}).fetch();
  }
  else {
    match = Ports.find(Session.get('servicesViewQuery'), {sort: {"port": 1, "product": 1}}).fetch();
  }
  if (!match) {
    return {};
  }
  var services = [];
  hostIds = [];
  match.forEach(function(match) {
    hostIds.push(match.host_id);
    services.push({"port": match.port, "protocol": match.protocol, "service": match.service, "product": match.product});
  });
  return unique(services);
};

Template.serviceSearch.rendered = function() {
  return $('#host-textarea').height($('#host-textarea')[0].scrollHeight);
};

Template.serviceSearch.hosts = function() {
  var hosts = Hosts.find({"_id": {"$in": _.uniq(hostIds)}}).fetch().sort(sortLongAddr);
  return _.pluck(hosts, 'string_addr').join('\n');
};

Template.serviceSearch.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var port = parseInt(tpl.find('[name=port]').value);
    var protocol = tpl.find('[name=protocol]').value.replace(/[^a-zA-Z0-9\s]/g, '');
    var service = tpl.find('[name=service]').value.replace(/[^a-zA-Z0-9\s]/g, '');
    var product = tpl.find('[name=product]').value.replace(/[^a-zA-Z0-9\s]/g, '');
    var query = {"project_id": Session.get('projectId')};
    if (port && !isNaN(port)) {
      query.port = port;
    }
    if (protocol) {
      query.protocol = { "$regex": protocol, "$options": 'i'};
    }
    if (service) {
      query.service = { "$regex": service, "$options": 'i'};
    }
    if (product) {
      query.product = { "$regex": product, "$options": 'i'};
    }
    return Session.set('servicesViewQuery', query);
  },

  'click .port-row': function() {
    var port = parseInt(this.port);
    var protocol = this.protocol;
    var service = this.service;
    var product = this.product;
    var query = {"project_id": Session.get('projectId'), "port": port, "protocol": protocol,
      "service": service, "product": product};
    return Session.set('servicesViewQuery', query);
  }

});

function unique(arr) {
  var hash = {}, result = [];
  for (var i = 0, l = arr.length; i < l; ++i ) {
    var oString = JSON.stringify(arr[i]);
    if (!hash.hasOwnProperty(oString)) {
      hash[oString] = true;
      result.push(arr[i]);
    }
  }
  return result;
}
