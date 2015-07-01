/* globals Match check StatusMap */

Matchers = { // eslint-disable-line
  isNonEmptyString: Match.Where(function (x) {
    check(x, String)
    return x.length > 0
  }),

  isEmail: Match.Where(function (x) {
    check(x, String)
    return x.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)
  }),

  isObjectId: Match.Where(function (x) {
    check(x, String)
    return x.match(/^[a-zA-Z0-9]{17,24}$/)
  }),

  isIPv4: Match.Where(function (x) {
    check(x, String)
    return x.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
  }),

  isMAC: Match.Where(function (x) {
    check(x, String)
    return x.match(/^([0-9a-fA-F]{2}[:-]){5}([0-9a-fA-F]{2})$/) || x === ''
  }),

  isValidStatus: Match.Where(function (x) {
    check(x, String)
    return StatusMap.indexOf(x) > -1
  }),

  isPort: Match.Where(function (x) {
    check(x, Number)
    return x >= 0 && x <= 65535
  }),

  isCVSS: Match.Where(function (x) {
    check(x, Number)
    return x >= 0.0 && x <= 10.0
  }),

  isCVE: Match.Where(function (x) {
    check(x, String)
    return x.match(/^[0-9]{4}-[0-9]{4}$/)
  })
}
