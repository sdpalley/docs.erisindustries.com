---

layout: docs
title: "Tutorials | Bonding & Unbonding Validators on your Chain"

---

The concept of bonding/unbonding validators here refers to validators which are voluntarily adding (bonding) or removing (unbonding) themselves. New validators (not included in the genesis file) first require tokens on the chain to post a bond with. Future tutorials will cover slashing/removing unwelcome/byzantine validators.

For this example, we'll be using a [simplechain](/tutorials/chain-making), which has a single Full Account (see: `cat ~/.eris/chains/account-types/full.toml` for more information). One another host, a new account will be created and connect to the running chain. Once our Full Account sends this new account some tokens, the new account will be in a position to post a bond and begin validating. Eventually, this validator can unbond if they so choose. 

Let's get started

# Using 'exec' and 'mint-client'

## Get the chain sorted
We'll do this first part [using docker-machine](/tutorials/tool-specific/docker_machine) to simulate another host that is running the chain with a single validator.

1. Create a machine and init eris on it.
```bash
docker-machine create --driver digitalocean bonding
eris init --yes --machine bonding
```

2. Next we'll make the chain *locally* but `new` it on the recently created `docker-machine`.
```bash
eris chains make --chain-type=simplechain bonding
eris chains new bonding --dir ~/.eris/chain/bonding --machine bonding
```

Now grab the `docker-machine ip bonding` and go to `ip:46657` in your browser. You should see the exposed endpoints. Try also `eris chains ls --machine bonding`.

3. Time to gen a new key (account) *locally* and make some modifications to the chain directory.
```bash
$addr=$(eris keys gen)
rm ~/.eris/chains/bonding/priv_validator.json
eris keys convert $addr > ~/.eris/chains/bonding/priv_validator.json
cp ~/.eris/chains/default/config.toml ~/.eris/chains/bonding
```
First we updated the `priv_validator.json` with the new address then we dropped in the `config.toml`. Open the latter and edit the line `seeds = ip:46656` where `ip` is the output of `docker-machine ip bonding`. Your local node needs to know this for the peers to connect. 

4. Start up the new node (but not yet validator).
```bash
eris chains new bonding --dir ~/.eris/chains/bonding
```
The new peer will dial the seed and connect to it. Go back to the browser and see the `/net_info` endpoint; the new peer should be there. Note: it will take this peer some time to catchup. There should still only be one account at `/list_accounts` currently. 

For the next step, we need another ip: `eris chains inspect bonding NetworkSettings.IPAddress`. Below, replace `ip` with the output of the `inspect` command.

5. Send some tokens from the full account to the new peer.
```bash
eris chains exec bonding "mintx send --amt 200000 --to $addr_new --addr $addr_machine --chainID bonding --node-addr=ip:46657 --sign-addr=keys:4767 --sign --broadcast" --machine bonding
```

# Using 'epm'

# Where to next?

**Let us [learn how to do some maintenance on these chains](/tutorials/advanced/chain-maintaining).**
