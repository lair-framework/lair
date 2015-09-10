/* globals Template Meteor Router Alerts Models */

Template.newPerson.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var person = Models.person()
    person.principalName = tpl.find('[name=principal-name]').value
    person.firstName = tpl.find('[name=firstname]').value || ''
    person.lastName = tpl.find('[name=lastname]').value || ''
    person.middleName = tpl.find('[name=middlename]').value || ''
    person.displayName = tpl.find('[name=displayname]').value || ''
    person.samAccountName = tpl.find('[name=samccount-name]').value || ''
    person.distinguishedName = tpl.find('[name=distinguished-name]').value || ''
    person.description = tpl.find('[name=description]').value || ''
    person.department = tpl.find('[name=department]').value || ''
    person.lastLogon = tpl.find('[name=lastlogon]').value || ''
    person.lastLogoff = tpl.find('[name=lastlogoff]').value || ''
    person.address = tpl.find('[name=address]').value || ''
    person.emails = tpl.find('[name=emails]').value.split('\n') || []
    if (person.emails.length > 0 && person.emails[0] === '') {
      person.emails = []
    }
    person.phones = tpl.find('[name=phones]').value.split('\n') || []
    if (person.phones.length > 0 && person.phones[0] === '') {
      person.phones = []
    }
    person.groups = tpl.find('[name=groups]').value.split('\n') || []
    if (person.groups.length > 0 && person.groups[0] === '') {
      person.groups = []
    }
    person.loggedIn = tpl.find('[name=loggedin]').value.split('\n') || []
    if (person.loggedIn.length > 0 && person.loggedIn[0] === '') {
      person.loggedIn = []
    }
    var references = tpl.find('[name=references]').value.split('\n') || []
    if (references.length > 0 && references[0] === '') {
      references = []
    }
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
      person.references.push({
        description: csv[0],
        username: csv[1],
        link: csv[2]
      })
    }
    var self = this
    Meteor.call('createPerson', this.projectId, person, function (err) {
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
