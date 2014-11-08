// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

var hostIds = [];
var reduced = false;
var match = [];

Template.serviceSearch.projectId = function() {
  return Session.get('projectId');
};

Template.serviceSearch.servicesWithHosts = function() {
  if (Session.equals('servicesViewQuery', null) || Session.equals('match', null)) {
    return null;
  }
  match = Session.get('match');
  match.forEach(function(match) {
    var host = Hosts.findOne({
      "_id": match.host_id
    });
    match.string_addr = host.string_addr;
    match.long_addr = host.long_addr;
  });
  return match.sort(sortLongAddr);
};

Template.serviceSearch.services = function() {
  if (Session.equals('servicesViewQuery', null)) {
    match = Ports.find({
      "project_id": Session.get('projectId')
    }).fetch();
  } else {
    match = Ports.find(Session.get('servicesViewQuery')).fetch();
  }
  if (!match) {
    Session.set('match', match);
    return {};
  }
  var services = [];
  hostIds = [];
  Session.set('hostIds', []);
  match.forEach(function(match) {
    hostIds.push(match.host_id);
    services.push({
      "port": match.port,
      "protocol": match.protocol,
      "service": match.service,
      "product": match.product
    });
  });
  Session.set('match', match);
  Session.set('hostIds', hostIds);
  return unique(services);
};

Template.serviceSearchHostList.rendered = function() {
    Deps.autorun(function() {
        if(!Session.equals('hostIds', null)) {
            return $('#host-textarea').height($('#host-textarea')[0].scrollHeight);
        }
    });
};

Template.serviceSearchHostList.hosts = function() {
  var hosts = Hosts.find({
    "_id": {
      "$in": _.uniq(Session.get('hostIds'))
    }
  }).fetch();
  return _.pluck(hosts, 'string_addr').join('\n');
};

Template.serviceSearch.events({
  'submit form': function(event, tpl) {
    event.preventDefault();
    var port = parseInt(tpl.find('[name=port]').value);
    var protocol = escapeRegex(tpl.find('[name=protocol]').value);
    var service = escapeRegex(tpl.find('[name=service]').value);
    var product = escapeRegex(tpl.find('[name=product]').value);
    var query = {
      "project_id": Session.get('projectId')
    };
    if (port && !isNaN(port)) {
      query.port = port;
    }
    if (protocol) {
      query.protocol = {
        "$regex": protocol,
        "$options": 'i'
      };
    }
    if (service) {
      query.service = {
        "$regex": service,
        "$options": 'i'
      };
    }
    if (product) {
      query.product = {
        "$regex": product,
        "$options": 'i'
      };
    }
    return Session.set('servicesViewQuery', query);
  },

  'click .port-row': function(event, tpl) {
    var port = parseInt(this.port);
    var protocol = this.protocol;
    var service = this.service;
    var product = this.product;
    var query = {
      "project_id": Session.get('projectId'),
      "port": port,
      "protocol": protocol,
      "service": service,
      "product": product
    };
    tpl.find('[name=port]').value = port;
    tpl.find('[name=protocol]').value = protocol;
    tpl.find('[name=service]').value = service;
    tpl.find('[name=product]').value = product;
    return Session.set('servicesViewQuery', query);
  },

  'click #services-clear': function(event, tpl) {
    tpl.find('[name=port]').value = '';
    tpl.find('[name=protocol]').value = '';
    tpl.find('[name=service]').value = '';
    tpl.find('[name=product]').value = '';
    return Session.set('servicesViewQuery', null);
  },

  'click .port-status': function() {
    var status = STATUS_MAP[STATUS_MAP.indexOf(this.status) + 1];
    if (STATUS_MAP.indexOf(this.status) + 1 > 4) {
      status = STATUS_MAP[0];
    }
    return Meteor.call('setPortStatus', Session.get('projectId'), this._id, status);
  },

  'click .flag-enabled': function() {
    return Meteor.call('disablePortFlag', Session.get('projectId'), this._id);
  },

  'click .flag-disabled': function() {
    return Meteor.call('enablePortFlag', Session.get('projectId'), this._id);
  }

});

function unique(arr) {
  var hash = {}, result = [];
  for (var i = 0, l = arr.length; i < l; ++i) {
    var oString = JSON.stringify(arr[i]);
    if (!hash.hasOwnProperty(oString)) {
      hash[oString] = true;
      result.push(arr[i]);
    }
  }
  return result;
}
