---

layout: docs
title: "Tutorials | Bonding & Unbonding Validators on your Chain"

---

The concept of bonding/unbonding validators here refers to validators which are voluntarily adding (bond) or removing (unbond) themselves. New validators (not included in the genesis file) first require tokens on the chain to post a bond with. Future tutorials will cover slashing/removing unwelcome/byzantine validators.

For this example, we'll need a [simplechain](/tutorials/chain-making) running, which has a single Full Account (try: `cat ~/.eris/chains/account-types/full.toml` for more information). One another host, a new account will be created and connect to the running chain. Once our Full Account sends this new account some tokens, the new account willbe in a position to post a bond and begin validating. 


# Where to next?

**Let us [learn how to do some maintenance on these chains](/tutorials/advanced/chain-maintaining).**
