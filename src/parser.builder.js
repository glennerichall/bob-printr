import { tagCapture, errorTag, ratio, comment } from './patterns.js';
import Parser from './parser.js';

const chain = (a, b, map0, maps) => {
  return {
    parse(txt) {
      let res;
      let range;
      do {
        res = a.parse(txt);
        if (!res) return null;
        range = b.parse(res[map0]);
      } while (range == null);
      maps.forEach(key => {
        res[key] = range[key];
      });
      return res;
    }
  };
};

export function createTagParser(tag) {
  const pattern = new RegExp(tagCapture(tag, '.*'), 'm');
  let parser = new Parser(pattern, {
    transformers: {
      target: content => content.trim()
    }
  });
  return chain(createCommentParser(), parser, 'content', ['target', 'tag']);
}

export function createErrorParser(tag) {
  const pattern = new RegExp(errorTag(tag), 'm');
  const parser = new Parser(pattern, {
    transformers: {
      target: content => content.trim(),
      tag: content => content.trim(),
      sequence: seq => Number.parseInt(seq)
    },
    postprocessors: [
      range => {
        range.id = range.sequence;
        return range;
      }
    ]
  });
  return chain(createCommentParser(), parser, 'content', [
    'target',
    'tag',
    'sequence',
    'id'
  ]);
}

export function createResultParser(tag) {
  let content = `${tag}\\s*(?<result>${ratio})`;
  const pattern = new RegExp(content, 'm');
  let parser = new Parser(pattern, {
    transformers: {
      content: content => content.trim(),
      result: r => {
        let tokens = r.split('/');
        let numerator = Number.parseFloat(tokens[0]);
        let denominator = Number.parseFloat(tokens[1]);
        return {
          numerator,
          denominator
        };
      }
    }
  });

  return chain(createCommentParser(), parser, 'content', ['result']);
}

export function createCommentParser(local) {
  let pattern = new RegExp(comment, !local ? 'gm' : 'm');
  return new Parser(pattern, {
    postprocessors: [
      range => {
        let o = range.matches.slice(2).filter(x => x);
        range.begin = o[0];
        range.content = o[1];
        range.end = o[2];
        return range;
      }
    ]
  });
}

const inner = createCommentParser(true);
export function stripCommentTags(text) {
  const range = inner.parse(text);
  if (!!range) {
    let content = range.content.trim();
    return text.replace(range.matches[0], content);
  }
  return text;
}
