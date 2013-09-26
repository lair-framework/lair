##Installation##

Precompiled application packages are available for Linux and OS X. Download one of the current application packages below:

[lair-v1.0.1-darwin-x64.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.1/lair-v1.0.1-darwin-x64.7z)

[lair-v1.0.1-linux-x64.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.1/lair-v1.0.1-linux-x64.7z)

[lair-v1.0.1-linux-x86.7z](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.1/lair-v1.0.1-linux-x86.7z)

Next, download the drones python package: [lairdrone-0.1.5.tar.gz](https://github.com/fishnetsecurity/Lair/releases/download/v1.0.1/lairdrone-0.1.5.tar.gz)

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
        

##Contact##
If you need assistance with installation, usage, or are interested in contributing, please contact either Dan Kottmann or Tom Steele at any of the below. IRC is the best way to get a quick response.

Tom Steele
- tom@huptwo34.com
- [@_tomsteele](https://twitter.com/_tomsteele)
- freenode: hydrawat

Dan Kottmann
- [@djkottmann](https://twitter.com/djkottmann)
