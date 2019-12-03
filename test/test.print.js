import * as patterns from "../src/patterns.js";
import { expect } from "chai";
import { printContent } from "../src/print.js";
import { promises } from "fs";
const unlink = promises.unlink;
const readFile = promises.readFile;

describe("print", () => {
  describe("#printContent", () => {
    it("should create pdf from string", async () => {
      const html = `<html><body><h1>Hello World!</h1></body></html>`;
      const outfile = "./tests/test.printcontent.pdf";
        const pdf = await printContent(html, outfile);
    //   const pdf = await printContent(html);
      const content = await readFile(outfile);
      expect(pdf).to.deep.equal(content);
    }).timeout(20000);
  });
});
