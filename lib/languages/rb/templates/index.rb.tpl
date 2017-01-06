{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
require_relative "{{{lower api.info.cleanTitle}}}_rest/version"
require_relative "{{{lower api.info.cleanTitle}}}_rest/error"
require_relative "{{{lower api.info.cleanTitle}}}_rest/utils"
{{#stableObjEach api.resources as |resource name|}}
require_relative "{{{lower ../api.info.cleanTitle}}}_rest/{{{underscore name}}}"
{{/stableObjEach}}
require_relative "{{{lower api.info.cleanTitle}}}_rest/client"

module {{{classify api.info.cleanTitle}}}Rest

  def self.client
    @client ||= Client.new
  end

  def self.method_missing(sym, *args, &block)
    self.client.__send__(sym, *args, &block)
  end

  def respond_to_missing?(method_name, include_private = false)
    self.client.respond_to?(method_name, include_private)
  end

end
