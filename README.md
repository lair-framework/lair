##Installation##

Precompiled packages are available for Linux and OS X. Previus and current releases are available [here](https://www.github.com/fishnetsecurity/Lair/releases). Download one of the current application packages below:


Next, download the drones python package:

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