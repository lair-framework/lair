/* globals Template Meteor Router Alerts */

Template.person.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    this.person.firstName = tpl.find('[name=firstname]').value || ''
    this.person.lastName = tpl.find('[name=lastname]').value || ''
    this.person.middleName = tpl.find('[name=middlename]').value || ''
    this.person.displayName = tpl.find('[name=displayname]').value || ''
    this.person.samAccountName = tpl.find('[name=samccount-name]').value || ''
    this.person.distinguishedName = tpl.find('[name=distinguished-name]').value || ''
    this.person.description = tpl.find('[name=description]').value || ''
    this.person.department = tpl.find('[name=department]').value || ''
    this.person.lastLogon = tpl.find('[name=lastlogon]').value || ''
    this.person.lastLogoff = tpl.find('[name=lastlogoff]').value || ''
    this.person.address = tpl.find('[name=address]').value || ''
    this.person.emails = tpl.find('[name=emails]').value.split('\n') || []
    if (this.person.emails.length > 0 && this.person.emails[0] === '') {
      this.person.emails = []
    }
    this.person.phones = tpl.find('[name=phones]').value.split('\n') || []
    if (this.person.phones.length > 0 && this.person.phones[0] === '') {
      this.person.phones = []
    }
    this.person.groups = tpl.find('[name=groups]').value.split('\n') || []
    if (this.person.groups.length > 0 && this.person.groups[0] === '') {
      this.person.groups = []
    }
    this.person.loggedIn = tpl.find('[name=loggedin]').value.split('\n') || []
    if (this.person.loggedIn.length > 0 && this.person.loggedIn[0] === '') {
      this.person.loggedIn = []
    }
    var references = tpl.find('[name=references]').value.split('\n') || []
    if (references.length > 0 && references[0] === '') {
      references = []
    }
    this.person.references = []
    for (var i = 0; i < references.length; i++) {
      var csv = references[i].split(',')
      if (csv.length !== 3) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: 'Invalid CSV in references'
        })
        return
      }
      this.person.references.push({
        description: csv[0],
        username: csv[1],
        link: csv[2]
      })
    }
    var self = this
    Meteor.call('updatePerson', this.projectId, this.person._id, this.person, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + self.projectId + '/people')
    })
  }
})
