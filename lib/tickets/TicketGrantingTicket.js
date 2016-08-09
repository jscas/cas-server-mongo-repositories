'use strict'

const introduce = require('introduce')(__dirname)

const name = 'jsCasTicketGrantingTicket'
let schema

function createSchema (mongoose, tlName) {
  if (schema) {
    return schema
  }
  return new mongoose.Schema({
    tid: {type: String, required: true, index: true, unique: true},
    created: {type: Date, required: true, default: new Date()},
    expires: {type: Date, required: true, default: new Date()},
    userId: {type: String, required: true, index: true},
    valid: {type: Boolean, required: true, default: true},
    services: [{type: mongoose.Schema.Types.ObjectId, ref: tlName}]
  })
}

module.exports = function init (mongoose) {
  const TrackedLogin = introduce('./TrackedLogin')(mongoose)

  schema = createSchema(mongoose, TrackedLogin.name)
  const model = mongoose.model(name, schema)
  return {schema, model, name}
}
