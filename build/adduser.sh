#!/bin/bash

read -p 'Enter administrator username: ' -e -r
MONGOADMINUSER=$REPLY 
read -p 'Enter password: ' -e -s -r
MONGOADMINPASS=$REPLY 
echo
read -p 'Enter new username: ' -e -r
NEWUSER=$REPLY
read -p 'Enter password: ' -e -s -r
NEWPASS=$REPLY 
echo "db = db.getSiblingDB('lair')" > tmp.js
echo "db.addUser({ user: \"$NEWUSER\", pwd: \"$NEWPASS\", roles: [\"readWrite\"]})" >> tmp.js
./deps/mongodb/bin/mongo --port 11015 admin -u $MONGOADMINUSER -p $MONGOADMINPASS tmp.js 1>/dev/null 2>error.log
rm tmp.js
if [ "$?" != 0 ]; then
  echo "Error: unable to create new user."
  echo "See error.log for details."
  exit 1;
fi
echo "New user created"
echo "Drones can access the mongodb instance on mongodb://$NEWUSER:$NEWPASS@<host>:11014/lair?ssl=true"
