// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

string2Hex = function(s) {
  var hex = '';
  for (var i=0; i < s.length; i++) {
    hex += s.charCodeAt(i).toString(16);
  }
  return hex;
};
