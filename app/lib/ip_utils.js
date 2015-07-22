IPUtils = { // eslint-disable-line
  ip2Long: function (ip) {
    var b = (ip + '').split('.')
    return ((b[0] || 0) << 24 | (b[1] || 0) << 16 | (b[2] || 0) << 8 | (b[3] || 0)) >>> 0
  },
  sortLongAddr: function (a, b) {
    return (a.long_addr > b.long_addr) ? 1 : ((b.long_addr > a.long_addr) ? -1 : 0)
  }
}
