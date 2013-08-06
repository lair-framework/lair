# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

__author__ = 'Dan Kottmann <djkottmann@gmail.com>'

import os
import copy
import hashlib
from pymongo import ASCENDING, DESCENDING
from datetime import datetime
from bson.objectid import ObjectId
from exceptions import MissingRequiredSchemaField, ProjectDoesNotExistError, \
    IncompatibleVersionError
import lair_models

DRONE_LOG_HISTORY = 500

# this is the document version
# only serious changes to the lair api will update this
VERSION = '0.1.0'


def db_connect():
    """
    connect to the database

    :return:database connection object
    """
    from pymongo import Connection, uri_parser

    # Connect to the database
    if 'MONGO_URL' not in os.environ:
        print "[***] Missing 'MONGO_URL' Environment Variable [***]"
        raise EnvironmentError

    mongo_options = uri_parser.parse_uri(os.environ['MONGO_URL'])
    (host, port) = mongo_options['nodelist'][0]

    ssl = mongo_options['options'].get('ssl', False)

    print "[+] Attempting connection to database '{0}:{1}/{2}'".format(
        host, str(port), mongo_options['database']
    )
    conn = Connection(host, port, ssl=ssl)
    db = conn[mongo_options['database']]

    if mongo_options['username'] or mongo_options['password']:
        db.authenticate(mongo_options['username'], mongo_options['password'])

    print "[+] Connection successful."

    return db


def validate(document):

    """Check that the document schema is valid

    :param document: dictionary to validate
    """

    # Validate project_id
    if 'project_id' not in document or not document['project_id']:
        raise MissingRequiredSchemaField('project_id')

    # Validate command
    if 'commands' not in document or not document['commands']:
        raise MissingRequiredSchemaField('commands')

    return True


def save(document, db, tool):
    """Save the project details in the Lair database.

    :param document: A complete representation of the project model
    :param db: A connection to the target Lair database
    :raise: MissingRequiredSchemaField, ProjectDoesNotExistError
    """

    # Validate compatible versions
    version = db.versions.find_one()
    if version['version'] != VERSION:
        raise IncompatibleVersionError(VERSION, version['version'])

    # Validate the schema - will raise an error if invalid
    validate(document)

    print "[+] Processing project {0}".format(document['project_id'])

    temp_drone_log = list()

    q = {'_id': document['project_id']}

    # Ensure the project exists in the database
    if db.projects.find(q).count() != 1:
        raise ProjectDoesNotExistError(document['project_id'])

    project = db.projects.find_one(q)

    # Add the command
    project['commands'].extend(document['commands'])

    # Add project notes
    project['notes'].extend(document['notes'])

    # Add the owner if it isn't already set
    if 'owner' not in project or not project['owner']:
        project['owner'] = document['owner']

    # Add the industry if not already set
    if 'industry' not in project or not project['industry']:
        project['industry'] = document.get('industry', 'N/A')

    # Add the creation date if not already set
    if 'creation_date' not in project or not project['creation_date']:
        project['creation_date'] = document['creation_date']

    # Add the description if not already set
    if 'description' not in project or not project['description']:
        project['description'] = document.get('description', '')

    if 'hosts' not in project:
        project['hosts'] = list()

    if 'vulnerabilities' not in project:
        project['vulnerabilities'] = list()

    if len(project['vulnerabilities']) == 0 and len(project['hosts']) == 0:
        now = datetime.utcnow().isoformat()
        temp_drone_log.append("{0} - Initial project load".format(now))

    # Create indexes
    db.hosts.ensure_index([
        ('project_id', ASCENDING),
        ('string_addr', ASCENDING)
    ])
    db.ports.ensure_index([
        ('project_id', ASCENDING),
        ('host_id', ASCENDING),
        ('port', ASCENDING),
        ('protocol', ASCENDING)
    ])
    db.vulnerabilities.ensure_index([
        ('project_id', ASCENDING),
        ('plugin_ids', ASCENDING)
    ])

    # For each host in the parsed scan, check to see if it already
    # exists in the database.
    for file_host in document['hosts']:

        is_known_host = True
        host = db.hosts.find_one({'project_id': project['_id'], 'string_addr': file_host['string_addr']})
        if not host:
            is_known_host = False
            host = copy.deepcopy(lair_models.host_model)

        pre_md5 = hashlib.md5()
        pre_md5.update(str(host))

        host['project_id'] = project['_id']
        host['alive'] = file_host['alive']
        host['string_addr' ] = file_host['string_addr']
        host['long_addr'] = file_host['long_addr']
        host['is_profiled'] = file_host.get('is_profiled', False)
        host['is_enumerated'] = file_host.get('is_enumerated', False)

        # Add hostnames
        if len(file_host['hostnames']) > 0:
            # Only update if new host names were identified
            if not set(file_host['hostnames']).issubset(host['hostnames']):
                host['hostnames'].extend(file_host['hostnames'])
                host['hostnames'] = list(set(host['hostnames']))
                host['last_modified_by'] = tool

        # Update MAC address if it's not set already
        if not host['mac_addr']:
            host['mac_addr'] = file_host['mac_addr']

        # Add the operating system
        if file_host['os']:
            os_list = []
            # The following ensures that no duplicate entries are
            # added to the database.
            for file_os in file_host['os']:
                dupe_found = False
                for db_os in host['os']:
                    if db_os['tool'] == file_os['tool'] and \
                       db_os['fingerprint'] == \
                       file_os['fingerprint']:
                        dupe_found = True

                if not dupe_found:
                    os_list.append(file_os)
                    host['last_modified_by'] = tool

            host['os'].extend(os_list)

        post_md5 = hashlib.md5()
        post_md5.update(str(host))

        # Only save if changes were detected
        if pre_md5 != post_md5:
            host['last_modified_by'] = tool
            if not is_known_host:
                id = str(ObjectId())
                host['_id'] = id
                host['status'] = lair_models.STATUS_GREY

            db.hosts.save(host)

        if not is_known_host:
            now = datetime.utcnow().isoformat()
            temp_drone_log.append("{0} - New host found: {1}".format(
                now,
                file_host['string_addr'])
            )

        # Process each port for the host, checking against known ports
        for file_port in file_host['ports']:

            q = {
                'project_id': project['_id'],
                'host_id': host['_id'],
                'port': file_port['port'],
                'protocol': file_port['protocol']
            }
            port = db.ports.find_one(q)

            is_known_port = False
            if port:
                is_known_port = True
            else:
                port = copy.deepcopy(lair_models.port_model)

            pre_md5 = hashlib.md5()
            pre_md5.update(str(port))

            port['host_id'] = host['_id']
            port['project_id'] = project['_id']
            port['protocol'] = file_port['protocol']
            port['port'] = file_port['port']

            # TODO: Determine how to handle a closed port
            port['alive'] = file_port['alive']

            # Update product if it is unknown
            if port['product'] == lair_models.PRODUCT_UNKNOWN:
                port['product'] = file_port['product']

            # Set the service if it is not set
            if not port['service'] or port['service'] == 'unknown':
                port['service'] = file_port['service']

            # Include any script output for the port
            if file_port['notes']:
                port['notes'].extend(file_port['notes'])

            if not is_known_port:
                id = str(ObjectId())
                port['_id'] = id
                port['status'] = lair_models.STATUS_GREY
                now = datetime.utcnow().isoformat()
                temp_drone_log.append("{0} - New port found: {1}/{2} ({3})".format(
                    now,
                    str(file_port['port']),
                    file_port['protocol'],
                    file_port['service'])
                )

            post_md5 = hashlib.md5()
            post_md5.update(str(port))

            if pre_md5 != post_md5:
                port['last_modified_by'] = tool
                db.ports.save(port)

    # For each vulnerability in the parsed scan, check to see if it already
    # exists in the database.
    for file_vuln in document.get('vulnerabilities', []):

        is_known_vuln = False

        # Attempt a lookup by plugin_id...
        q = {
            'project_id': project['_id'],
            'plugin_ids': {'$all': file_vuln['plugin_ids']}
        }
        db_vuln = db.vulnerabilities.find_one(q)

        if db_vuln:
            is_known_vuln = True

        # No vuln found by plugin_id, treat as new
        if not is_known_vuln:
            db_vuln = copy.deepcopy(file_vuln)
            id = str(ObjectId())
            db_vuln['status'] = lair_models.STATUS_GREY
            db_vuln['_id'] = id
            db_vuln['project_id'] = project['_id']
            db_vuln['last_modified_by'] = tool
            now = datetime.utcnow().isoformat()
            temp_drone_log.append("{0} - New vulnerability found: {1}".format(
                now,
                file_vuln['title'])
            )
            db.vulnerabilities.save(db_vuln)

        if is_known_vuln:
            pre_md5 = hashlib.md5()
            pre_md5.update(str(db_vuln))

            db_vuln['cves'].extend(file_vuln['cves'])
            db_vuln['cves'] = list(set(db_vuln['cves']))
            db_vuln['identified_by'].extend(file_vuln['identified_by'])

            # Include any script output for the port
            if file_vuln['notes']:
                db_vuln['notes'].extend(file_vuln['notes'])

            for file_host in file_vuln['hosts']:
                if file_host not in db_vuln['hosts']:
                    db_vuln['hosts'].append(file_host)
                    now = datetime.utcnow().isoformat()
                    temp_drone_log.append("{0} - {1}:{2}/{3} - New vulnerability found: {4}".format(
                        now,
                        file_host['string_addr'],
                        str(file_host['port']),
                        file_host['protocol'],
                        file_vuln['title'])
                    )

            post_md5 = hashlib.md5()
            post_md5.update(str(db_vuln))

            # Vulnerability was known, but change was detected
            if pre_md5 != post_md5:
                db_vuln['last_modified_by'] = tool
                db.vulnerabilities.save(db_vuln)

    # Ensure history log does not exceed DRONE_LOG_HISTORY limit
    project['drone_log'].extend(temp_drone_log)
    length = len(project['drone_log'])
    del project['drone_log'][0:(length - DRONE_LOG_HISTORY)]

    db.projects.save(project)

    print "[+] Processing completed: {0} host(s) processed.".format(
        str(len(document['hosts'])))
