'use strict'

const Promise = require('bluebird')
let log

function ServiceRegistry (mongoose, ServiceSchema) {
  this.mongoose = mongoose
  this.Service = this.mongoose.model('jsCasService', ServiceSchema)
}

ServiceRegistry.prototype.close = function close () {
  // The server handles the mongoose connection.
  return Promise.resolve()
}

ServiceRegistry.prototype.getServiceWithName = function getServiceWithName (name) {
  return this.Service.findOne({
    name: {$eq: name}
  })
}

ServiceRegistry.prototype.getServiceWithUrl = function getServiceWithUrl (url) {
  log.debug('finding service with url: %s', url)
  return this.Service
      .findOne({
        url: {$eq: url}
      })
      .then((service) => {
        if (!service) {
          return Promise.reject(new Error(`no service matched url: ${url}`))
        }
        log.debug('found service: %s', service.name)
        return Promise.resolve(service)
      })
      .catch((err) => {
        log.error('mongoose error finding service: %s', err.message)
        return Promise.reject(err)
      })
}

module.exports = function init ($log) {
  if (log) {
    return ServiceRegistry
  }

  log = $log
  return ServiceRegistry
}
