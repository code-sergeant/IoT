'use strict'
const { createHash } = require('crypto')
const { TransactionHandler } = require('sawtooth-sdk/processor')
const { InvalidTransaction } = require('sawtooth-sdk/processor/exceptions')
const { TransactionHeader } = require('sawtooth-sdk/protobuf')
const { TransactionProcessor } = require('sawtooth-sdk/processor')
const { JSONHandler } = require('./lamar-tp')

// transaction processor will initiate connection to the validator
const DEFAULT_VALIDATOR_URL = 'tcp://0.tcp.ngrok.io:17963'
let validatorUrl;

// validator url can be submitted as command line argument
// if not, set default value

// if (process.argv.length < 3) {
//   console.log('No validator url passed as argument, defaulting to: ' + DEFAULT_VALIDATOR_URL)
//   validatorUrl = DEFAULT_VALIDATOR_URL
// }
// else {
//   validatorUrl = process.argv[2]
// }

// initialize transaction processor
const tp = new TransactionProcessor(DEFAULT_VALIDATOR_URL)
// add custom handler
tp.addHandler(new JSONHandler())
tp.start()