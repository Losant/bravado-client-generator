""" Module containing the {{classify api.info.cleanTitle}}Error class """

class {{classify api.info.cleanTitle}}Error(Exception):
    """ Exception class for any {{ api.info.title }} errors """

    def __init__(self, status, data):
        Exception.__init__(self)
        self.status = status
        self.data = data
        self.args = [status, data]

    def __str__(self):
        return str(self.status) + " " + str(self.data)
