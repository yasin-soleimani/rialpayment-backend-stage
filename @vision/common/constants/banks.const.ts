import * as process from "process"

export const checkoutType = {
  sepah : 1,
  agri : 2
}

export const checkoutDeta = {
  url: process.env.CHECKOUT_SERVICE_URI.startsWith('http') ? process.env.CHECKOUT_SERVICE_URI : 'http://' + process.env.CHECKOUT_SERVICE_URI
}

export const TransferType = {
  sheba : 2,
  internal : 1
}