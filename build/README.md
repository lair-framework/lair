Lair is a reactive attack collaboration framework and web application built with meteor.


##Installation##

Precompiled packages are available for Linux and OS X. Download one of the application packages below:

[lair-v0.1.1-linux-x86.tar.gz](https://bitbucket.org/fnsseca/lair/downloads/lair-v0.1.1-linux-x86.tar.gz)

[lair-v0.1.1-linux-x64.tar.gz](https://bitbucket.org/fnsseca/lair/downloads/lair-v0.1.1-linux-x64.tar.gz)

[lair-v0.1.1-darwin-x64.tar.gz](https://bitbucket.org/fnsseca/lair/downloads/lair-v0.1.1-darwin-x64.tar.gz)

Next, download the drones python package:
[lairdrone-0.1.1.tar.gz](https://bitbucket.org/fnsseca/lair/downloads/lairdrone-0.1.1.tar.gz)

Running lair from the application pacakge above is self-explanatory.
To start Lair and all the required services:


        ./start.sh

To stop Lair:


        ./stop.sh


##Drones##
Lair takes a different approach to uploading, parsing, and ingestion of automated tool output (xml). We push this work off onto client side scripts called drones. These drones connect directly to the database. To use them all you have to do is export an environment variable "MONGO_URL". This variable is probably going to be the same you used for installation


        export MONGO_URL='mongodb://username:password@ip:27017/lair?ssl=true'

With the environment variable set you will need a project id to import data. You can grab this from the upper right corner of the lair dashboard next to the project name. You can now run any drones.


        drone-nmap <pid> /path/to/nmap.xml

You can install the drones to PATH with pip


        pip install lairdrone-<version>.tar.gz


## Running ##

Start
======
./start.sh


Stop
=====
./stop.sh


##Contributors##
* Tom Steele - Lead Developer
* Dan Kottmann - Lead Developer


##Browser Support##
Currently we are investigating some issues with Chrome where EpicEditor is causing issues with focus. FireFox, Opera, and Safari have all been tested and work well.

##Sefus##
Lair uses a "SEcret File Upload Server" called sefus. Sefus is a lot like dropbox or google drive. Except that every file is "hotlinkable" or "public" and each file is given a random 56 byte string name once uploaded. Additionally, files are deleted after 90 days by default. The security risk with this method is that an attacker could get your browser history, so use caution. Hopefully in later versions of Meteor there will be better support for file uploading and protection. More information is available at the project page https://www.github.com/tomsteele/sefus. Use of sefus is not required to run Lair.


##License##
MIT
