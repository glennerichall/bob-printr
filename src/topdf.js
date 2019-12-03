import Prism from "prismjs";
import { JSDOM } from "jsdom";
import { printContent } from "./print.js";
import { promises } from "fs";
const { writeFile, readFile } = promises;

export async function topdf(filename) {
    const outfile = filename + '.pdf';
    const text = await readFile(filename, 'utf8');
    const lang = path.extname(filename).replace(".", "");

    let content = Prism.highlight(
      text,
      Prism.languages[this.lang],
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
      code[class*=language-], 
      pre[class*=language-]{
        white-space: pre-wrap;
      }
      code[class*=language] {
        overflow: inherit;
      }
      div.exclamation {
        position: absolute;
        left: 0;
        margin-left: -16px;
      }
      div.exclamation>img {
        width: 22px;
      }
    </style>
</head>
<body>
  <pre class="language-${this.lang}"><code class="language-${this.lang}">${content}</code></pre>
</body>
</html>
`;

    const dom = new JSDOM(html, {});
    const {
      window: { document }
    } = dom;
    let elems = document.querySelectorAll("span.token.comment");
    elems = Array.from(elems)
      .filter(elem => elem.innerHTML.includes("Err:"))
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

    // console.log(dom.serialize());
    return printContent(dom.serialize(), outfile);
}