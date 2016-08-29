---

layout: docs
title: "Tutorials | Eris Quickstart Guide - v0.12.0"

---

The v0.12.0 series involved significant changes to the overall stack, including a simplified command sequence. This tutorial is intended to get you interacting with your own smart-contract application as quickly as possible. Let's go!


# Make and Start a Chain

```bash
eris chains make eggChain
```
This command will create a handful of files in `~/.eris/chains/eggChain`. We can take a look at them later. Next, run

```bash
eris chains start eggChain --init-dir eggChain
```

Your eggChain should be running now. Check with

```bash
eris chains ls
```
Notice the keys service is also running. It was started automatically by `eris chains make`. See the logs of your chain with

```bash
eris chains logs eggChain
```
At this time, you should have only one key in the keys container. See it with:

```bash
eris keys ls
```
This is the address for your key that was generated during the `eris chains make` command. 


# Deploy a contract

This is usually done from the `apps` directory. We curl a couple files that we'll need as well.

```bash
cd ~/.eris/apps
mkdir idi && cd idi
curl idi.sol
curl epm.yaml
```

Next, run
```bash
eris pkgs do --chain eggChain --address ADDR
```
where `ADDR` is the address listed from `eris keys ls`. At this point, the `idi.sol` contract should be deployed to the chain. Let's assume it is (see below for ways to check), then

```bash
curl package.json
curl app.js
cp ~/.eris/chains/eggChain/accounts.json .
```
This gets the nodejs app we'll need to run and copies the `accounts.json`, required by the app. Finally,

```bash
npm install
node app.js
```

## What happened? / Extra info
//TODO

Let's take a look at the files in your chains main directory

```bash
ls ~/.eris/chains/eggChain
```
It's a good idea to get to know those files. You'll notice that several of them contain an the same address from the `eris keys ls` command.
