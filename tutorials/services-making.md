---

layout: docs
title: "Tutorials | Making and Using eris-services"

---

# Dependencies

This tutorial is a continuation of our [contracts interacting tutorial](/tutorials/contracts-interacting). If you have not completed that tutorial, please do so before working with this tutorial. Once we have a chain made, some contracts deployed to our chain, and a script to interact with them, we may want to be able to share that script with our colleagues *or* we may want to turn that script into a longer running microservice which is necessary for the applications we're building.

To do this we will need to do two things: (1) docker-ize our scripts or daemons; and (2) marmot-ize our docker image.

Along the way we are going to learn more about how docker works and how `eris` leverages docker under the hood to simplify your blockchain application making and operating.

# Introduction

What we are going to change up the old idi contract so that it does a few things for us which will be helpful for us to learn about docker and eris later.

# Copy Over Your Previous `idi` Application

```bash
cd ~/.eris/apps # or, wherever you made the idi app
cp -r idi idi-service # or whatever you would like to call it
```

That will give us a new base application. Now this tutorial will assume that your simple chain is still around and that all of the key and capabilities based permission is all well and good. It will also assume that your contracts are running on the chain. If you have followed the previous tutorials and are coming back to this later with no docker containers or anything (but you have all of the old files on your hard drive) that is a-OK. With `eris` we can get you back up and running in no time.

# Change Idi's `app.js`

In the previous tutorial Idi was interactive. Typically interactive (clis) are not what we would use `eris-services` for. So what are eris-services? Let's ask `eris`.

```bash
eris services
```

Basically, services are daemons or microservices which you need for the applications you are running. "Things that you turn on or off." They are quick to boot, easy to share, and very customizable. Basically they're docker images. But in order to explore what this even means, we need to edit the app.js so it does a few things differently than the little cli version of idi we built before.

Copy this as the new app.js. **Protip:** Get it (after `rm app.js`) with `curl -X GET https://raw.githubusercontent.com/eris-ltd/coding/master/contracts/idi/new_app.js -o app.js`.

```javascript
'use strict'

var contracts = require('eris-contracts')
var fs = require('fs')
var http = require('http')
var address = require('./epm.json').deployStorageK
var abi = JSON.parse(fs.readFileSync('./abi/' + address, 'utf8'))
var accounts = require('./accounts.json')
var chainUrl
var manager
var contract
var server

chainUrl = 'http://localhost:1337/rpc'

// Instantiate the contract object manager using the chain URL and the account
// data.
manager = contracts.newContractManagerDev(chainUrl,
  accounts.simplechain_full_000)

// Instantiate the contract object using the ABI and the address.
contract = manager.newContractFactory(abi).at(address)

// Create an HTTP server.
server = http.createServer(function (request, response) {
  var body
  var value

  switch (request.method) {
    case 'GET':
      console.log("Received request to get Idi's number.")

      // Get the value from the contract and return it to the HTTP client.
      contract.get(function (error, result) {
        if (error) {
          response.statusCode = 500
        } else {
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json')
          response.write(JSON.stringify(result['c'][0]))
        }

        response.end('\n')
      })

      break

    case 'PUT':
      body = ''

      request.on('data', function (chunk) {
        body += chunk
      })

      request.on('end', function () {
        value = JSON.parse(body)
        console.log("Received request to set Idi's number to " + value + '.')

        // Set the value in the contract.
        contract.set(value, function (error) {
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
server.listen(process.env.IDI_PORT, function () {
  console.log('Listening for HTTP requests on port ' + process.env.IDI_PORT +
    '.')
})
```

Note the changes between this script and the previous script.  We've removed the interactive feature and replaced it with a [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) API server.

In addition, we will be populating two variables from environment variables. In `docker`-land we often use environment variables as an easy way to get containers running how we want them.

With that in mind, when you're crafting services for to be used in docker, it is generally a good idea to use env variables for when you want to answer the "how should I be running" question. Obviously many services will also use config files, but for eris systems we generally find it is better when crafting services to override config files with envirnoment variables (and to override those with flags).

# A Quick Test

Lets do a quick test to make sure everything appears to be running correctly before we build this script into a docker image and subsequently into an eris service.

## Step 1: Get the Chain On.

```bash
eris chains ls
```

If your simplechain is running then you're chain is on, please skip to the last step in this `Quick Test` section.

If your simplechain is present but not running then just start it with.

```bash
eris chains start simplechain
```

If your simplechain is not present then just start it with.

```bash
eris chains new simplechain --dir simplechain
```

As usual, `eris` is a quiet tool. Let's make sure our chain is running.

```bash
eris chains ls
```

## Step 2: Deploy the Contracts.

Let's get our address as in previous tutorials:

```bash
addr=$(cat $chain_dir/addresses.csv | grep simplechain_full_000 | cut -d ',' -f 1)
echo $addr
```
Now we're set up.

```bash
eris pkgs do --chain simplechain --address $addr
```

**Troubleshooting**

If you get an accounts not registered error, then check the following:

* what are your addresses (`cat $chain_dir/addrX`)?
* are those addresses known to eris keys (`eris actions do keys list`)?
* are those addresses in the genesis block (`eris chains cat simplechain genesis`)?
* what account does your epm.yaml use (`cat ~/.eris/apps/idi/epm.yaml`)?
* what account does your account.json use (`cat ~/.eris/apps/idi-service/account.json`)?

If you have been following this tutorial sequence so far that checklist should ferret out your problem (or you can find where to find the fix!).

**End Troubleshooting**

## Step 3: Run the New app.js

```bash
cd ~/.eris/apps/idi-service
node app.js
```

That should output the following message:

```shell
Listening for HTTP requests on port undefined.
```

If you do not have any errors then you're all set to go.

# Make a Dockerfile

Docker. People love it or they hate. We think has its place in the future of distributed systems and the marmots love it! Let's see how easy it is to build a Dockerfile. First do this in your command line:

```bash
cd ~/.eris/apps/idi-service
touch Dockerfile
```

Then open the Dockerfile in your favorite text editor.

```docker
FROM node:4-onbuild
```

That's all we need to tell docker what to do here, fun ha! Now we need to make one more change to our package.json. Edit it so it looks like this:

```json
{
  "name": "idis_app",
  "version": "0.0.1",
  "scripts": { "start" : "node app.js" },
  "dependencies": {
    "eris-contracts": "^0.13.1"
  }
}
```

Note the changes here, we have added a [start script](https://docs.npmjs.com/misc/scripts#default-values) to the package.json and we have removed the dependency for the command line tool.

# Build Idi's Image

OK. Now we're ready to build our docker image!

```bash
docker build -t idiservice .
```

What that's going to do is to tell Docker to take this directory and build the Dockerfile in it. After it does its going to give it a `tag` of `idiservice`. When you build a docker image you will nearly always give it a `tag`. Tags in dockerland are like `names` in other lands.

**Troubleshooting**

If you are behind a firewall then you may need to let npm know which proxy to use to tunnel through the firewall. To do that you'll need to refactor your dockerfile too look something like this:

```
FROM node:4.3.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm config set proxy http://myproxy.com

COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD [ "npm", "start" ]
```

**End Troubleshooting**

## What is a Docker Image

A [Docker Image](https://docs.docker.com/engine/introduction/understanding-docker/) is a layered, statically compiled, file system. Each line in a Dockerfile represents a way to build the require functionality that is included in the produced docker image. You can think of docker images as _the thing_ that can get us a whole lot of verifiable computing because of its deterministic methods of building and static nature. Once a docker image is built it can never be changed. (But you can remove it and replace it with a new docker image of the same name of course).

In other words, its the "thing" that we're going to "turn on or off" with the eris services commands. To see the docker images which we have available to us locally type:

```bash
docker images
```

The output of that command should look something like this:

```irc
REPOSITORY            TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
idiservice            latest              cbe1ec579e9b        3 minutes ago       666.5 MB
quay.io/eris/erisdb   0.11.0              f771905fcd3b        2 days ago          995.2 MB
quay.io/eris/ipfs     latest              6e8658f9aa86        2 days ago          785.9 MB
quay.io/eris/data     latest              11a6ba126b53        2 days ago          726.9 MB
quay.io/eris/base     latest              53137e76ae59        2 days ago          726.9 MB
quay.io/eris/epm      0.11.0              d7ba8273bad3        4 days ago          739.4 MB
node                  4-onbuild           9e1063b1a9cd        11 days ago         642.6 MB
quay.io/eris/keys     latest              7db20d196c40        11 days ago         756.7 MB
```

Note in the above, the `REPOSITORY` field and the `TAG` field. When we build docker images, they will generally default to a `latest` in the tag field. This is what can be analogized to our "master" branch. Docker generally thinks more in terms of "channels" than in fixed versions for many of the images produced within the docker ecosystem. In other words, generally docker image maintainers treat their images like Chrome "channels" than like git "branches".

The ideas are similar.

The "name" we give an image when we build it generally looks like this `$DOCKER_HUB_ADDRESS/$ORG_NAME/$NAME:$TAG` for [more information about building docker images see here](https://docs.docker.com/engine/userguide/dockerimages/).

Don't worry too much about the `VIRTUAL SIZE` field. That is the size of only that image, but because docker images are layered they actually take up way less space on your hard drive. All the eris images are built off of `quay.io/eris/base` (they use that in their FROM line, instead of the `onbuild` we used above). That means that what is stored on the hard drive for any one image is the VIRTUAL SIZE display for it minus the VIRTUAL SIZE displayed for `quay.io/eris/base`.

The `onbuild` image, during the build process will copy in the directory in which it is (including all subdirectories), run `npm install` and then set its command as `npm start`. These `onbuild` images for node make it quick and easy to get services running, but for more stable products, Docker recommends that they not be used because the image will change based on which `onbuild` was `build`-ed.

If we had really wanted to, we could have performed the previous tutorial without having node installed natively via using these `onbuild` images, but we find that nuance is better left for a later stage (meaning, now).

# Build Idi's Service

Great. Now we are ready to build the [service definition file](/documentation/eris-cli/latest/services_specification/). A service definition file is the thing that tells `eris` how to "turn it on or off" where "it" is a docker image.

So let's start by adding a service!

```bash
eris services new idi idiservice
```

What is happening there with the `services new` command is that the first argument given to it (`idi`) is the name of the service and the second argument given is the docker image name (complete with tag if not `latest`; here we're going to use latest so we can skip it).

Now, let's run the service.

```bash
eris services start idi
```

That should return you to your command line with no output. This is by design. Let's check if the service is running.

```bash
eris services ls
```

Your service may or may not be running, depending on how fast you copy/paste. If the service is running and you wait a few seconds eventually it will stop running. As we know from our testing it will loop through the sequence and then exit.

But where did the output go? Because eris services are meant to get out of your way we keep the logs hidden from your view until you want to see what is happening. But now we do, so let's look through the logs:

```bash
eris services logs idi
```

The log should look like this:

```shell
&npm info it worked if it ends with ok
npm info using npm@2.15.1
pm info using node@v4.4.3
!npm info prestart idis_app@0.0.1
npm info start idis_app@0.0.1

$> idis_app@0.0.1 start /usr/src/app
> node app.js

/Listening for HTTP requests on port undefined.
```

## Add a Dependency to The Service Definition File

To edit a service definition file we can either open `~/.eris/services/idi.toml` in our favorit text editor, of if you have an EDITOR variable set in for your shell then just

```bash
eris services edit idi
```

Update the file to look like this:

```toml
# This is a TOML config file.
# For more information, see https://github.com/toml-lang/toml

name = "idi"

description = """
# idis service; cause i'm a learning marmot
"""

status = "alpha" # alpha, beta, ready

[service]
name = "idi"
image = "idiservice"
data_container = true

[dependencies]
chains = ["simplechain"]

[maintainer]
name = "Casey Kuhlman"
email = "casey@erisindustries.com"

[location]
dockerfile = ""
repository = ""
website = ""
```

What changed here? Well we added a `dependency` of the chain. And we used the eris name of the chain we've been working with. We could also have that link be:

```toml
chains = ["$chain"]
```

Which would tell eris to use the "current chain" that was given to the service by flags. But we don't need to worry about that just now. Let's "hard code" in the chain for now. So do not do the above for the purposes of this tutorial.

What are dependencies to eris. Well they tell eris under the hood to make sure that the dependent service (yes, services can depend on other services, see your mindy service with `eris services cat mindy` for a complex example) or chain is up and running before the "target" service or chain is started. Not only that but eris will make sure [there is a docker link](https://docs.docker.com/engine/userguide/networking/default_network/dockerlinks/) between the dependency and the target service. This is very helpful because we no longer need to worry about IP addresses, hurray!

## Updating our app.js for Dockerizing

Now we need to change one line of our app.js. The line where the `chainUrl` variable is set to read like this:

```javascript
chainUrl = "http://simplechain:1337/rpc"
```

Note that we use `simplechain` here which is what we want. When eris has a dependent chain it will mount it using the `simplechain` name. This means that anything running inside the service can ping the "attached" chain at `http://simplechain`. Note, if we had used the `$chain` variable then it would be mounted as `chain` instead of `simplechain`.

If the keys service had been added to the dependencies (although under a services field) then it would be available at `http://keys`. Pretty neat huh!?

OK. Now let's rebuild the docker image and restart the service:

```bash
docker build -t idiservice .
eris services rm --force idi # to remove the old service container
eris services start idi
eris services logs idi -f
```

That last command is similar to `tail -f` in that it will `follow` the logs until it exits or you press `contrl+c`. Wow. So that's pretty neat!

# Modify Our Service Definition File

Now that we've turned on idi a few times we'll be ready to change a few things.  We will have two levels of variables we need to pass into a "thing we turn on or off".  Generally we always put the things that won't change that much as environment variables in the services definition file, and for variables which change more frequently we add the default in the environment variables and then override it from the command line flags when necessary to.

So now lets add in the port to get rid of that ugly `undefined` in the logs. Edit your idi service definition file to look like this:

```toml
ports = [ "8080:8080" ]
environment = ["IDI_PORT=8080"]
```

Then rerun the "normal" service:

```bash
eris services rm --force idi
eris services start idi
eris services logs idi
```

Idi should have displayed the port.

# Test the Microservice

You can use `curl` to talk to the microservice's REST API.  First set the `host` variable based on which platform you're using:

Linux:

```shell
$ host=localhost
```

Mac OS/Windows:

```shell
$ host=$(docker-machine ip)
```

Now set Idi's number to 1234:

```shell
$ curl --request PUT --data 1234 $host:8080
```

And retrieve it:

```shell
$ curl $host:8080
1234
```

Let's check the log:

```shell
$ eris services logs idi
&npm info it worked if it ends with ok
npm info using npm@2.15.1
pm info using node@v4.4.3
!npm info prestart idis_app@0.0.1
npm info start idis_app@0.0.1

$> idis_app@0.0.1 start /usr/src/app
> node app.js

*Listening for HTTP requests on port 8080.
.Received request to set Idi's number to 1234.
&Received request to get Idi's number.
```

That's it! You've made a service! Now let's share it with our colleagues.

# Share Your Service

First things first, you'll need a Docker Hub to push to. So make sure you have a [Docker Hub](https://hub.docker.com/) account, [quay.io](quay.io) (which we use at eris and have been very satisfied with),or an account with a corporate Docker Registry.

We will assume for the purposes of this tutorial that `idi` was able to register the `idi` user name on Docker Hub. You should substitute `idi/` for your username (+ a `/` :-) ). Let's get that docker image ready to be published to the world and then lets publish it.

```bash
docker tag idiservice idi/idiservice
docker push idi/idiservice
```

OK. Now the docker image is available for the world to view it. Let's change the service definition one more time!

```toml
image = "idi/idiservice"
```

Remember to use your username, not idi's.

Now. Let's fire up IPFS because we will be using it to share our service definition file.

```bash
eris services start ipfs
```

Check that it is running. Then let's export our service to the world.

```bash
eris services export idi
```

In the output of the `export` command is a hash field. The whole output may look something like this:

```irc
POSTing file to IPFS. File =>   /home/coda/.eris/services/idi.toml
Uploading =>                    /home/coda/.eris/services/idi.toml:http://0.0.0.0:8080/ipfs/
                                         hash=QmUxawH7yTQxPh4HZLSC1FsWGYy3XhJaBrhshZd78HWgkX
```

If it did, then the IPFS hash of the service definition file is would be `QmUxawH7yTQxPh4HZLSC1FsWGYy3XhJaBrhshZd78HWgkX`. Post that on your slack with a handy note for your colleagues:

```irc
Hey, idi's service is ready for testing, please `eris services import idi QmUxawH7yTQxPh4HZLSC1FsWGYy3XhJaBrhshZd78HWgkX && eris services start idi` to get up to speed.
```

Obviously with your own language and your own hash.

# :tada:

Congratulations, you've just made your very own smart contract backed service running alongside and interacting with a permissioned blockchain! That is the end of our tutorial series for the first level of understanding of the eris platform. Please see some of our more advanced tutorials if you still are curious about the eris platform. But you should have all the base building blocks to building your own next-generation data and process management solutions!

# Where to next?

You may want to next [go deeper with some of our more advanced tutorials](/tutorials/advanced/)
