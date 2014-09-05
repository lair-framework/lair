// Copyright (c) 2014 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// add a cvss high, medium, or low according to the cvss score
// this is used only for the background color, nothing else
// if for some reason css can do number ranges then this could
// be removed
addVulnRating = function(v) {
  if (v.cvss >= 7.0) {
    v.rating = "high";
  }
  else if (v.cvss >= 4.0 && v.cvss < 7.0) {
    v.rating = "medium";
  }
  else if (v.cvss < 4.0) {
    v.rating = "low";
  }
  else {
    v.rating = "";
  }
  return v;
};
