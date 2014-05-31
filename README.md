##Installation##

Precompiled application packages are available for Linux and OS X. Download one of the current application packages below:

[lair-v1.0.4-darwin-x64.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.4/lair-v1.0.4-darwin-x64.7z)

[lair-v1.0.4-linux-x64.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.4/lair-v1.0.4-linux-x64.7z)

[lair-v1.0.4-linux-x86.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.4/lair-v1.0.4-linux-x86.7z)

Next, download the latest drones python package [here](https://github.com/fishnetsecurity/Lair-Drones/releases/latest).

Running lair from the application package above is self-explanatory.
To start Lair and all the required services:


        ./start.sh <ip>

To stop Lair:


        ./stop.sh


##Drones##
Lair takes a different approach to uploading, parsing, and ingestion of automated tool output (xml). We push this work off onto client side scripts called drones. These drones connect directly to the database. To use them all you have to do is export an environment variable "MONGO_URL". This variable is probably going to be the same you used for installation


        export MONGO_URL='mongodb://username:password@ip:27017/lair?ssl=true'

With the environment variable set you will need a project id to import data. You can grab this from the upper right corner of the lair dashboard next to the project name. You can now run any drones.


        drone-nmap <pid> /path/to/nmap.xml

You can install the drones to PATH with pip


        pip install lairdrone-<version>.tar.gz

##Contributing##
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request 

##Setting up a development environment (OSX)##
1. Install mongodb 2.6.0 or later preferably with ssl support (`brew install mongodb --with-openssl`)
2. If using SSL then perform the following to setup certs:
  * `openssl req –new –x509 –days 365 –nodes –out mongodb-cert.crt –key out mongodb-cert.key`
  * `cat mongodb-cert.crt mongodb-cert.key > mongodb.pem`
  * Start Mongo with SSL support via mongod.conf or command line (`mongod —sslMode requireSSL —sslPEMKeyFile mongodb.pem`)
3. Add a Lair database user:
  * `mongo lair --ssl`
  * `db.createUser({user: "lair", "pwd": "yourpassword", roles:["readWrite"]});`
  * Confirm user authentication: `db.auth("lair", "yourpassword");`
4. Set the appropriate Lair environment variable...
  * With SSL:  `export MONGO_URL=mongodb://lair:yourpassword@localhost:27017/lair?ssl=true`
  * No SSL: `export MONGO_URL=mongodb://lair:password@localhost:27017/lair`
5. [Download](http://nodejs.org/download/) and install node.js
6. Install Meteor: `curl https://install.meteor.com | /bin/sh`
7. Install Meteorite package manager: `sudo npm install -g meteorite`
8. Fork the Lair project on GitHub and clone the repo locally
9. Install dependencies: `cd /path/to/lair/app && mrt` (you can kill the mrt process after dependencies are downloaded)
10. Start Lair:  `cd /path/to/lair/app && meteor`
11. Browse to http://localhost:3000
12. Code your changes and submit pull requests!

There are occasional issues and confilicts with Meteor and the Fibers module. If you run into a situation where you cannot start Meteor due to Fibers conflicts, refer to the following for potential fixes:
* [Error: Cannot find module 'fibers'](http://stackoverflow.com/questions/15851923/cant-install-update-or-run-meteor-after-0-6-release)
* [Error: fibers.node is missing](http://stackoverflow.com/questions/13327088/meteor-bundle-fails-because-fibers-node-is-missing)

##Contact##
If you need assistance with installation, usage, or are interested in contributing, please contact Dan Kottmann at any of the below.

Dan Kottmann
- [@djkottmann](https://twitter.com/djkottmann)
- djkottmann@gmail.com
