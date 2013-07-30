#!/bin/bash
echo 'Deleting all lair data'
read -p "Are you sure you want to do this? [y/n] " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf lair_db
fi
echo
