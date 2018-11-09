const _ = require('lodash')

exports.tap = _.partialRight(_.tap, console.log)