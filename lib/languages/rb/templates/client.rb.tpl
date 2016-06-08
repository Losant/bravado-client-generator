require "httparty"

module {{classify api.info.cleanTitle}}Rest
  # {{api.info.title}}
  {{#if api.info.description}}
  #
  # {{api.info.description}}
  {{/if}}
  #
  # Built For Version {{api.info.version}}
  class Client
    attr_accessor :auth_token, :url

    def initialize(options = {})
      self.auth_token = options.fetch(:auth_token, nil)
      self.url        = options.fetch(:url, "{{options.root}}")
    end

    {{#each api.resources as |resource name|}}
    def {{underscore name}}
      @{{underscore name}} ||= {{classify name}}.new(self)
    end

    {{/each}}
    def request(options = {})
      headers = options.fetch(:headers, {})
      method  = options.fetch(:method, :get)

      headers["Accept"]         = "application/json"
      headers["Content-Type"]   = "application/json"
      headers["Accept-Version"] = "^{{api.info.version}}"
      headers["Authorization"]  = "Bearer #{self.auth_token}" if self.auth_token
      path = self.url + options.fetch(:path, "")

      response = HTTParty.send(method, path,
        query: Utils.fix_query_arrays(options[:query]),
        body: options[:body] && options[:body].to_json(),
        headers: headers)

      result = response.parsed_response
      if response.code >= 400
        raise ResponseError.new(response.code, result)
      end

      result
    end
  end
end
