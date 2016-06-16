#!/bin/sh

echo "Making a Permissioned Chain (Simple) - Eris v0.11"
echo "https://docs.erisindustries.com/tutorials/chain-making/"
echo

set -o errexit
set -o xtrace

chain_dir=$HOME/.eris/chains/simplechain

# Clean up any previous test artifacts first.
eris chains rm --force simplechain
rm -rf $chain_dir

chain_dir_this=$chain_dir/simplechain_full_000
eris services start keys
eris chains make --account-types=Root:2,Full:1 simplechain
eris chains new simplechain --dir $chain_dir_this
eris chains ls | grep simplechain
