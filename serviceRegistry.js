'use strict';

const introduce = require('introduce')(__dirname);

let log;
let mongoose;

module.exports.name = 'mongoServiceRegistry';
module.exports.plugin = function plugin(conf, context) {
  log = context.logger;
  mongoose = context.dataSources.mongoose;

  const Service = introduce('lib/Service')(mongoose);
  const ServiceRegistry = introduce('lib/ServiceRegistry')(log);
  const serviceRegistry = new ServiceRegistry(mongoose, Service.schema);

  return serviceRegistry;
};
