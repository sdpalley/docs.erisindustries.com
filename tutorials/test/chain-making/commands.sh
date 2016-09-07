#!/bin/sh

set -o errexit
set -o xtrace

chain_dir=$HOME/.eris/chains/simplechain
chain_dir_this=$chain_dir/simplechain_full_000
eris services start keys
eris chains make --account-types=Root:2,Full:1 simplechain
eris chains start simplechain --init-dir $chain_dir_this
eris chains ls | grep simplechain
