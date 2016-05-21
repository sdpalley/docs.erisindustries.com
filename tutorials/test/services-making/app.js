'use strict';

var
  contracts = require('eris-contracts'),
  address = require('./epm.json').deployStorageK,
  fs = require('fs'),
  abi = JSON.parse(fs.readFileSync("./abi/" + address)),
  account = require('./accounts.json'),
  chainUrl = "http://simplechain:1337/rpc",
  manager, contract;

// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl, account.simplechain_full_000);

// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address);

// Every second, display Idi's number and decrease it by one until 'times'
// reaches 0.
function iterate(times) {
  if (times > 0) {
    setTimeout(function () {
      // Here we get the current number from the contract.
      contract.get(function (error, result) {
        var
          number;

        if (error)
          console.error(error);
        else {
          number = parseInt(result['c'][0]);
          console.log("Idi's number is:\t\t\t" + number);
          console.log("\tlistening at:\t\t\t" + port);

          // Set the new number in the contract.
          contract.set(number - 1, function (error) {
            if (error)
              console.error(error);
            else
              iterate(times - 1);
          });
        }
      });
    }, 3000);
  }
}

// establish a fake port to listen to....
var port = process.env.IDI_PORT

// note the number of times, defaulting to 5 to do the get -> set reduction
var times = parseInt(process.env.TIMES) || 5

iterate(times);
