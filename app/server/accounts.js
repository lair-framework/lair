// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

Accounts.config({'sendVerificationEmail': false, 'forbidClientAccountCreation': false});
Accounts.onCreateUser(function(options, user) {
  user.isAdmin = options.isAdmin || false;
  return user;
});
