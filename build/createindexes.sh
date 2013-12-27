#!/bin/bash

read -p 'Enter lair username: ' -e -r
LAIRMONGOUSER=$REPLY
read -p 'Enter password: ' -e -s -r
LAIRMONGOPASS=$REPLY
echo
echo "Building database indexes"
echo "db = db.getSiblingDB('lair')" > indexes.js
echo "db.hosts.ensureIndex({'project_id': 1, 'string_addr': 1})" >> indexes.js
echo "db.ports.ensureIndex({'project_id': 1, 'host_id': 1, 'port': 1, 'protocol': 1})" >> indexes.js
echo "db.vulnerabilities.ensureIndex({'project_id': 1, 'plugin_ids': 1})" >> indexes.js
./deps/mongodb/bin/mongo --port 11015 lair -u $LAIRMONGOUSER -p $LAIRMONGOPASS indexes.js 2>error.log
rm indexes.js
if [ "$?" != 0 ]; then
  echo "Error: failed to create lair indexes."
  echo "Please see error.log for details."
  ./stop.sh &>/dev/null
  exit 1;
fi
