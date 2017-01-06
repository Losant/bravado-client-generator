{{#if options.license}}
{{{commentify options.license}}}

{{/if}}
module {{{classify api.info.cleanTitle}}}Rest
  class ResponseError < StandardError
    attr_reader :code
    attr_reader :type

    def initialize(code, result)
      @code = code
      @type = result["type"]
      super(result["message"])
    end
  end
end
