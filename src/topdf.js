import Prism from "prismjs";
import loadLanguages from 'prismjs/components/';
import { JSDOM } from "jsdom";
import { printContent } from "./print.js";
import { promises } from "fs";
const { writeFile, readFile } = promises;
import path from 'path';

export default async function topdf(filename, outfile) {
  const text = await readFile(filename, 'utf8');
  let lang = path.extname(filename).replace(".", "");

  lang = lang
    .replace('xaml', 'xml')
    .replace('cs', 'csharp');

  if (!Prism.languages[lang]) {
    loadLanguages([lang]);
  }
  let content = Prism.highlight(
    text,
    Prism.languages[lang],
    lang
  );

  let html = `
<html>
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.17.1/themes/prism-coy.min.css">
    <style>
      span.token.comment.grade {
        display: inline-block;
        font-weight: bold;
      }
      span.token.comment.error {
        color: red;
        border-radius: 5px;
        font-size: 1.2em;
        background-color: rgb(233, 233, 233);
      }
      span.token.comment.result {
        color: black;
        font-size: 2em;
        padding: calc(1em / 3);
        border: 1px solid;
        border-radius: 5px;
        margin-top: calc(3em / 4);
        margin-bottom: calc(3em / 4 + 1px);
        background-color: white;
      }
      pre[class*=language-]>code {
        background-image: none;
      }
      code[class*=language-], 
      pre[class*=language-]{
        white-space: pre-wrap;
        font-size: 0.8em;
      }
      code[class*=language] {
        overflow: inherit;
      }
      div.exclamation {
        position: absolute;
        left: 0;
        margin-left: -13px;
      }
      div.exclamation>img {
        width: 18px;
      }
    </style>
</head>
<body>
  <pre class="language-${lang}"><code class="language-${lang}">${content}</code></pre>
</body>
</html>
`;

  const dom = new JSDOM(html, {});
  const {
    window: { document }
  } = dom;
  let elems = document.querySelectorAll("span.token.comment");
  elems = Array.from(elems)
    .filter(elem => elem.innerHTML.includes("Err"))
    .forEach(elem => {
      elem.classList.add("error", "grade");
      elem.innerHTML = '<div class="exclamation"><img src="https://image.flaticon.com/icons/svg/1599/1599171.svg"></div>' + elem.innerHTML.replace(/(\/\*|\*\/|&lt;!--|--&gt;)/g, "");
    });

  elems = document.querySelectorAll("span.token.comment");
  elems = Array.from(elems)
    .filter(elem => elem.innerHTML.includes("Résultat:"))
    .forEach(elem => {
      elem.classList.add("result", "grade");
      elem.innerHTML = elem.innerHTML.replace(/(\/\*|\*\/|&lt;!--|--&gt;)/g, "");
    });

  const result = await printContent(dom.serialize(), outfile);
  // await writeFile(outfile.replace('.pdf', '.html'), dom.serialize(), 'utf8');
  return result;
}