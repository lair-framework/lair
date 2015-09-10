/* eslint-disable */
IssueRating = function (cvss) {
  var rating = ''
  if (cvss >= 7.0) {
      rating = 'high'
  } else if ( cvss >= 4.0 && cvss < 7.0) {
      rating = 'medium'
  } else if (cvss < 4.0) {
      rating = 'low'
  }
  return rating
}
