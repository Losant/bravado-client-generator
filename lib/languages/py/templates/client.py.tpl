""" Module for {{api.info.title}} Client class """
# pylint: disable=E0401

import requests
{{#each api.resources as |resource name|}}
from .{{underscore name}} import {{classify name}}
{{/each}}
from .{{underscore api.info.cleanTitle}}_error import {{classify api.info.cleanTitle}}Error

class Client(object):
    """
    {{api.info.title}}
    {{#if api.info.description}}

    {{api.info.description}}
    {{/if}}

    Built For Version {{api.info.version}}
    """

    def __init__(self, auth_token=None, url="{{options.root}}"):
        self.url = url
        self.auth_token = auth_token
        {{#each api.resources as |resource name|}}
        self.{{underscore name}} = {{classify name}}(self)
        {{/each}}

    def request(self, method, path, params=None, headers=None, body=None):
        """ Base method for making a {{api.info.title}} request """
        if not headers:
            headers = {}
        if not params:
            params = {}

        headers["Accept"] = "application/json"
        headers["Accept-Version"] = "^{{api.info.version}}"
        if self.auth_token:
            headers["Authorization"] = "Bearer {0}".format(self.auth_token)

        path = self.url + path
        response = requests.request(method, path, params=params, headers=headers, json=body)

        result = response.text
        try:
            result = response.json()
        except Exception:
            pass

        if response.status_code >= 400:
            raise {{classify api.info.cleanTitle}}Error(response.status_code, result)

        return result
