#!/bin/sh

echo "Deploying your Smart Contracts to a Chain - Eris v0.11"
echo "https://docs.erisindustries.com/tutorials/contracts-deploying/"
echo

set -o errexit
set -o xtrace

cd ../chain-making
./commands.sh
cd ../contracts-deploying

chain_dir=~/.eris/chains/simplechain
app_dir=~/.eris/apps/idi
rm -rf $app_dir
mkdir $app_dir
cp idi.sol epm.yaml $app_dir
cd $app_dir
addr=$(cat $chain_dir/addresses.csv | grep simplechain_full_000 | cut -d ',' -f 1)
eris pkgs do --chain simplechain --address $addr

if [ -e $app_dir/epm.json ]; then
  echo Chain deployed successfully.
else
  echo There was a problem deploying His Excellency, President for Life, Field \
    Marshal Al Hadji Doctor Idi Amin Dada, VC, DSO, MC, Lord of All the Beasts \
    of the Earth and Fishes of the Seas and Conqueror of the British Empire in \
    Africa in General and Uganda in Particular.
fi
