/* globals Accounts */
Accounts.config({
  sendVerificationEmail: false,
  forbidClientAccountCreation: true
})

Accounts.onCreateUser(function (options, user) {
  user.isAdmin = options.isAdmin || false
  return user
})
