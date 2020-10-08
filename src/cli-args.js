import * as localPresets from './cli-presets.js';
import { printFiles } from './cli-print.js';
import { promises } from 'fs';
const { stat } = promises;
import logger from './logger.js';

const pattern = [
  'pattern',
  {
    type: 'string',
    default: '.*',
    describe: 'Filtrer les fichiers selon une expression régulière',
  },
];

const parts = [
  'parts',
  {
    choices: ['basename', 'dirname', 'extname', 'resolve'],
    default: 'basename',
    describe: 'Considérer seulement certaines parties du nom de fichier',
  },
];

const destination = [
  'destination',
  {
    type: 'string',
    describe: 'Répertoire de destination',
  },
];

export const prnCmd = [
  'print <source> [destination] [pattern] [parts] [preset] [verbose] [dryrun]',
  'Exporter les fichiers en pdf avec coloration syntaxique',
  (y) =>
    y
      .positional('source', {
        type: 'string',
        describe:
          'Chemin de répertoire contenant les fichiers à exporter en pdf',
      })
      .option(...pattern)
      .option(...parts)
      .option(...destination)
      .option('preset', {
        type: 'array',
        default: [],
        describe: "Ensemble(s) d'arguments prédéfinis (Voir commande [preset])",
      })
      .option('verbose', {
        type: 'boolean',
        describe: 'Exécution verbeuse',
      })
      .option('dryrun', {
        type: 'boolean',
        describe: 'Ne pas exécuter la commande',
      })
      .middleware([
        (argv) => {
          if (argv['_'][0] == 'print') {
            logger.info('Applying presets');
            if (!!argv.preset && !localPresets.hasPreset(argv.preset)) {
              logger.error(`Le preset ${argv.preset} n'existe pas`);
              throw new Error(`Le preset ${argv.preset} n'existe pas`);
            }
            let presets = localPresets.applyPresets(argv.preset || []);
            for (let key of Object.keys(presets)) {
              argv[key] = presets[key];
            }
          }
        },
      ])
      .implies('parts', 'pattern'),
  async (args) => {
    logger.info('Printing files');
    await printFiles(args.source, args);
  },
];

// ---------------------------------------------------------------------------
const add_args = '<preset> [pattern] [parts]';
const add_build = (y) =>
  y
    .positional('preset', {
      type: 'string',
      describe: 'Nom du preset',
    })
    .option(pattern[0], { ...pattern[1], default: undefined })
    .option(parts[0], { ...parts[1], default: undefined })
    .group(['pattern', 'parts'], 'Preset parameters')
    .check((args) => args.pattern != undefined || args.parts != undefined);

const check_exists = (preset) => {
  const presets = localPresets.listPresets();
  if (presets[preset] == undefined) {
    throw new Error(`Le preset ${preset} n'existe pas`);
  }
  return true;
};

export const preCmd = [
  'presets',
  "Gérer les groupes d'arguments prédéfinis (preset)",
  (yargs) =>
    yargs
      .usage('$0 presets <cmd> [args]')
      .command(
        `add ${add_args}`,
        'Ajouter un preset',
        (y) => add_build(y),
        (args) => {
          localPresets.putPreset(args.preset, args);
          console.log('done');
        }
      )
      .command(
        `append ${add_args}`,
        'Ajouter des arguments à un preset',
        (y) => add_build(y).check((args) => check_exists(args.preset)),
        (args) => {
          localPresets.mergePreset(args.preset, args);
          console.log('done');
        }
      )
      .command(
        'rename <old> <new>',
        'Renommer un preset',
        (y) =>
          y
            .positional('old', {
              type: 'string',
              describe: 'Le preset a renommer',
            })
            .positional('new', {
              type: {
                type: 'string',
                describe: 'Le nouveau nom',
              },
            }),
        (args) => {
          const presets = localPresets.listPresets();
          if (presets[args.old] == undefined) {
            logger.error(`Le preset ${args.old} n'existe pas`);
          } else if (presets[args.new] != undefined) {
            logger.error(`Le preset ${args.new} existe déjà`);
          } else {
            localPresets.renamePreset(args.old, args.new);
            logger.log('done');
          }
        }
      )
      .command(
        'list',
        'Afficher tous les presets',
        (y) => {},
        async (args) => {
          let preset = await localPresets.listPresets();
          let string = JSON.stringify(preset, undefined, 2);
          string = string.replace(/\\\\/g, '\\');
          console.log(string);
        }
      )
      .command(
        'clear',
        'Supprimer tous les presets',
        (y) => {},
        (args) => {
          localPresets.clearPresets();
          console.log('done');
        }
      )
      .command(
        'import <file>',
        "Importer une liste de presets d'un fichier json",
        (y) =>
          y.positional('file', {
            type: 'string',
            describe: 'Fichier json',
          }),
        async (args) => {
          let file = await stat(args.file);
          if (!file.isFile) {
            console.error(`Le fichier ${args.file} n'existe pas`);
            return;
          }
          await localPresets.importPresets(args.file);
          console.log('done');
        }
      )
      .command(
        'remove <preset>',
        'Supprimer un preset',
        (y) =>
          y.positional('preset', {
            type: 'string',
            describe: 'Nom du groupe',
          }),
        async (args) => {
          if (args.shared) {
            await remotePresets.removePreset(args.preset);
          } else {
            localPresets.removePreset(args.preset);
          }
          console.log('done');
        }
      )
      .demandCommand(1, '')
      .strict()
      .showHelpOnFail(true),
];
