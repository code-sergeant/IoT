'use strict'

const http = require('http')
const request = require('request');
const { createHash } = require('crypto')
const {
  signer,
  BatchEncoder,
  TransactionEncoder
} = require('sawtooth-sdk-client')


// arduino will connect to api of the first node
const API_URL = '5413be31.ngrok.io'
//const API_PORT = 8080

// helper function to generate addresses based on sha512 hash function 
const getAddress = (key, length = 64) => {
  return createHash('sha512').update(key).digest('hex').slice(0, length)
}

const FAMILY = 'LAMAR'
const PREFIX = getAddress(FAMILY, 6)

// create new key-pair
const makeKeyPair = () => {
  const privateKey = signer.makePrivateKey()
  return {
    public: signer.getPublicKey(privateKey),
    private: privateKey
  }
}

// fetch current state
const getState = function() {
  return new Promise(function(resolve, reject) {
    http.get(`http://${API_URL}/state?address=${PREFIX}`, (res) => {
      res.on('data', function (body) {
        let data = JSON.parse(body).data
        data = data.map(d => Buffer.from(d.data, 'base64'))
        data = data.map(d => JSON.parse(d))
        resolve(data)
      });
    })
  })
}

// submit signed transaction to validator
const submitUpdate = (payload, privateKey) => {
  // create data
  const transaction = new TransactionEncoder(privateKey, {
    inputs: [PREFIX],
    outputs: [PREFIX],
    familyName: FAMILY,
    familyVersion: '1.0',
    payloadEncoding: 'application/json',
    payloadEncoder: p => Buffer.from(JSON.stringify(p))
  }).create(payload)

  const batchBytes = new BatchEncoder(privateKey).createEncoded(transaction);
  
  console.log("batchBytes: ", batchBytes);

  request.post({
      url: `http://${API_URL}/batches`,
      headers: {'Content-Type': 'application/octet-stream'},
      body: batchBytes
    },
    function (error, response, body) {
        console.log("Error: ", error, "Respone: ", response.statusCode, " " , response.statusMessage ,"Body: ", body);
    }
  );
}

const keypair = makeKeyPair();

submitUpdate({action:'create', asset:"Test Asset", owner:keypair.public}, keypair.private)

console.log("keypair: ", keypair);

module.exports = {
  makeKeyPair,
  getState,
  submitUpdate
}