# Underscore Docs Parser

CLI that scrapes Underscore.js documentation to generate an easy to consume JSON representation.

## Install

```shell
npm install -g underscore-docs-parser
```

## Usage

Output to `underscore-api.json`

```shell
_.docsParser -o underscore-api.json
_.docsParser --output underscore-api.json
```

...or, with **io piping**.
```shell
_.docsParser -s > underscore-api.json
_.docsParser --stream > underscore-api.json
```

You can optionally replace the default url to Underscore.js's html documentation.  
```shell
_.docsParser -u localhost:8080/underscore-api.html -o underscore-api.json
_.docsParser --url localhost:8080/underscore-api.html --output underscore-api.json
```
_Note: This tool will only work for the specific html written by jashkenas, and contributors, in the Underscore.js repository._

## Format

**string `name`**  
The Underscore.js method name (strictly top level methods).

**array(string) `aliases`**  
An array of alias to the above method name. Array will be empty if there are no aliases.

**array(string) `arguments`**  
An array of arguments for the method. Array will be empty if there are no arguments.

**string `description`**  
The plain text description for the method (not including code samples).

### Example

```json
[
  {
    "name": "each",
    "aliases": [
      "forEach"
    ],
    "arguments": [
      "list",
      "iteratee",
      "[context]"
    ],
    "description": "Iterates over a list of elements, yielding each in turn to an iteratee function. The iteratee is bound to the context object, if one is passed. Each invocation of iteratee is called with three arguments:(element, index, list). If list is a JavaScript object, iteratee's arguments will be (value, key, list). Returns the list for chaining."
  },
  ...
]
```

## Credit

[Underscore.js](https://github.com/jashkenas/underscore) project for the lib and documentation.

## License

[The MIT License (MIT)](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Lochlan Bunn
