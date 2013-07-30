// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Template.project.rendered = function() {
  var pixelRatio = window.devicePixelRatio || 1;
  Template.project.width = 404 / pixelRatio;
  Template.project.height = 404 / pixelRatio;

  if (!Session.equals('projectId', null)) {
    var hostChartCtx = $("#hostChart").get(0).getContext("2d");
    var serviceChartCtx = $("#serviceChart").get(0).getContext("2d");
    var vulnerabilityChartCtx = $("#vulnerabilityChart").get(0).getContext("2d");
    if (!Session.equals('hostChartData', null)) {
      var hostChart = new Chart(hostChartCtx).Doughnut(Session.get('hostChartData'));
    }
    if (!Session.equals('serviceChartData', null)) {
      var serviceChart = new Chart(serviceChartCtx).Doughnut(Session.get('serviceChartData'));
    }
    if (!Session.equals('vulnerabilityChartData', null)) {
      var vulnerabilityChart = new Chart(vulnerabilityChartCtx).Doughnut(Session.get('vulnerabilityChartData'));
    }
  }
};

var grey = '#959595';
var blue = '#67c2ef';
var green = '#80cd3b';
var orange = '#fa9a4b';
var red = '#fa603d';

Template.project.project = function() {
  var project = null;
  if (Session.equals('projectId', null)) {
    project = Projects.findOne();
    if (!project) {
      return false;
    }
    Session.set('projectId', project._id);
  }
  project = Projects.findOne(Session.get('projectId'));
  if (!project) {
    return false;
  }
  var hostData = [];
  var serviceData = [];
  var vulnerabilityData = [];
  hostData.push({value: Hosts.find({"project_id": project._id, "status": 'lair-grey'}).count(), color: grey});
  hostData.push({value: Hosts.find({"project_id": project._id, "status": 'lair-blue'}).count(), color: blue});
  hostData.push({value: Hosts.find({"project_id": project._id, "status": 'lair-green'}).count(), color: green});
  hostData.push({value: Hosts.find({"project_id": project._id, "status": 'lair-orange'}).count(), color: orange});
  hostData.push({value: Hosts.find({"project_id": project._id, "status": 'lair-red'}).count(), color: red});

  serviceData.push({value: Ports.find({"project_id": project._id, "status": 'lair-grey'}).count(), color: grey});
  serviceData.push({value: Ports.find({"project_id": project._id, "status": 'lair-blue'}).count(), color: blue});
  serviceData.push({value: Ports.find({"project_id": project._id, "status": 'lair-green'}).count(), color: green});
  serviceData.push({value: Ports.find({"project_id": project._id, "status": 'lair-orange'}).count(), color: orange});
  serviceData.push({value: Ports.find({"project_id": project._id, "status": 'lair-red'}).count(), color: red});

  vulnerabilityData.push({value: Vulnerabilities.find({"project_id": project._id, "status": 'lair-grey'}).count(), color: grey});
  vulnerabilityData.push({value: Vulnerabilities.find({"project_id": project._id, "status": 'lair-blue'}).count(), color: blue});
  vulnerabilityData.push({value: Vulnerabilities.find({"project_id": project._id, "status": 'lair-green'}).count(), color: green});
  vulnerabilityData.push({value: Vulnerabilities.find({"project_id": project._id, "status": 'lair-orange'}).count(), color: orange});
  vulnerabilityData.push({value: Vulnerabilities.find({"project_id": project._id, "status": 'lair-red'}).count(), color: red});

  Session.set('projectId', project._id);
  Session.set('hostChartData', hostData);
  Session.set('serviceChartData', serviceData);
  Session.set('vulnerabilityChartData', vulnerabilityData);
  project.isOwner = project.owner === Meteor.userId();
  project.owner = Meteor.users.findOne(project.owner).emails[0].address;
  return project;
};

Template.project.events({
  'click #export-project': function(event, tpl) {
    var url = tpl.find('[name=url]').value;
    var username = tpl.find('[name=username]').value;
    var password = tpl.find('[name=password]').value;
    Meteor.call('exportProject', Session.get('projectId'), url, username, password, function(err){
      if (err) {
        console.log(err.reason);
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Export Failed"});
      }
      return Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Export Complete"});
    });
  },

  'click #remove-project': function() {
    return Meteor.call('removeProject', Session.get('projectId'), function(err) {
      if (err) {
        Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
    });
  },

  'click #leave-project': function() {
    return Meteor.call('removeContributor', Session.get('projectId'), Meteor.userId(), function(err) {
      if (err) {
        Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
    });
  },
});