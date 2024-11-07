const { Web3Factory } = require('./modules/web3Factory')
const env = require('./modules/env')
const express = require('express')
const app = express()
const port = process.env.PORT || 4000

const NOTI_RUNNING = '-1002158985462'
const NOTI_FOUND = '-1002151658507'

const MAX_LIMIT_REQUEST_PER_SECONDS = 5
const RPC_NODES = process.env.ETHEREUM_RPC_NODE ? process.env.ETHEREUM_RPC_NODE.split(';') : []
const INSTANCES = RPC_NODES.map(rpc => new Web3Factory(rpc, 'ethereum'))

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

async function scan(ethereumInstance) {
  try {
    const ethereumScanResult = await ethereumInstance.scanNetwork()
    if (ethereumScanResult.balance) {
      const text =
        'Balance: ' + ethereumScanResult.balance + ' - Keys: ' + ethereumScanResult.mnemonic
      sendMessage(text, NOTI_FOUND)
    }
  } catch (error) {
    console.log('error', error)
  }
}

async function runner() {
  try {
    for (let i = 0; i < MAX_LIMIT_REQUEST_PER_SECONDS; i++) {
      INSTANCES.forEach(ins => {
        scan(ins)
      })
    }
  } catch (error) {
    console.log('error', error)
  }
}
async function main() {
  let count = 1
  setInterval(() => {
    runner()
    if (count % 60 === 0) {
      const text =
        'Interval: ' +
        i +
        '--- Nodes: ' +
        RPC_NODES.length +
        '--- Max request: ' +
        MAX_LIMIT_REQUEST_PER_SECONDS +
        '--- Scanned: ' +
        i * RPC_NODES.length * MAX_LIMIT_REQUEST_PER_SECONDS
      sendMessage(text, NOTI_RUNNING)
    }
    count++
  }, 1000)
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  main()
  console.log(`SC APP listening on port ${port}, NODES: ${RPC_NODES.length}`)
})
