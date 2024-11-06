const { Web3Factory } = require('./modules/web3Factory')
const env = require('./modules/env')
const express = require('express')
const app = express()
const port = process.env.PORT || 4000

const NOTI_RUNNING = '-1002158985462'
const NOTI_FOUND = '-1002151658507'

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

async function main() {
  const rpcNodes = env.ETHEREUM_RPC_NODE ? env.ETHEREUM_RPC_NODE.split(',') : []
  const instances = rpcNodes.map(rpc => new Web3Factory(rpc, 'ethereum'))
  let i = 1
  while (true) {
    const promises = instances.map(ins => scan(ins))
    await Promise.all(promises)

    if (i % 2000 === 0) {
      console.log('Run times: ', i)
      const text = 'Server: ' + env.SERVER_NAME + ' --- Scanned: ' + i * rpcNodes.length
      sendMessage(text, NOTI_RUNNING)
    }

    i = i + 1
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)

  try {
    main()
  } catch (error) {
    console.log('error', error)
  }
})
