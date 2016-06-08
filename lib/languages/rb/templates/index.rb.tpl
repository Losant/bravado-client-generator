require_relative "{{lower api.info.cleanTitle}}_rest/version"
require_relative "{{lower api.info.cleanTitle}}_rest/error"
{{#each api.resources as |resource name|}}
require_relative "{{lower ../api.info.cleanTitle}}_rest/{{underscore name}}"
{{/each}}
require_relative "{{lower api.info.cleanTitle}}_rest/client"
