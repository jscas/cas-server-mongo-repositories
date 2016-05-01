'use strict';

const introduce = require('introduce')(__dirname);

const name = 'jsCasServiceTicket';
let Service;
let schema;

/* eslint quote-props: "off" */
function createSchema(mongoose, serviceName, tgtName) {
  if (schema) {
    return schema;
  }
  schema = new mongoose.Schema({
    tid: {type: String, required: true, index: true},
    created: {type: Date, required: true, default: new Date()},
    expires: {type: Date, required: true, default: new Date()},
    valid: {type: Boolean, required: true, default: true},
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: serviceName
    },
    ticketGrantingTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tgtName
    }
  });
  return schema;
}

module.exports = function init(mongoose) {
  const TicketGrantingTicket = introduce('./TicketGrantingTicket')(mongoose);

  Service = introduce('../Service')(mongoose);
  schema = createSchema(mongoose, Service.name, TicketGrantingTicket.name);

  const model = mongoose.model(name, schema);
  return {schema, model, name};
};
