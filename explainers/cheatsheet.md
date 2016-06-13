---

layout: wide
title: "eris cheatsheet"

---

# simplechain

| Command							| Notes					     		   |
| ------------------------------------------------------------- | -------------------------------------------------------- |
| `eris chains make --chain-type=simplechain marmot`		| Makes a single full account. Starts keys if not running. |
| `eris chains new marmot --dir ~/.eris/chains/marmot`		| Does not need to specify sub-directory.    		   |
| `eris chains ls --known`					| Chains made (`make`) incl. running chains. 		   |
| `eris chains ls --running`					| Running chains.			     		   |
| `eris keys ls`						| List keys on host and in container.			   |
| `eris chains rm marmot --force --file --data --dir		| Completely remove all trace of the chain.		   |

# complexchain


