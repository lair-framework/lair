Template.hostWebDirectoryList.projectId = function() {
  return Session.get('projectId');
};

Template.hostWebDirectoryList.hostId = function() {
  return Session.get('hostId');
}

Template.hostWebDirectoryList.moreToShow = function() {
  if (Template.hostWebDirectoryList.total() > Session.get('hostWebDirectoryLimit')) {
    return true;
  }

  return false;
};

Template.hostWebDirectoryList.total = function() {
  return WebDirectories.find({'project_id': Session.get('projectId'), 'host_id': Session.get('hostId')}).count();
};

Template.hostWebDirectoryList.flagFilter = function() {
  return Session.get('webDirectoryFlagFilter');
};

Template.hostWebDirectoryList.rendered = function() {
    console.log('');
    // if(!this._rendered) {
    //   this._rendered = true;
    //   console.log('Template onLoad');
    // }
}

Template.hostWebDirectoryList.paths = function() {
  var projectId = Session.get('projectId');
  var hostId = Session.get('hostId');
  var host = Hosts.findOne(hostId);
  if(!host) {
    return false;
  }
  
  var limit = Session.get('hostWebDirectoryLimit') || 25;
  var query = {'project_id': projectId, 'host_id': hostId};

  if (Session.equals('webDirectoryFlagFilter', 'enabled')) {
    query.flag = true;
  }

  var search = Session.get('webDirectorySearch');
  if (search) {
    query.$or = [
      {"port": {"$regex": search, "$options": "i"}},
      {"response_code": {"$regex": search, "$options": "i"}},
      {"path": {$regex: search, "$options": "i"}},
      {"last_modified_by": {$regex: search, "$options": "i"}}
    ];
  }

  return WebDirectories.find(query, {'limit': limit, sort: {'response_code': 1, 'path_clean': 1}}).fetch();
};

Template.hostWebDirectoryList.searchTerm = function() {
  return Session.get('webDirectorySearch');
};

Template.hostWebDirectoryList.events({
  'click .flag-enabled': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    return Meteor.call('disableWebDirectoryFlag', projectId, hostId, this.path_clean);
  },

  'click .flag-disabled': function() {
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    return Meteor.call('enableWebDirectoryFlag', projectId, hostId, this.path_clean);
  },

  'click #flag-filter-enable': function() {
    return Session.set('webDirectoryFlagFilter', 'enabled');
  },

  'click #flag-filter-disable': function() {
    return Session.set('webDirectoryFlagFilter', null);
  },

  'submit form': function(event, tpl) {
    event.preventDefault();
    var projectId = Session.get('projectId');
    var hostId = Session.get('hostId');
    var path = tpl.find('[name=path]').value;
    var port = tpl.find('[name=port]').value;
    var response_code = tpl.find('[name=response_code]').value;

    Meteor.call('addWebDirectory', projectId, hostId, path, port, response_code, function(err) {
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
      Meteor.call('removeWebDirectory', projectId, hostId, id);
    });
    inputs.each(function() {
      $(this).prop('checked',false);
    });

    $('input[name="select-all-shown"]').prop('checked', false);
  },

  'keyup #directory-search': function(event, tpl)  {
    Session.set('webDirectorySearch', tpl.find('#directory-search').value);

    $('input[type="checkbox"]').each(function() {
      $(this).removeAttr('checked');
    });
  },

  'click #load-more': function() {
    var previousLimit = Session.get('hostWebDirectoryLimit') || 25;
    var newLimit = previousLimit + 25;
    Session.set('hostWebDirectoryLimit', newLimit);
  },

  'click #load-all': function() {
    Session.set('hostWebDirectoryLimit', 65535);
  },

  'change #select-all-shown': function() {
    if ($('input[name="select-all-shown"]').is(':checked')) {  
      $('.path-checked').each(function() {
        $(this).prop('checked',true);
      });
    } else {
      $('.path-checked').each(function() {
        $(this).prop('checked',false);
      });
    }
  }
});
