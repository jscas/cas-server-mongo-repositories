'use strict'

const introduce = require('introduce')(__dirname)

let log
let mongoose

module.exports.name = 'mongoTicketRegistry'
module.exports.plugin = function plugin (conf, context) {
  log = context.logger
  mongoose = context.dataSources.mongoose

  const LT = introduce('lib/tickets/LoginTicket')(mongoose)
  const ST = introduce('lib/tickets/ServiceTicket')(mongoose)
  const TGT = introduce('lib/tickets/TicketGrantingTicket')(mongoose)
  const TicketRegistry = introduce('lib/TicketRegistry')(log)
  const ticketRegistry = new TicketRegistry(mongoose, TGT.model, LT.model, ST.model)
  return ticketRegistry
}
