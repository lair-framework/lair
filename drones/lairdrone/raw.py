#!/usr/bin/env python
# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

import os
import sys
import json
sys.path.append(os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..'))
)


def parse(project, resource):
    """Parses a raw JSON file and updates the Lair database

    :param project: The project id
    :param resource: The JSON file, string, or dict to be parsed
    """

    # Attempt to parse resource as file or string
    if isinstance(resource, str) and os.path.isfile(resource):
        with open(resource, "r") as raw_json:
            project_dict = json.load(raw_json)
    elif isinstance(resource, str):
        project_dict = json.loads(resource)
    elif isinstance(resource, dict):
        project_dict = resource
    else:
        raise TypeError

    project_dict['project_id'] = project

    return project_dict
