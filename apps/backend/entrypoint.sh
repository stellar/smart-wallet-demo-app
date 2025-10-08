#!/bin/bash
set -e

if [[ $DEPLOY_STAGE = "local" ]] ; then
  make setup-dev APP=backend
  make seed-xlm-dev
  make start-dev APP=backend
else
  make seed-xlm
  make start APP=backend
fi
