from distutils.core import setup

setup(
    name="lairdrone",
    version="0.1.4",
    author='Dan Kottmann, Tom Steele',
    author_email='dan.kottmann@fishnetsecurity.com, thomas.steele@fishnetsecurity.com',
    packages=['lairdrone'],
    scripts=['bin/drone-nmap', 'bin/drone-nessus', 'bin/drone-nexpose', 'bin/drone-burp', 'bin/drone-raw'],
    url='https://github.com/fishnetsecurity/lair',
    license='LICENSE.txt',
    description='Packages and scripts for use with Lair',
    install_requires=[
        "pymongo >= 2.5",
    ],

)
