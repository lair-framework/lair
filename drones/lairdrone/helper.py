# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

import socket
import struct


def ip2long(ip):
    """Calculate the IP address as a long integer

    :param ip: IP address as a dotted-quad string
    :return: Long value of the IP address
    """
    return struct.unpack('!L', socket.inet_aton(ip))[0]


def long2ip(n):
    """Calculate the dotted-quad string representation of a long integer

    :param n: IP address as a long value
    :return: IP address as a dotted-quad string
    """
    return socket.inet_ntoa(struct.pack('!L', n))
