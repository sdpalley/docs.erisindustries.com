#!/bin/sh

# Automated test of Tutorials | Making and Using eris-services
# https://docs.erisindustries.com/tutorials/services-making/

set -o errexit
set -o xtrace

cd ../contracts-interacting
npm test
cd ../services-making

cp -r ~/.eris/apps/idi ~/.eris/apps/idi-service # or whatever you would like to call it
cp * ~/.eris/apps/idi-service/
cd ~/.eris/apps/idi-service
docker build -t idiservice .
eris services new idi idiservice
cp idi.toml ~/.eris/services/
eris services start idi
