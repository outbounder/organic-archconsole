#!/bin/bash
. ~/.nvm/nvm.sh
nvm use v0.8.14
CDIR=`dirname $0`
cd $CDIR/../
angel Cell start archconsole.js