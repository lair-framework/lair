#!/bin/bash

read -p 'Enter administrator username: ' -e -r
MONGOADMINUSER=$REPLY 
read -p 'Enter password: ' -e -s -r
MONGOADMINPASS=$REPLY 
echo
read -p 'Enter username to be deleted: ' -e -r
USER=$REPLY
echo "db = db.getSiblingDB('lair')" > tmp.js
echo "db.removeUser(\"$USER\")" >> tmp.js
./deps/mongodb/bin/mongo --port 11015 admin -u $MONGOADMINUSER -p $MONGOADMINPASS tmp.js 1>/dev/null 2>error.log
rm tmp.js
if [ "$?" != 0 ]; then
  echo "Error: unable to delete user."
  echo "See error.log for details."
  exit 1;
fi
echo "User deleted"
