#!/usr/bin/env node

"use strict";

let program  = require('commander');
let chalk    = require('chalk');
let path     = require('path');
let url      = require('url');
let fs       = require('fs');
let got      = require('got');
let cheerio  = require('cheerio');
let _compact = require('lodash.compact');
let _map     = require('lodash.map');

program
  .description('Parses the latest Underscore documentation into JSON.')
  .option('-u, --url <url>', 'url to html doc')
  .option('-o, --output <path>', 'output file')
  .option('-s, --stream', 'stream output to stdout')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp((text) => chalk.red(text));
  process.exit(1);
}

const URL_TO_DOCS = program.url || 'http://raw.githubusercontent.com/jashkenas/underscore/master/index.html';

const IS_STREAMING = program.stream != null;
const IS_WRITING = !IS_STREAMING && program.output != null;
const IS_LOGGING = IS_WRITING;
const LOG_PREFIX = chalk.cyan('>');
const LOG_SUCCESS_PREFIX = chalk.green('>');

function log() {
  if (IS_LOGGING) {
    Array.prototype.unshift.call(arguments, LOG_PREFIX);
    console.log.apply(console, arguments);
  }
}

function logSuccess() {
  if (IS_LOGGING) {
    Array.prototype.unshift.call(arguments, LOG_SUCCESS_PREFIX);
    console.log.apply(console, arguments);
  }
}

function logTitle() {
  if (IS_LOGGING) {
    console.log(chalk.magenta('\n  Underscore.js Documentation Parser\n'))
  }
}
logTitle();

log(`Fetching documentation from ${chalk.blue(URL_TO_DOCS)}...`);
got(URL_TO_DOCS)
  .then(resolveResponseToDom)
  .then(parseDocDomToDocJson)
  .catch(logError);

function resolveResponseToDom(response) {
  logSuccess('Received documentation HTML\n')

  let html = response.body + " "; // Allocate to new memory;
  let dom = cheerio.load(html);

  return dom;
}

function logError(error) {
  console.error(err);
}

function stripStrangeNewLines(text) {
  return text.replace(/(\w)\n\s+/ig, '$1 ').replace(/\n\s+/ig, '');
}

function parseDocDomToDocJson(dom) {
  log('Parsing HTML to JSON...')

  // Look for p tags that contain a header AND a code, which is the
  // method name and signature.
  let docEntries = dom('#documentation p[id]:has(.header + code)');

  let api = _map(docEntries.get(), (doc) => {
    doc = dom(doc);

    let isTopLevelApiMethod = doc.children('code').text().match(/_\.\w+\(.*\)/) != null;

    // Bail out when we find this isn't a top level underscore function.
    // (Ignores methods like 'value')
    if (!isTopLevelApiMethod) return false;

    let entry = {
      name: '',
      aliases: [],
      arguments: [],
      description: ''
    }

    // API method name
    entry.name = doc.children('.header').text();

    // API method aliases, if they exist
    if (doc.children('.alias').length > 0) {
      entry.aliases = doc.children('.alias').text().replace(/Alias: /, '').split(', ');
    }

    // API method arguments
    entry.arguments = _compact(doc.children('code').text().match(/_\.\w+\((.*)\)/)[1].split(', '));

    // API method description
    doc.children().remove('.header, code, .alias, br');
    entry.description = stripStrangeNewLines(doc.text()); // HACK: removes abundant newlines
    if (doc.next('p').length > 0) {
      entry.description += `\n${stripStrangeNewLines(doc.next('p').text())}`;
    }

    return entry;
  });

  api = _compact(api);

  logSuccess(`${chalk.magenta(api.length)} documented methods parsed into JSON

${_map(api, (apiItem) => chalk.magenta(apiItem.name)).join(', ')}\n`);

  if (IS_WRITING) {
    log(`Writing JSON to ${chalk.blue(program.output)}...`)
    fs.writeFile(program.output, JSON.stringify(api, null, '  '), function (err) {
      if (err) throw err;
      logSuccess(`File saved. Bye.`)
    });
  } else if (IS_STREAMING) {
    process.stdout.write(JSON.stringify(api, null, '  '));
  }

}
