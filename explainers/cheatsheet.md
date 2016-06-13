---

layout: wide
title: "eris cheatsheet"

---

# simplechain

| Command							| Notes					     		     |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `eris chains make --chain-type=simplechain marmot`		| Makes a single full account. Starts keys if not running.   |
| `eris chains new marmot --dir ~/.eris/chains/marmot`		| Does not need to specify chain sub-directory. Ready to deploy. |
| `eris chains ls --known`					| All chains made (`make`) incl. running chains. 	     |
| `eris chains ls --running`					| Running chains.			     		     |
| `eris keys ls`						| List keys on host and in container.			     |
| `eris chains rm marmot --force --file --data --dir`		| Completely remove all trace of the chain.		     |
| `eris clean`							| Remove all containers (keys) and not any chain dirs (yet). |

# complexchain

| Command							| Notes					     		     |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| `docker-machine create --driver virtualbox eris`		| Create local docker machine for root account.		     |
| `eval $(docker-machine env eris)`				| **Use first two commands** only if on !linux or !DockerBeta. |
| `docker-machine create --driver digitalocean eris-val-0`	| Create cloud docker machine for first validator.	     |
| `docker-machine create --driver digitalocean eris-val-1`	| Create cloud docker machine for second validator.	     |
| `eris init -y --machine eris/eris-val-0/eris-val-1`		| Run `eris init` for each machine (two/three times).	     |
| `eris chains make --account-types=Root:1,Validator:2 marmot`  | Make the chain on your local machine/docker-machine.       |
| `cd ~/.eris/chains`						| Makes the next few commands simpler.			     |
| `cp default/config.toml marmot/marmot_root_000/`		| Move the config.toml into each of the account directories. |
| `cp default/config.toml marmot/marmot_validator_000/`		| This process will soon be simplified. 		     |
| `cp default/config.toml marmot/marmot_validator_001/`		| Optionally name each node with a moniker.		     |
| `eris chains new marmot --dir marmot/marmot_validator_000 --machine eris-val-0` | New the first validator on the first machine. |
| `eris chains ls -a --machine eris-val-0`			| See the chain running with extra info.		     |
| `eris chains logs marmot --machine eris-val-0`		| See the chain logs. Blockheight *should not* be increasing. |
| `docker-machine ip eris-val-0`				| Get the IP of the first machine. See HTTP endpoints in browser at <IP:46657>. |
| `open marmot/marmot_validator_001/config.toml`		| Edit `seeds = "IP:46656"`; this port is the p2p port. |
| `open marmot/marmot_root_000/config.toml`			| Used shortly. IP can also be `docker-machine ip eris-val-1`. |
| `eris chains new marmot --dir marmot/marmot_validator_001 --machine eris-val-1` | New the second validator on the second machine. |
| `eris chains logs marmot --machine eris-val-1`		| See the chain logs. Blockheight *should* be increasing. |
| `eris chains new marmot --dir marmot/marmot_root_000`		| Connect the root node (will not validate). Ready to deploy. |
| `docker-machine rm eris-val-0 eris-val-1`			| Destroy the cloud boxes.					|
| `eris chains rm marmot --force --file --data --dir`		| Remove all trace of the chain.			     |


# deploy
