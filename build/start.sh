#!/bin/bash
./stop.sh &>/dev/null
UNAME=$(uname)

if [ "$UNAME" != "Linux" -a "$UNAME" != "Darwin" ]; then
  echo "Sorry, this os is not supported yet."
  exit 1
fi

if [ "$UNAME" = "Darwin" ]; then
  if [ "i386" != "$(uname -p)" -o "1" != "$(sysctl -n hw.cpu64bit_capable 2>/dev/null || echo 0)" ] ; then
    echo "Only 64-bit Intel processors are supported at this time."
    exit 1
  fi
elif [ "$UNAME" = "Linux" ]; then
  ARCH="$(uname -m)"
  if [ "$ARCH" != "i686" -a "$ARCH" != "x86_64" ]; then
    echo "Unsupported architecture: $ARCH"
    echo "Lair only supports i686 and x86_64 for now."
    exit 1
  fi
  
  if [ -e '/etc/debian_version' ]; then
    dpkg-query -W -f='${Status} ${Version}\n' libssl-dev &>/dev/null
    if [ "$?" != 0 ]; then
      echo "Lair requires libssl-dev."
      echo "Run 'sudo apt-get install libssl-dev'."
      exit 1
    fi
  elif [ -e '/etc/issue' ]; then
    yum list installed openssl-devel &>/dev/null
    if [ "$?" != 0 ]; then
      echo "Lair requires openssl-devel."
      echo "Run 'yum install openssl-devel'."
      exit 1
    fi
  else
    echo "This script is not supported on this distro."
    exit 1
  fi
fi

if [ ! -f deps/bin/stunnel ]; then
  echo "Stunnel not found. Going to compile and install to deps/bin/."
  cd deps/src/
  tar -zxf stunnel-4.56.tar.gz
  cd stunnel-4.56
  ./configure 1>/dev/null 2>../../../error.log
  if [ "$?" != 0 ]; then
    ./stop.sh &>/dev/null
    echo "Error compiling stunnel."
    echo "Please see error.log for more information."
    exit 1
  fi
  make 1>/dev/null 2>../../../error.log
  if [ "$?" != 0 ]; then
    ./stop.sh &>/dev/null
    echo "Error compiling stunnel."
    echo "Please see error.log for more information."
    exit 1
  fi
  cp src/stunnel ../../bin/
  cd ../
  rm -rf stunnel-4.56
  cd ../../
fi

if [ -z $1 ]; then
  echo "Missing required argument."
  echo "$0 <ip>"
  exit 1
fi

if [[ ! -a 'deps/etc/lair-key.pem' || ! -a 'deps/etc/lair.pem' ]]; then
  echo "No ssl cert found. Going to create one now."
  openssl req -new -x509 -days 3095 -nodes -out deps/etc/lair.pem -keyout deps/etc/lair-key.pem
  echo
fi

echo "Starting stunnel on $1:11014"
if [ ! -a 'deps/etc/stunnel.conf' ]; then
  echo "cert=deps/etc/lair.pem" > deps/etc/stunnel.conf
  echo "key=deps/etc/lair-key.pem" >> deps/etc/stunnel.conf
  echo "pid=/tmp/stunnel.pid" >> deps/etc/stunnel.conf
  deps/bin/stunnel -version 2>&1 | grep FIPS
  if [ "$?" == 0 ]; then
    echo "fips=no" >> deps/etc/stunnel.conf
  fi
  echo >> deps/etc/stunnel.conf
  echo "[lair]" >> deps/etc/stunnel.conf 
  echo "accept=$1:11014" >> deps/etc/stunnel.conf 
  echo "connect=127.0.0.1:11015" >> deps/etc/stunnel.conf 
fi
deps/bin/stunnel deps/etc/stunnel.conf 1>/dev/null 2>error.log
if [ "$?" != 0 ]; then
  echo "Error: stunnel failed with errors."
  echo "Please see error.log for details."
  exit 1;
fi

echo "Starting MongoDB on 127.0.0.1:11015"
if [ ! -d 'lair_db' ]; then
  mkdir lair_db
fi
./deps/mongodb/bin/mongod --port 11015 --auth --dbpath=lair_db --bind_ip 127.0.0.1 --nohttpinterface --fork --logpath=deps/var/log/mongodb.log 1>/dev/null 2>error.log
if [ "$?" != 0 ]; then
  echo "Error: mongodb failed with errors."
  echo "Please see error.log for details."
  ./stop.sh &>/dev/null
  exit 1;
fi

read -p "Have you previously added mongodb users? [y/n] "
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  read -p "Enter lair database username: " -e -r
  LAIRMONGOUSER=$REPLY
  read -p "Enter password: " -e -s -r
  LAIRMONGOPASS=$REPLY
  if [[ $LAIRMONGOPASS =~ ^.*[@:/?=].*$ ]]; then
    echo;
    echo "Error: Invalid character detected. Passwords cannot contain the following chars: @:/?=";
    echo "Run db.changeUserPassword command from the mongo shell to choose a new password";
    ./stop.sh &>/dev/null
    exit 1;
  fi
else
  read -p "Enter a new mongodb administrative user: " -e -r
  MONGOADMINUSER=$REPLY 
  read -p "Enter password for administrative user: " -s -e -r
  MONGOADMINPASS=$REPLY
  echo "db = db.getSiblingDB('admin')" > admin.js
  echo "db.addUser({user: \"$MONGOADMINUSER\", pwd: \"$MONGOADMINPASS\", roles: [\"userAdminAnyDatabase\"]})" >> admin.js
  ./deps/mongodb/bin/mongo --port 11015 admin admin.js 2>error.log
  rm admin.js
  if [ "$?" != 0 ]; then
    echo "Error: failed to create administrator."
    echo "Please see error.log for details."
    ./stop.sh &>/dev/null
    exit 1;
  fi
  read -p "Enter a new lair database username: " -e -r
  LAIRMONGOUSER=$REPLY
  read -p "Enter password: " -e -s -r
  LAIRMONGOPASS=$REPLY
  if [[ $LAIRMONGOPASS =~ ^.*[@:/?=].*$ ]]; then
    echo;
    echo "Error: Invalid character detected. Passwords cannot contain the following chars: @:/?=";
    ./stop.sh &>/dev/null
    exit 1;
  fi
  echo "db = db.getSiblingDB('lair')" > lair.js
  echo "db.addUser({ user: \"$LAIRMONGOUSER\", pwd: \"$LAIRMONGOPASS\", roles: [\"readWrite\", \"dbAdmin\"]})" >> lair.js
  ./deps/mongodb/bin/mongo --port 11015 admin -u $MONGOADMINUSER -p $MONGOADMINPASS lair.js 2>error.log
  rm lair.js
  if [ "$?" != 0 ]; then
    echo "Error: failed to create lair database user."
    echo "Please see error.log for details."
    ./stop.sh &>/dev/null
    exit 1;
  fi
fi

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

echo 'Starting Lair http server on 127.0.0.1:11016'
cd bundle
export MONGO_URL=mongodb://$LAIRMONGOUSER:$LAIRMONGOPASS@localhost:11015/lair
export ROOT_URL=http://localhost/
export PORT=11016
nohup ../deps/node/bin/node main.js 1>/dev/null 2>../error.log &
if [ "$?" != 0 ]; then
  echo "Error: failed to start lair http server."
  echo "Please see error.log for details."
  cd ..
  ./stop.sh &>/dev/null
  exit 1;
fi
cd ..

echo "Starting Lair https to http proxy on $1:11013"
cd deps/node-simple-proxy
export KEY=../etc/lair-key.pem
export CERT=../etc/lair.pem
export PROXY_TO_HOST=127.0.0.1
export PROXY_TO_PORT=11016
export PROXY_PORT=11013
export PROXY_HOST=$1
nohup ../node/bin/node proxy.js 1>/dev/null 2>error.log &
if [ "$?" != 0 ]; then
  echo "Error: failed to start https proxy ."
  echo "Please see error.log for details."
  cd ../../
  ./stop.sh &>/dev/null
  exit 1;
fi
cd ../../
echo
echo
echo "Access Lair at https://$1:11013/"
echo "Drones can access the mongodb instance at mongodb://$LAIRMONGOUSER:$LAIRMONGOPASS@$1:11014/lair?ssl=true"
