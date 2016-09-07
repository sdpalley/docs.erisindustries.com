---

layout: docs
title: "Tutorials | Deploying your Smart Contracts to a Chain (advanced)"

---

# Introduction

For this tutorial, we are going to work with multiple contracts. All the base contract does is get and sets a value, but we'll add some layers to the contract which will satisfy common patterns smart contract writers adopt.

## Dependencies

This sequence of tutorials assumes that you have an understanding of the `eris` tooling to the point we ended in our [101 tutorial sequence](/tutorials/getting-started/).

This tutorial assumes you have worked through the following advanced tutorials:

* [Get Started in the Cloud](/tutorials/advanced/cloud-getting-started/)
* [Advanced Chain Making](/tutorials/advanced/chain-making)
* [Chain Deploying to the Cloud](/tutorials/advanced/chain-deploying)

## Contracts Strategy

We are going to use a very simple `get` / `set` contract which sets a variable and gets that same variable. It is about the easiest interactive contract one can imagine and as such we will use that for showing how to work with the eris platform.

## Make a Chain

Let's make a chain with a few keys on it.

```bash
chains_dir=$HOME/.eris/chains
chain_name=advchain2
name_full="$chain_name"_full_000
name_part="$chain_name"_participant_000
chain_dir=$chains_dir/$chain_name
eris chains make --account-types=Full:1,Participant:1 $chain_name
key1_addr=$(cat $chain_dir/addresses.csv | grep $name_full | cut -d ',' -f 1)
eris chains start $chain_name --init-dir $chain_dir/$name_full 1>/dev/null
```

Check that it is running of course with `eris chains ls`.

# Let's make a more advanced get-set contract sequence.

The first thing we're going to do is to add a very simple contract.

```bash
cd ~/.eris/apps
mkdir advtut
cd advtut
```

Now you'll make a file in this directory. **Protip:** Get it with `curl -X GET https://raw.githubusercontent.com/eris-ltd/coding/master/contracts/advtut/GSFactory.sol -o GSFactory.sol`. Let's assume that is called `GSFactory.sol` and has the following contents

```javascript
contract GSContract {
  uint storedData;

  function set(uint x) {
    storedData = x;
  }

  function get() constant returns (uint retVal) {
    return storedData;
  }
}

contract GSFactory {
  address lastCreated;
  function create() returns (address GSAddr) {
    lastCreated = new GSContract();
    return lastCreated;
  }

  function getLast() returns (address GSAddr) {
    return lastCreated;
  }
}
```

This is a slightly more advanced set of contracts than that we used in the [101 tutorial sequence](/tutorials/contracts-deploying/). Also, now we have multiple contracts we are going to handle.

What do these contracts do? Well, they aren't terribly interesting we know. The first contract, the `GSContract`, merely `gets` and `sets` a value which is an unsigned integer type. The second contract, the `GSFactory`, merely makes a new `GSContract` when `create` is called or it returns the address of the most recent contract created when `getLast` is called.

# Fixup your epm.yaml

Next we need to make an epm.yaml. **Protip:** Get it with: `curl -X GET https://raw.githubusercontent.com/eris-ltd/coding/master/contracts/advtut/epm.yaml -o epm.yaml`. It should look like this:

```yaml
jobs:

- name: deployGSFactory
  job:
    deploy:
      contract: GSFactory.sol
      instance: all
      wait: true

- name: createGSContract
  job:
    call:
      destination: $deployGSFactory
      data: create
      abi: GSFactory
      wait: true

- name:  getGSAddr
  job:
    query-contract:
      destination: $deployGSFactory
      data: getLast
      abi: $deployGSFactory

- name: assertAddr
  job:
    assert:
      key: $getGSAddr
      relation: eq
      val: $createGSContract

- name: setStorage
  job:
    call:
      destination: $createGSContract
      data: set $setStorageBase
      abi: GSContract
      wait: true

- name: queryStorage
  job:
    query-contract:
      destination: $createGSContract
      data: get
      abi: GSContract

- name: assertStorage
  job:
    assert:
      key: $queryStorage
      relation: eq
      val: $setStorageBase
```

Now. What does this file mean? Well, this file is the manager file for how to deploy and test your smart contracts. eris:package_manager will read this file and perform a sequence of `jobs` with the various parameters supplied for the job type. It will perform these in the order they are built into the yaml file.

So let's go through them one by one and explain what each of these jobs are doing. For more on using various jobs [please see the jobs specification](/documentation/eris-pm/latest/jobs_specification/).

### Job 1: Deploy Job

This job will compile the `GSFactory.sol` contracts using Eris' compiler service (or run your own locally; which will be covered later in this tutorial). But which contract(s) will get deployed even though they both are in the contract? When we have more than one contract in a file, we designate the one eris:package_manager should deploy with the `instance` field.

Here we are asking eris:package_manager to deploy `all` of the contracts so that we will have an ABI for the `GSContract` address. This is something important to understand about Factory contracts. Namely that at some point you will have to deploy a "fake" contract to your chain so that the ABI for it is properly saved to the ABI folder.

### Job 2: Call Job

This job will send a call to the contract. eris:package_manager will automagically utilize the abi's produced during the compilation process and allow users to formulate contracts calls using the very simple notation of `functionName` `params`.

In this job we are explictly using the `abi` field, which is optional. ABI's are the encoding scheme for how we are able to "talk" to our contracts. When eris:package_manager compiles contracts it all will compile their ABIs and save them in the ABI folder (which by default is `./abi` where `./` is wherever your epm.yaml file is). It will save the files using both the name of the contract as well as the address of the contract which is deployed onto the chain.

We explicitly tell eris:package_manager in this call to use the GSFactory ABI. This ABI will be saved as above as the same name of the contract(s) which eris:package_manager finds.

Finally, it is waiting on the call to be sunk into a block before it will proceed.

### Job 3: Query Contract Job

This job is going to send what are alternatively called `simulated calls` or just `queries` to an accessor function of a contract. In other words, these are `read` transactions. We're selecting the abi to use here based on the job result paradigm. As stated above, ABI's are saved both as the names of the contracts when they are deployed but also as the address of the deployed contract. Since we only deployed one contract our ABI directory will have three files in it: `GSContract`, `GSFactory`, `B995CBBFA3BA0E7DFB0293BA008E0E98A75A53E3` (or whatever the address of the contract was). In this job we are using the result of the `deploy` job.

### Job 4: Assert Job

This job checks that the contract last deployed matches the return from the create.

### Job 5: Call Job

This job will send a call to the contract. We explicitly tell eris:package_manager in this call to use the GSContract ABI.

### Job 6: Query Contract Job

This job gets the value which was set in Job 7

### Job 7: Assert Job

This job checks that the get and set match.

# Deploy (and Test) The Contract

Now, we are ready to deploy this world changing contract.

```bash
eris pkgs do --chain "$chain_name" --address "$key1_addr" --set "setStorageBase=5"
```

Note that here we used both the `--address` flag to set the address which we would be using for the jobs and we also set the `setStorageBase` from a flag rather than from a job.

That's it! Your contract is all ready to go. You should see the output in `epm.json` which will have the transaction hash of the transactions as well as the address of the deployed `GSFactory.sol` contract. You can also see your ABI folder:

```bash
ls ~/.eris/apps/advtut/abi
```

# Working With a Local Compiler

Where are the contracts compiling? By default they are compiled using a microservice which we run at https://compilers.eris.industries. However, it is just as easy to run the compilers service locally and use that to compile contracts.

Let's turn on the compilers service:

```bash
eris services start compilers
```

The compilers image is big so downloading it will take a while.

Now we need to find the IP of the container.

```bash
eris services inspect compilers NetworkSettings.IPAddress
```

The above command under the hood pulls all of `eris services inspect compilers` and only returns the `NetworkSettings => IPAddress` field. Pretty nifty huh! Let's save that as a variable.

```bash
compiler_addr=$(eris services inspect compilers NetworkSettings.IPAddress)
```

Now, we'll rerun the compile and use our local compiler!

```bash
eris pkgs do --chain "$chain_name" --address "$key1_addr" --set "setStorageBase=5" --compiler http://$compiler_addr:9099
```

It should work just the same only against your local compiler! (This should be helpful in collaborative settings behind a firewall)

# Clean Up

Let's clean up after ourselves

```bash
eris services stop -rx compilers keys
eris chains stop -rxf $chain_name
```

# Where to next?

**Next you'll want to move on to [advanced services making](/tutorials/advanced/services-making/).**
