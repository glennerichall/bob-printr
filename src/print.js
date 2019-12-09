import request from "request-promise-native";
import { promises } from "fs";
import path from 'path';
import fs from "fs";
const readFile = promises.readFile;
const writeFile = promises.writeFile;
import mkdirp from 'mkdirp';
import { promisify } from 'util';
import puppeteer from 'puppeteer';

const mkdir = promisify(mkdirp);

const uri = `https://immense-citadel-73637.herokuapp.com/generate`;
// const uri = `https://pdf-calma.herokuapp.com/generate`;

export function createPdf(content) {
  var options = {
    method: "POST",
    uri,
    body: {
      html: content,
      printBackground: true
    },
    json: true
  };
  return request(options);
}

export async function getPdf(uri) {
  var options = {
    method: "GET",
    uri
  };
  let response = await request(options);
  return response;
}

let browser;
export async function tearup() {
  browser = await puppeteer.launch();
}

export async function teardown() {
  return browser.close();
}

export async function printContent(content, outfile) {
  try {
    await mkdir(path.dirname(outfile));
  } catch (e) {
    throw new Error(`Impossible de créer le répertoire ${path.dirname(outfile)}`);
  }
  return printContentLocal(content, outfile);
}

export async function printContentLocal(content, outfile) {
  const page = await browser.newPage();

  await page.setContent(content, { waitUntil: 'networkidle0' });
  await page.pdf(
    {
      printBackground: true,
      path: outfile,
      format: 'Letter'
    });

  await page.close();
}

export async function printContentRemote(content, outfile) {
  let response = await createPdf(content);
  let req = request(response.url);

  return new Promise((resolve, reject) => {
    req.on("response", response => {
      let buf;
      response.on("data", data => {
        if (Buffer.isBuffer(buf)) {
          buf = Buffer.concat([buf, data]);
        } else {
          buf = data;
        }
      });
      response.on("end", () => {
        if (!!outfile) {
          writeFile(outfile, buf).then(() => resolve(buf));
        } else {
          resolve(buf);
        }
      });
    });
    req.on("error", err => reject(err));
  });
}

export async function printFile(file, outfile) {
  const content = await readFile(file, "utf-8");
  if (outfile == undefined) {
    outfile = file + '.pdf';
  }
  return printContent(content, outfile);
}
