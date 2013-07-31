# Copyright (c) 2013 Tom Steele, Dan Kottmann, FishNet Security
# See the file license.txt for copying permission

__author__ = 'Dan Kottmann <djkottmann@gmail.com>'


class MissingRequiredSchemaField(Exception):

    def __init__(self, field):
        self.field = str(field)

    def __str__(self):
        return "A required field is missing from the " \
               "dictionary: {0}".format(repr(self.field))


class ProjectDoesNotExistError(Exception):

    def __init__(self, project):
        self.project = str(project)

    def __str__(self):
        return "Project does not exist in the database: {0}.".format(
            repr(self.project))


class IncompatibleVersionError(Exception):

    def __init__(self, version, curr_version):
        self.version = version
        self.curr_version = curr_version

    def __str__(self):
        return "Incompatible API version found: v{0}. Upgrade to v{1}.".format(
            self.version,
            self.curr_version
        )


class IncompatibleDataVersionError(Exception):

    def __init__(self, version):
        self.version = version

    def __str__(self):
        return "The input file is not a supported version. Expecting " \
               "{0}.".format(self.version)
