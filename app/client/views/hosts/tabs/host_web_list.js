Template.hostWebList.projectId = function() {
  return Session.get('projectId');
};

Template.hostWebList.flagFilter = function() {
  return Session.get('webListFlagFilter');
};

Template.hostWebList.paths = function() {
  var projectId = Session.get('projectId');
  var hostId = Session.get('hostId');
  var host = Hosts.findOne(hostId);
  if (!host) {
    return false;
  }
  var query = {"project_id": projectId, "_id": hostId};
  var resultSet = Hosts.find(query).fetch();
  if (resultSet.length === 1) {
    return resultSet[0].web.sort(function(a,b) {
      var keyA = a.response_code, keyB = b.response_code; 
      if(keyA < keyB) return -1; 
      if(keyA > keyB) return 1; 
      return 0;
    });
  }
};

Template.hostWebList.events({
  'click .flag-enabled': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    return Meteor.call('disableWebPathFlag', projectId, hostId, this.path_clean);
  },

  'click .flag-disabled': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    return Meteor.call('enableWebPathFlag', projectId, hostId, this.path_clean);
  },

  // TODO
  // 'click #flag-filter-enable': function() {
  //   return Session.set('webPathListFlagFilter', 'enabled');
  // },

  // 'click #flag-filter-disable': function() {
  //   return Session.set('webPathListFlagFilter', null);
  // },

  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var path = tpl.find('[name=path]').value;
    var port = tpl.find('[name=port]').value;
    var response_code = tpl.find('[name=response_code]').value;

    Meteor.call('addWebPath', projectId, hostId, path, port, response_code, function(err) {
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
      tpl.find('[name=path]').value = '';
      tpl.find('[name=port]').value = '';
      tpl.find('[name=response_code]').value = '';
      return true;
    })
  },

  'click #remove-path': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var paths = [];
    var inputs = $('.path-checked');
    inputs.each(function() {
      if ($(this).is(':checked')) {
        paths.push($(this).attr('id'));
      }
    });
    paths.forEach(function(id) {
      Meteor.call('removeWebPath', projectId, hostId, id);
    });
    inputs.each(function() {
      $(this).removeAttr('checked')
    });
  }
});
