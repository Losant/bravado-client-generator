Schemas
=======
{{#each api.definitions as |schema schemaName|}}


{{schemaName}}
{{underline schemaName '-'}}

::

{{{indent (json schema)}}}
{{/each}}
