#!/bin/bash
set -e

if [[ $DEPLOY_STAGE = "local" ]] ; then
  make start-dev APP=web
else
  for value in $ENVS_TO_REPLACE; do
    find ./apps/web/dist -type f \( -iname \*.js -o -iname \*.html -o -iname \*.js.map \) -exec sed -i.bak "s|REPLACE_$value|${!value}|g" {} \;
  done
  make serve APP=web
fi
