#!/bin/bash

UNAME=$(uname)
echo 'Shutting down lair services'
./deps/mongodb/bin/mongod --shutdown --dbpath=lair_db &> /dev/null
if [ "$UNAME" = "Darwin" ]; then
  STAT=$(lsof -n 2> /dev/null | grep LISTEN | awk '/TCP/ {if ($9 ~ /.*:1101[0-9]/) {print $2}}' | wc -l)
  if [ "$STAT" -ne "0" ]; then
    lsof -n 2> /dev/null | grep LISTEN | awk '/TCP/ {if ($9 ~ /.*:1101[0-9]/) {print $2}}' | xargs kill
    STAT=$(lsof -n 2> /dev/null | grep LISTEN | awk '/TCP/ {if ($9 ~ /.*:1101[0-9]/) {print $2}}' | wc -l)
    if [ "$STAT" -ne "0" ]; then
      echo '[!] Possibly stale processes'
      awk '/^tcp/ {if ($4 ~ /.*:1101[0-9]/) {split($7, pids, "/"); print pids[1];}}'
    fi
  fi
elif [ "$UNAME" = "Linux" ]; then
  STAT=$(netstat -plnt 2> /dev/null | awk '/^tcp/ {if ($4 ~ /.*:1101[0-9]/) {split($7,pids,"/"); print pids[1];}}' | wc -l)
  if [ "$STAT" -ne "0" ]; then
    netstat -plnt 2> /dev/null | awk '/^tcp/ {if ($4 ~ /.*:1101[0-9]/) {split($7,pids,"/"); print pids[1];}}' | xargs kill
    STAT=$(netstat -plnt 2> /dev/null | awk '/^tcp/ {if ($4 ~ /.*:1101[0-9]/) {split($7,pids,"/"); print ports[1];}}' | wc -l)
    if [ "$STAT" -ne "0" ]; then
      echo '[!] Possibly stale processes'
      awk '/^tcp/ {if ($4 ~ /.*:1101[0-9]/) {split($7, pids, "/"); print pids[1];}}'
    fi
  fi
fi
