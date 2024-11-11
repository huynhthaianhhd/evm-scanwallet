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
const INTERVAL = 100

async function main() {
  let count = 1
  setInterval(async () => {
    //
    await Promise.all(INSTANCES.map(ins => scan(ins)))
    //
    const requests = INSTANCES.length * count

    if (requests % 1000 === 0) {
      const text =
        'Server: ' +
        env.SERVER_NAME +
        '--- Instances: ' +
        INSTANCES.length +
        '--- Scanned: ' +
        requests

      console.log(text)
      sendMessage(text, NOTI_RUNNING)
    }
    count++
  }, INTERVAL)
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  main()
  console.log(`SC APP listening on port ${port}, INSTANCES: ${INSTANCES.length}`)
})
