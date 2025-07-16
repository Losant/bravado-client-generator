{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
""" Module for {{{api.info.cleanTitle}}} Client class """
# pylint: disable=E0401

import requests
try:
    from collections.abc import Mapping
except ImportError:
    from collections import Mapping
import sys
{{#stableObjEach api.resources as |resource name|}}
from .{{{underscore name}}} import {{{classify name}}}
{{/stableObjEach}}
from .{{{underscore api.info.cleanTitle}}}_error import {{{classify api.info.cleanTitle}}}Error

if sys.version_info[0] == 3:
    basestring = str

class Client(object):
    """
    {{{api.info.title}}}
    {{#if api.info.description}}

    {{{api.info.description}}}
    {{/if}}

    Built For Version {{{api.info.version}}}
    """

    def __init__(self, auth_token=None, url="{{{options.root}}}"):
        self.url = url
        self.auth_token = auth_token
        {{#stableObjEach api.resources as |resource name|}}
        self.{{{underscore name}}} = {{{classify name}}}(self)
        {{/stableObjEach}}

    def request(self, method, path, params=None, headers=None, body=None):
        """ Base method for making a {{{api.info.title}}} request """
        if not headers:
            headers = {}
        if not params:
            params = {}

        headers["Accept"] = "application/json"
        headers["Accept-Version"] = "^{{{api.info.version}}}"
        if self.auth_token:
            headers["Authorization"] = "Bearer {0}".format(self.auth_token)

        path = self.url + path
        params = self.flatten_params(params)
        response = requests.request(method, path, params=params, headers=headers, json=body)

        result = response.text
        try:
            result = response.json()
        except Exception:
            pass

        if response.status_code >= 400:
            raise {{{classify api.info.cleanTitle}}}Error(response.status_code, result)

        return result

    def flatten_params(self, data, base_key=None):
        """ Flatten out nested arrays and dicts in query params into correct format """
        result = {}

        if data is None:
            return result

        map_data = None
        if not isinstance(data, Mapping):
            map_data = []
            for idx, val in enumerate(data):
                map_data.append([str(idx), val])
        else:
            map_data = list(data.items())

        for key, value in map_data:
            if not base_key is None:
                key = base_key + "[" + key + "]"

            if isinstance(value, basestring) or not hasattr(value, "__iter__"):
                result[key] = value
            else:
                result.update(self.flatten_params(value, key))

        return result
