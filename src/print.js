import request from "request-promise-native";
import { promises } from "fs";
import fs from "fs";
const readFile = promises.readFile;
const writeFile = promises.writeFile;

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

export async function printContent(content, outfile) {
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

export async function printFile(file) {
  const content = await readFile(file, "utf-8");
  return printContent(content);
}
