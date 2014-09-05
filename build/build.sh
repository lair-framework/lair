#!/bin/bash
if [ ! $1 ]; then
  echo 'Version needed'
  exit
fi

LINUX32=lair-v$1-linux-x86
LINUX64=lair-v$1-linux-x64
OSX=lair-v$1-darwin-x64

mkdir $LINUX32
mkdir $LINUX64
mkdir $OSX

mkdir $LINUX32/deps
mkdir $LINUX32/deps/var
mkdir $LINUX32/deps/var/log
mkdir $LINUX32/deps/var/run
mkdir $LINUX32/deps/sbin
mkdir $LINUX32/deps/lib
mkdir $LINUX32/deps/bin
mkdir $LINUX32/deps/etc
mkdir $LINUX32/deps/src

mkdir $LINUX64/deps
mkdir $LINUX64/deps/var
mkdir $LINUX64/deps/var/log
mkdir $LINUX64/deps/var/run
mkdir $LINUX64/deps/sbin
mkdir $LINUX64/deps/lib
mkdir $LINUX64/deps/bin
mkdir $LINUX64/deps/etc
mkdir $LINUX64/deps/src

mkdir $OSX/deps
mkdir $OSX/deps/var
mkdir $OSX/deps/var/log
mkdir $OSX/deps/var/run
mkdir $OSX/deps/sbin
mkdir $OSX/deps/lib
mkdir $OSX/deps/bin
mkdir $OSX/deps/etc
mkdir $OSX/deps/src

cp license.txt $LINUX32/
cp license.txt $LINUX64/
cp license.txt $OSX/

cp README.md $LINUX32/
cp README.md $LINUX64/
cp README.md $OSX/

tar -xzf bundle.tar.gz
rm -rf bundle/programs/server/npm/npm-bcrypt
cp -R bundle $LINUX32
cp -R bundle $LINUX64
cp -R bundle $OSX
rm -rf bundle

cp src/stunnel-5.03.tar.gz $OSX/deps/src/
cp src/stunnel-5.03.tar.gz $LINUX32/deps/src/
cp src/stunnel-5.03.tar.gz $LINUX64/deps/src/
cp src/bcrypt-v0.8.0.tar.gz $OSX/deps/src/
cp src/bcrypt-v0.8.0.tar.gz $LINUX32/deps/src/
cp src/bcrypt-v0.8.0.tar.gz $LINUX64/deps/src/
cp src/fibers-v1.0.1.tar.gz $OSX/deps/src/
cp src/fibers-v1.0.1.tar.gz $LINUX32/deps/src/
cp src/fibers-v1.0.1.tar.gz $LINUX64/deps/src/
cp src/semver-v2.2.1.tar.gz $OSX/deps/src/
cp src/semver-v2.2.1.tar.gz $LINUX32/deps/src/
cp src/semver-v2.2.1.tar.gz $LINUX64/deps/src/
cp src/source-map-support-v0.2.4.tar.gz $OSX/deps/src/
cp src/source-map-support-v0.2.4.tar.gz $LINUX32/deps/src/
cp src/source-map-support-v0.2.4.tar.gz $LINUX64/deps/src/
cp src/underscore-v1.5.2.tar.gz $OSX/deps/src/
cp src/underscore-v1.5.2.tar.gz $LINUX32/deps/src/
cp src/underscore-v1.5.2.tar.gz $LINUX64/deps/src/

tar -xzf linux32/mongodb-*gz
mv mongodb-* $LINUX32/deps/mongodb
tar -xzf linux32/node-*gz
mv node-* $LINUX32/deps/node

tar -xzf linux64/mongodb-*gz
mv mongodb-* $LINUX64/deps/mongodb
tar -xzf linux64/node-*gz
mv node-* $LINUX64/deps/node

tar -xzf osx/mongodb-*gz
mv mongodb-* $OSX/deps/mongodb
tar -xzf osx/node-*gz
mv node-* $OSX/deps/node

git clone https://github.com/tomsteele/node-simple-proxy.git
cd node-simple-proxy
npm install
cd ../

cp -R node-simple-proxy $LINUX32/deps
cp -R node-simple-proxy $LINUX64/deps
cp -R node-simple-proxy $OSX/deps

rm -rf node-simple-proxy

cp linux32/stunnel.conf $LINUX32/deps/etc/
cp linux64/stunnel.conf $LINUX64/deps/etc/
cp osx/stunnel.conf $OSX/deps/etc/

cp lair-scripts/start.sh $LINUX32/
cp lair-scripts/start.sh $LINUX64/
cp lair-scripts/start.sh $OSX/
cp lair-scripts/stop.sh $LINUX32/
cp lair-scripts/stop.sh $LINUX64/
cp lair-scripts/stop.sh $OSX/
cp lair-scripts/reset.sh $LINUX32/
cp lair-scripts/reset.sh $LINUX64/
cp lair-scripts/reset.sh $OSX/
cp lair-scripts/adduser.sh $LINUX32/
cp lair-scripts/adduser.sh $LINUX64/
cp lair-scripts/adduser.sh $OSX/
cp lair-scripts/deluser.sh $LINUX32/
cp lair-scripts/deluser.sh $LINUX64/
cp lair-scripts/deluser.sh $OSX/

7z a $LINUX32.7z $LINUX32
7z a $LINUX64.7z $LINUX64
7z a $OSX.7z $OSX
rm -rf $LINUX32
rm -rf $LINUX64
rm -rf $OSX
