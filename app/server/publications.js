// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// owners and contributors can only see their own projects
Meteor.publish("projectListing", function() {
    return Projects.find({$or: [{owner: this.userId}, {contributors: this.userId}]},
      {fields: {project_name: 1, owner:1, contributors: 1, creation_date: 1}});
});

// session variable controls the selected project
// returns data from hosts, ports, and vulnerabilities for the selected project
// after verifying that the user is the owner or contributor of the supplied id
Meteor.publish("project", function(id) {
    var project = Projects.findOne(id);
    if (project && (project.owner === this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Projects.find(id);
    }
    return false;
});

Meteor.publish("counts", function(projectId, hostQuery, vulnQuery) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner === this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var hostCount = 0;
        var vulnCount = 0;
        var hostStatus = {"lair-grey": 0, "lair-blue": 0, "lair-orange": 0, "lair-green": 0, "lair-red": 0};
        var vulnStatus = {"lair-grey": 0, "lair-blue": 0, "lair-orange": 0, "lair-green": 0, "lair-red": 0};

        var initializing = true;
        var self = this;

        if(hostQuery) {
            hostQuery.project_id = projectId;
        } else {
            hostQuery = {"project_id": projectId};
        }

        if(vulnQuery) {
            vulnQuery.project_id = projectId;
        } else {
            vulnQuery = {"project_id": projectId};
        }

        // Host count
        var hostHandle = Hosts.find(hostQuery).observeChanges({
            added: function(id) {
                hostCount++;
                var host = Hosts.findOne({"_id": id}, {fields: {"_id": 1, "status": 1}});
                hostStatus[host.status]++;
                if(!initializing) {
                    self.changed("counts", projectId, {hostCount: hostCount});
                    self.changed("counts", projectId, {hostLairGrey: hostStatus["lair-grey"]});
                    self.changed("counts", projectId, {hostLairBlue: hostStatus["lair-blue"]});
                    self.changed("counts", projectId, {hostLairGreen: hostStatus["lair-green"]});
                    self.changed("counts", projectId, {hostLairOrange: hostStatus["lair-orange"]});
                    self.changed("counts", projectId, {hostLairRed: hostStatus["lair-red"]});
                }
            },
            removed: function(id) {
                hostCount--;
                self.changed("counts", projectId, {hostCount: hostCount});
                hostStatus["lair-grey"] = Hosts.find({"project_id": projectId, "status": 'lair-grey'}).count();
                hostStatus["lair-blue"] = Hosts.find({"project_id": projectId, "status": 'lair-blue'}).count();
                hostStatus["lair-green"] = Hosts.find({"project_id": projectId, "status": 'lair-green'}).count();
                hostStatus["lair-orange"] = Hosts.find({"project_id": projectId, "status": 'lair-orange'}).count();
                hostStatus["lair-red"] = Hosts.find({"project_id": projectId, "status": 'lair-red'}).count();
                self.changed("counts", projectId, {hostLairGrey: hostStatus["lair-grey"]});
                self.changed("counts", projectId, {hostLairBlue: hostStatus["lair-blue"]});
                self.changed("counts", projectId, {hostLairGreen: hostStatus["lair-green"]});
                self.changed("counts", projectId, {hostLairOrange: hostStatus["lair-orange"]});
                self.changed("counts", projectId, {hostLairRed: hostStatus["lair-red"]});
            },
            changed: function(id, fields) {
                hostStatus["lair-grey"] = Hosts.find({"project_id": projectId, "status": 'lair-grey'}).count();
                hostStatus["lair-blue"] = Hosts.find({"project_id": projectId, "status": 'lair-blue'}).count();
                hostStatus["lair-green"] = Hosts.find({"project_id": projectId, "status": 'lair-green'}).count();
                hostStatus["lair-orange"] = Hosts.find({"project_id": projectId, "status": 'lair-orange'}).count();
                hostStatus["lair-red"] = Hosts.find({"project_id": projectId, "status": 'lair-red'}).count();
                self.changed("counts", projectId, {hostLairGrey: hostStatus["lair-grey"]});
                self.changed("counts", projectId, {hostLairBlue: hostStatus["lair-blue"]});
                self.changed("counts", projectId, {hostLairGreen: hostStatus["lair-green"]});
                self.changed("counts", projectId, {hostLairOrange: hostStatus["lair-orange"]});
                self.changed("counts", projectId, {hostLairRed: hostStatus["lair-red"]});
            }
        });
        // Vulnerability count
        var vulnHandle = Vulnerabilities.find(vulnQuery).observeChanges({
            added: function(id) {
                vulnCount++;
                var vuln = Vulnerabilities.findOne({"_id": id}, {fields: {"_id": 1, "status": 1}});
                vulnStatus[vuln.status]++;
                if(!initializing) {
                    self.changed("counts", projectId, {vulnCount: vulnCount});
                    self.changed("counts", projectId, {vulnLairGrey: vulnStatus["lair-grey"]});
                    self.changed("counts", projectId, {vulnLairBlue: vulnStatus["lair-blue"]});
                    self.changed("counts", projectId, {vulnLairGreen: vulnStatus["lair-green"]});
                    self.changed("counts", projectId, {vulnLairOrange: vulnStatus["lair-orange"]});
                    self.changed("counts", projectId, {vulnLairRed: vulnStatus["lair-red"]});
                }
            },
            removed: function(id) {
                vulnCount--;
                self.changed("counts", projectId, {vulnCount: vulnCount});
                vulnStatus["lair-grey"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-grey'}).count();
                vulnStatus["lair-blue"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-blue'}).count();
                vulnStatus["lair-green"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-green'}).count();
                vulnStatus["lair-orange"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-orange'}).count();
                vulnStatus["lair-red"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-red'}).count();
                self.changed("counts", projectId, {vulnLairGrey: vulnStatus["lair-grey"]});
                self.changed("counts", projectId, {vulnLairBlue: vulnStatus["lair-blue"]});
                self.changed("counts", projectId, {vulnLairGreen: vulnStatus["lair-green"]});
                self.changed("counts", projectId, {vulnLairOrange: vulnStatus["lair-orange"]});
                self.changed("counts", projectId, {vulnLairRed: vulnStatus["lair-red"]});
            },
            changed: function(id, fields) {
                vulnStatus["lair-grey"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-grey'}).count();
                vulnStatus["lair-blue"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-blue'}).count();
                vulnStatus["lair-green"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-green'}).count();
                vulnStatus["lair-orange"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-orange'}).count();
                vulnStatus["lair-red"] = Vulnerabilities.find({"project_id": projectId, "status": 'lair-red'}).count();
                self.changed("counts", projectId, {vulnLairGrey: vulnStatus["lair-grey"]});
                self.changed("counts", projectId, {vulnLairBlue: vulnStatus["lair-blue"]});
                self.changed("counts", projectId, {vulnLairGreen: vulnStatus["lair-green"]});
                self.changed("counts", projectId, {vulnLairOrange: vulnStatus["lair-orange"]});
                self.changed("counts", projectId, {vulnLairRed: vulnStatus["lair-red"]});
            }
        });
        initializing = false;

        self.added("counts", projectId, {hostCount: hostCount});
        self.added("counts", projectId, {hostLairGrey: hostStatus["lair-grey"]});
        self.added("counts", projectId, {hostLairBlue: hostStatus["lair-blue"]});
        self.added("counts", projectId, {hostLairGreen: hostStatus["lair-green"]});
        self.added("counts", projectId, {hostLairOrange: hostStatus["lair-orange"]});
        self.added("counts", projectId, {hostLairRed: hostStatus["lair-red"]});
        self.added("counts", projectId, {vulnCount: vulnCount});
        self.added("counts", projectId, {vulnLairGrey: vulnStatus["lair-grey"]});
        self.added("counts", projectId, {vulnLairBlue: vulnStatus["lair-blue"]});
        self.added("counts", projectId, {vulnLairGreen: vulnStatus["lair-green"]});
        self.added("counts", projectId, {vulnLairOrange: vulnStatus["lair-orange"]});
        self.added("counts", projectId, {vulnLairRed: vulnStatus["lair-red"]});
        self.ready();
        self.onStop(function() {
            hostHandle.stop();
            vulnHandle.stop();
        });
    }
});

Meteor.publish("hosts", function(id, skip, lim, q) {
    if(!lim) {
        lim = 25;
    }
    if(!skip) {
        skip = 0;
    }
    if(!q) {
        q = {'project_id': id};
    }
    var project = Projects.findOne(id);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Hosts.find(
          q,
          {
              skip: skip,
              limit: lim,
              sort: {"long_addr": 1}
          }
        );
    }
    return false;
});

Meteor.publish("services", function(id) {
    var project = Projects.findOne(id);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Ports.find(
          {'project_id': id},
          {
              fields: {
                  "project_id": 1,
                  "host_id": 1,
                  "_id": 1,
                  "port": 1,
                  "protocol": 1,
                  "service": 1,
                  "product": 1,
                  "status": 1,
                  "credentials": 1,
                  "last_modified_by": 1
              },
              sort: {"port": 1, "product": 1}
          }
        );
    }
    return false;
});

Meteor.publish("servicesHosts", function(projectId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var ports = Ports.find({'project_id': projectId}, {fields: {"_id": 1, "host_id": 1}});
        if(!ports) {
            return false;
        }
        var hostIds = [];
        ports.forEach(function(port) {
            hostIds.push(port.host_id);
        });
        return Hosts.find(
          {'project_id': projectId, '_id': {"$in": _.uniq(hostIds)}},
          {
              fields: {"_id": 1, "project_id": 1, "string_addr": 1, "long_addr": 1},
              sort: {"long_addr": 1}
          }
        );
    }
    return false;
});

Meteor.publish("host", function(projectId, hostId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Hosts.find({'project_id': projectId, '_id': hostId});
    }

    return false;
});

Meteor.publish("hostNext", function(projectId, hostId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var hosts = Hosts.find(
            {'project_id': projectId},
            {
                fields: {"_id": 1, "long_addr": 1, "project_id": 1},
                sort: {"long_addr": 1}
            }
        ).fetch();

        var idx = _.indexOf(_.pluck(hosts, "_id"), hostId) + 1;
        // Wrap around to beginning if we were on last host
        if(idx >= hosts.length) {
            idx = 0;
        }

        return Hosts.find(
            {'project_id': projectId, 'long_addr': {"$gte": hosts[idx].long_addr}},
            {
                limit: 3,
                sort: {"long_addr": 1}
            }
        );
    }

    return false;
});

Meteor.publish("hostPrev", function(projectId, hostId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var hosts = Hosts.find(
            {'project_id': projectId},
            {
                fields: {"_id": 1, "long_addr": 1, "project_id": 1},
                sort: {"long_addr": 1}
            }
        ).fetch();

        var idx = _.indexOf(_.pluck(hosts, "_id"), hostId) - 1;
        // Wrap around to end if on first host
        if(idx < 0) {
            idx = hosts.length - 1;
        }

        return Hosts.find(
            {'project_id': projectId, 'long_addr': {"$gte": hosts[idx].long_addr}},
            {
                limit: 3,
                sort: {"long_addr": 1}
            }
        );
    }

    return false;
});

Meteor.publish("hostPorts", function(projectId, hostId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Ports.find({'project_id': projectId, 'host_id': hostId});
    }
    return false;
});

Meteor.publish("service", function(projectId, portId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var port = Ports.findOne({'_id': portId, 'project_id': projectId}, {fields: {'host_id': 1}});
        if(!port) {
            return false;
        }
        return Ports.find({'host_id': port.host_id});
    }
    return false;
});

Meteor.publish("serviceHost", function(projectId, portId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var port = Ports.findOne({'_id': portId, 'project_id': projectId}, {fields: {'host_id': 1}});
        if(!port) {
            return false;
        }
        return Hosts.find({'_id': port.host_id});
    }
    return false;
});

Meteor.publish("serviceVulnerabilities", function(projectId, portId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var port = Ports.findOne({'_id': portId, 'project_id': projectId}, {fields: {'host_id': 1}});
        if(!port) {
            return false;
        }
        var host = Hosts.findOne({'_id': port.host_id, 'project_id': projectId});
        if(!host) {
            return false;
        }
        return Vulnerabilities.find({'project_id': projectId, 'hosts.string_addr': host.string_addr});
    }
    return false;
});

Meteor.publish("hostVulnerabilities", function(projectId, hostId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var host = Hosts.findOne({'_id': hostId, 'project_id': projectId});
        if(!host) {
            return false;
        }
        return Vulnerabilities.find({'project_id': projectId, 'hosts.string_addr': host.string_addr});
    }
    return false;
});

Meteor.publish("vulnerability", function(projectId, vulnerabilityId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Vulnerabilities.find({'_id': vulnerabilityId, 'project_id': projectId});
    }
    return false;
});

Meteor.publish("vulnerabilityNext", function(projectId, vulnerabilityId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var vulnerabilities = Vulnerabilities.find(
            {'project_id': projectId},
            {
                fields: {"_id": 1, "cvss": 1, "title": 1, "project_id": 1},
                sort: {"cvss": -1, "title": 1}
            }
        ).fetch();

        var idx = _.indexOf(_.pluck(vulnerabilities, "_id"), vulnerabilityId) + 1;

        // Wrap around to beginning if we were on last vulnerability
        if(idx >= vulnerabilities.length) {
            idx = 0;
        }

        return Vulnerabilities.find(
            {'project_id': projectId},
            {
                skip: idx,
                limit: 3,
                sort: {"cvss": -1, "title": 1}
            }
        );
    }

    return false;
});

Meteor.publish("vulnerabilityPrev", function(projectId, vulnerabilityId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        // First query is used to determine the index of the current vulnerability in the sorted
        // collection.
        var vulnerabilities = Vulnerabilities.find(
            {'project_id': projectId},
            {
                fields: {"_id": 1, "cvss": 1, "title": 1, "project_id": 1},
                sort: {"cvss": -1, "title": 1}
            }
        ).fetch();

        var idx = _.indexOf(_.pluck(vulnerabilities, "_id"), vulnerabilityId) - 1;
        // Wrap around to end if on first vulnerability
        if(idx < 0) {
            idx = vulnerabilities.length - 1;
        }

        // Using the index of current record, select records from collection so that the previous
        /// document is the first element in the publication.
        return Vulnerabilities.find(
            {'project_id': projectId},
            {
                skip: idx,
                limit: 3,
                sort: {"cvss": -1, "title": 1}
            }
        );
    }

    return false;
});

Meteor.publish("vulnerabilityHosts", function(projectId, vulnerabilityId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var vuln = Vulnerabilities.findOne({'_id': vulnerabilityId, 'project_id': projectId});
        if(!vuln) {
            return false;
        }
        return Hosts.find({'project_id': projectId, 'string_addr': {"$in": _.pluck(vuln.hosts, "string_addr")}});
    }
    return false;
});

Meteor.publish("vulnerabilityPorts", function(projectId, vulnerabilityId) {
    var project = Projects.findOne(projectId);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        var vuln = Vulnerabilities.findOne({'_id': vulnerabilityId, 'project_id': projectId});
        if(!vuln) {
            return false;
        }
        var hosts = Hosts.find({'project_id': projectId, 'string_addr': {"$in": _.pluck(vuln.hosts, "string_addr")}});
        if(!hosts) {
            return false;
        }
        var hostIds = [];
        hosts.forEach(function(host) {
            hostIds.push(host._id);
        });
        return Ports.find({'project_id': projectId, 'host_id': {"$in": hostIds}});
    }
    return false;
});

Meteor.publish("vulnerabilities", function(id, skip, lim, q) {
    if(!lim) {
        lim = 25;
    }
    if(!skip) {
        skip = 0;
    }
    if(!q) {
        q = {'project_id': id};
    }
    var project = Projects.findOne(id);
    if (project && (project.owner == this.userId || _.indexOf(project.contributors, this.userId) > -1)) {
        return Vulnerabilities.find(
          q,
          {
              skip: skip,
              limit: lim,
              sort: {
                  "cvss": -1,
                  "title": 1
              }
          }
        );
    }
    return false;
});

// publish meteor users so you can add contributors
// check if logged in first to avoid user account enumeration
Meteor.publish("directory", function () {
    if (this.userId) {
        return Meteor.users.find({}, {fields: {emails: 1, profile: 1, isAdmin: 1}});
    } else {
        return Meteor.users.find({}, {fields: {createdAd: 1}});
    }
});

// publish settings
Meteor.publish("settings", function() {
    return Settings.find();
});
