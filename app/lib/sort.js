// Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
// See the file license.txt for copying permission

// sorting functions
// heard you like ternary, so i put a ternary in your ternary
sortLongAddr = function(a,b) {
  return (a.long_addr.low_ > b.long_addr.low_) ? 1 : ((b.long_addr.low_ > a.long_addr.low_) ? -1 : 0);
};

sortPort = function(a,b) {
  return (a.port > b.port) ? 1 : ((b.port > a.port) ? -1 : 0);
};

sortVuln = function(a,b) {
  return (b.cvss > a.cvss) ? 1: ((a.cvss > b.cvss) ? -1 : 0);
};

sortWeight = function(a,b) {
  return (b.weight > a.weight) ? 1: ((a.weight > b.weight) ? -1: 0);
};

sortTitle = function(a,b) {
  return (b.title > a.title) ? 1: ((a.title > b.title) ? -1: 0);
};