require('dotenv').config()

module.exports = env = {
  ETHEREUM_RPC_NODE: process.env.ETHEREUM_RPC_NODE,
  SERVER_NAME: process.env.SERVER_NAME,
  BOT_TOKEN: process.env.BOT_TOKEN
}
