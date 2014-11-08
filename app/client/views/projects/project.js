// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

function drawChart(hostChartCtx, vulnerabilityChartCtx) {
  if (!Session.equals('projectId', null) && Session.equals('loading', false)) {

    if (!Session.equals('hostChartData', null)) {
      var hostChart = new Chart(hostChartCtx).Doughnut(Session.get('hostChartData'));
    }
    if (!Session.equals('vulnerabilityChartData', null)) {
      var vulnerabilityChart = new Chart(vulnerabilityChartCtx).Doughnut(Session.get('vulnerabilityChartData'));
    }
  }

}

Template.projectDetail.rendered = function() {
    var hostChartCtx = $("#hostChart").get(0).getContext("2d");
    var vulnerabilityChartCtx = $("#vulnerabilityChart").get(0).getContext("2d");
    Deps.autorun(function() {
        var pixelRatio = window.devicePixelRatio || 1;
        Template.project.width = 404 / pixelRatio;
        Template.project.height = 404 / pixelRatio;

        if (!Session.equals('projectId', null) && Session.equals('loading', false)) {
            drawChart(hostChartCtx, vulnerabilityChartCtx);
        }
    });
};


var grey = '#959595';
var blue = '#67c2ef';
var green = '#80cd3b';
var orange = '#fa9a4b';
var red = '#fa603d';

Template.projectDetail.project = function() {
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
  var vulnerabilityData = [];

  hostData.push({value: Counts.findOne(project._id).hostLairGrey, color: grey});
  hostData.push({value: Counts.findOne(project._id).hostLairBlue, color: blue});
  hostData.push({value: Counts.findOne(project._id).hostLairGreen, color: green});
  hostData.push({value: Counts.findOne(project._id).hostLairOrange, color: orange});
  hostData.push({value: Counts.findOne(project._id).hostLairRed, color: red});

  vulnerabilityData.push({value: Counts.findOne(project._id).vulnLairGrey, color: grey});
  vulnerabilityData.push({value: Counts.findOne(project._id).vulnLairBlue, color: blue});
  vulnerabilityData.push({value: Counts.findOne(project._id).vulnLairGreen, color: green});
  vulnerabilityData.push({value: Counts.findOne(project._id).vulnLairOrange, color: orange});
  vulnerabilityData.push({value: Counts.findOne(project._id).vulnLairRed, color: red});

  Session.set('projectId', project._id);
  Session.set('hostChartData', hostData);
  Session.set('vulnerabilityChartData', vulnerabilityData);
  project.isOwner = project.owner === Meteor.userId();
  project.contributors = Meteor.users.find({"_id": {$in: project.contributors}}).fetch();
  project.owner = Meteor.users.findOne(project.owner).emails[0].address;
  return project;
};

Template.project.projectId = function() {
    return Session.get('projectId');
}

Template.project.loading = function() {
  return Session.get('loading');
};

Template.projectDetail.events({
  'click #export-local': function() {
    var projectId = Session.get('projectId');
    //var data = prepareExport(projectId);
    Meteor.call('downloadProject', Session.get('projectId'), function(err, res){
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Download Failed"});
      }
      var blob = new Blob([JSON.stringify(res, null, 4)], {type: "text/plain;charset=utf-8"});
      saveAs(blob, projectId + ".json");
      return Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Download Complete"});
    });

  },

  'click #export-project': function(event, tpl) {
    var url = tpl.find('[name=url]').value;
    var username = tpl.find('[name=username]').value;
    var password = tpl.find('[name=password]').value;
    Meteor.call('exportProject', Session.get('projectId'), url, username, password, function(err){
      if (err) {
        return Alerts.insert({"class": "alert-error", "strong": "Error", "message": "Export Failed"});
      }
      return Alerts.insert({"class": "alert-success", "strong": "Success", "message": "Export Complete"});
    });
  },

  'click #remove-project': function() {
    return Meteor.call('removeProject', Session.get('projectId'), function(err) {
      Session.set('projectId', null);
      if (err) {
        Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
    });
  },

  'click #leave-project': function() {
    return Meteor.call('removeContributor', Session.get('projectId'), Meteor.userId(), function(err) {
      Session.set('projectId', null);
      if (err) {
        Alerts.insert({"class": "alert-error", "strong": "Error", "message": err.reason});
      }
    });
  },
});
