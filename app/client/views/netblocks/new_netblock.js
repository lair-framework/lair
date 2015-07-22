/* globals Template Meteor Router Alerts */

Template.newNetblock.events({
  'submit form': function (event, tpl) {
    event.preventDefault()
    var netblock = {
      asn: tpl.find('[name=asn]').value,
      asnCountryCode: tpl.find('[name=asn-country-code]').value,
      asnCidr: tpl.find('[name=asn-cidr]').value,
      asnDate: tpl.find('[name=asn-date]').value,
      asnReg: tpl.find('[name=asn-reg]').value,
      cidr: tpl.find('[name=cidr]').value,
      description: tpl.find('[name=description]').value,
      handle: tpl.find('[name=handle]').value,
      abuseEmails: tpl.find('[name=abuse-emails]').value,
      miscEmails: tpl.find('[name=misc-emails]').value,
      techEmails: tpl.find('[name=tech-emails]').value,
      name: tpl.find('[name=name]').value,
      city: tpl.find('[name=city]').value,
      state: tpl.find('[name=state]').value,
      country: tpl.find('[name=country]').value,
      postalCode: tpl.find('[name=postal-code]').value,
      created: tpl.find('[name=created]').value,
      updated: tpl.find('[name=updated]').value
    }
    var projectId = this.projectId
    Meteor.call('createNetblock', projectId, netblock, function (err) {
      if (err) {
        Alerts.insert({
          class: 'alert-error',
          strong: 'Error',
          message: err.reason
        })
        return
      }
      Router.go('/projects/' + projectId + '/netblocks')
    })
  }
})
