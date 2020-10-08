#!/usr/bin/env node

import yargs from 'yargs';
import version from './version.js';
import logger from './logger.js';
import { levels } from './logger.js';
import NpmApi from 'npm-api';
import { prnCmd, preCmd } from './cli-args.js';

version().then((value) => {
  try {
    let argv = yargs
      .scriptName('bobp')
      .usage('$0 <cmd> [args]')
      .version(value)
      .command(...prnCmd)
      .command(...preCmd)
      .wrap(yargs.terminalWidth())
      .demandCommand(1, '')
      .strict(true)
      .showHelpOnFail(true)
      .exitProcess(false)
      .help().argv;

    if (argv.verbose) {
      logger.level = levels.info;
    }

    logger.info('\nCurrent effective options are:');
    logger.info(argv);
  } catch (e) {}

  let npm = new NpmApi();
  var repo = npm.repo('bob-printr');

  repo
    .package()
    .then((pkg) => {
      if ('v' + pkg.version != value) {
        console.warn(
          `Newer version available ${pkg.version}, consider upgrading it`
        );
      }
    })
    .catch((e) => {});
});
