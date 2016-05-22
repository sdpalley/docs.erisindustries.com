'use strict'

var contracts = require('eris-contracts')
var http = require('http')
var address = require('./epm.json').deployStorageK
var fs = require('fs')
var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'))
var account = require('./accounts.json')
var chainUrl
var manager
var contract
var server

chainUrl = 'http://simplechain:1337/rpc'

// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl,
  account.simplechain_full_000)

// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address)

// Create an HTTP server.
server = http.createServer(function (request, response) {
  var
    body

  switch (request.message) {
    case 'GET':
      // Get the value from the contract and return it to the HTTP client.
      contract.get(function (error, value) {
        if (error) {
          response.statusCode = 500
        } else {
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.write(value)
        }

        response.end()
      })

      break

    case 'PUT':
      body = ''

      request.on('data', function (chunk) {
        body += chunk
      })

      request.on('end', function () {
        console.log('Setting ' + body)

        // Set the value in the contract.
        contract.set(JSON.parse(body), function (error) {
          response.statusCode = error ? 500 : 200
          response.end()
        })
      })

      break

    default:
      response.statusCode = 501
      response.end()
  }
})

// Tell the server to listen to incoming requests on the port specified in the
// environment.
server.listen(process.env.IDI_PORT)
