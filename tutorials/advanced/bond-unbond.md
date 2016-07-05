---

layout: docs
title: "Tutorials | Bonding & Unbonding Validators on your Chain"

---

The concept of bonding/unbonding validators here refers to validators which are voluntarily adding (bonding) or removing (unbonding) themselves. New validators (not included in the genesis file) first require tokens on the chain to post a bond with. Future tutorials will cover slashing/removing unwelcome/byzantine validators.

For this example, we'll be using a [simplechain](/tutorials/chain-making), which has a single Full Account (see: `cat ~/.eris/chains/account-types/full.toml` for more information). One another host, a new account will be created and connect to the running chain. Once our Full Account sends this new account some tokens, the new account will be in a position to post a bond and begin validating. Eventually, this validator can unbond if they so choose. 

Let's get started!

# Get the chain sorted
We'll do this part [using docker-machine](/tutorials/tool-specific/docker_machine) to simulate another host that starts the chain as a single validator.

### Create a docker machine and initialize eris
```bash
docker-machine create --driver digitalocean bonding
eris init --yes --machine bonding
```

### Make the chain and new it
The chain is made locally but `new`d (started) on the recently created `docker-machine`.
```bash
eris chains make --chain-type=simplechain bonding
eris chains new bonding --dir ~/.eris/chain/bonding --machine bonding
```

Now grab the `docker-machine ip bonding` and go to `ip:46657` in your browser. You should see the exposed endpoints. Try also `eris chains ls --machine bonding`.

### Generate a new key locally
```bash
$addr=$(eris keys gen)
rm ~/.eris/chains/bonding/priv_validator.json
eris keys convert $addr > ~/.eris/chains/bonding/priv_validator.json
cp ~/.eris/chains/default/config.toml ~/.eris/chains/bonding
```
First we updated the `priv_validator.json` with the new address then we dropped in the `config.toml`. Open the latter and edit the line `seeds = ip:46656` where `ip` is the output of `docker-machine ip bonding`. Your local node needs to know this for the peers to connect. 

### Connect the new peer node
```bash
eris chains new bonding --dir ~/.eris/chains/bonding
```
The new peer will dial the seed and connect to it. Go back to the browser and see the `/net_info` endpoint; the new peer should be there. Note: it will take this peer some time to catchup on blocks. There should still only be one account at `/list_accounts` currently. 

With the chain setup, you have two options: 'exec' and 'mintx' or 'epm'

# Using 'exec' and 'mintx'

For the next step, we need another ip: `eris chains inspect bonding NetworkSettings.IPAddress --machine bonding`. Below, replace `ip` with the output of the `inspect` command.

### Send tokens from validator to new account
```bash
eris chains exec bonding "mintx send --amt 200000 --to $addr_new --addr $addr_machine --chainID bonding --node-addr=ip:46657 --sign-addr=keys:4767 --sign --broadcast" --machine bonding
```
where `--amt` is the amount to be sent from the validator (`--addr $addr_machine`) to the new account (`--to $addr_new`). Remember that `$addr_new` was created from `eris keys gen` above and `$addr_machine` can be seen with `eris keys ls --container --machine bonding` and is the address of the validator. We also specify the chain name (`--chainID bonding`) which must match the chain name used in `eris chains make/new`. Finally, `--node-addr` requires the `ip` gotten from the `eris chains inspect` command above and `--sign-addr` specifies the running keys container to sign from. `--sign` and `--broadcast` are bools that should be self-explanatory. Note again the `--machine bonding` flag outside of the `exec "..."`, which is is required because we are sending _from_ that node. You could of course ssh in, install eris, and run the command instead...but that's a lot more typing! 

### Send a bond tx from new account
We'll need the pubkey: `$pub_new=$(eris keys pub $addr_new)`
```bash
eris chains exec bonding "mintx bond --amt 150000 --pubkey $pub_new --to $addr_new --chainID bonding --node-addr=ip:46657 --sign-addr=keys:4767 --sign --broadcast"
```
note a few things here: the `--machine bonding` flag has been omitted since we are now on a "new" host and would like to bond this new account. With `mintx unbond` the `--to` flag specifies the address to unbond to (see unbonding, below). As well, the `ip` in `--node-addr=ip:46657` could be different so make sure to first run `eris chains inspect bonding NetworkSettings.IPAddress` as above (but without the `--machine` flag. 

That's it! Create a new account, join the chain, send some tokens, post a bond. Marmots like bonds. 

# Using 'epm'

# Unbonding

# Where to next?

The burrow.
