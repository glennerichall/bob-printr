import logger from './logger.js';
import topdf from './topdf.js';
import path from 'path';
import readdir from 'recursive-readdir';
import { tearup, teardown } from './print.js';
import progress from 'cli-progress';
import { promises } from 'fs';
import { createErrorParser } from './parser.builder.js';

const { readFile } = promises;

async function filterAsync(arr, callback) {
    const fail = Symbol();
    return (await Promise.all(
        arr.map(async item => (await callback(item)) ? item : fail)))
        .filter(i => i !== fail);
}

export async function printFiles(source, options) {
    options = options || {
        pattern: ".*",
        parts: "resolve"
    };

    const pattern = new RegExp(options.pattern);
    let files = await readdir(source);

    logger.info(`${files.length} fichier(s) trouvé(s)`);
    logger.info(`Filtrage des fichiers selon [pattern] : `);

    const hasErr = async file => {
        let parser = createErrorParser('Err:{0,1}', ':{0,1}');
        let content = await readFile(file, 'utf8');
        return parser.parse(content);
    };
    files = files.filter(file => pattern.test(path[options.parts](file)));
    files = await filterAsync(files, hasErr);

    logger.info(`${files.length} fichier(s) conservé(s)`);

    logger.info('Démarrage du moteur de rendu');
    await tearup();

    const bar = new progress.SingleBar({
        format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | File: {filename}'
    }, progress.Presets.shades_classic);
    bar.start(files.length, 0);

    let isStopped = false;
    const promises = files.map(async file => {
        let dest = file + '.pdf';
        if (!!options.destination) {
            dest = file.replace(source, '');
            dest = path.join(options.destination, dest);
            dest += '.pdf';
        }

        if (options.dryrun) {
            bar.increment(1, {
                filename: path.basename(file)
            });
            return Promise.resolve();
        }
        try {
            await topdf(file, dest);
            bar.increment(1, {
                filename: path.basename(file)
            });
        } catch (e) {
            bar.stop();
            if (!isStopped) {
                isStopped = true;
                await teardown();
            }

            throw e;
        }
    });

    await Promise.all(promises);

    bar.stop();

    logger.info('Fermeture du moteur de rendu');
    await teardown();
}