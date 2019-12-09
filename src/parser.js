export default class Parser {
  constructor(pattern, options) {
    this.pattern = pattern;
    this.options = options || {};
    this.options.transformers = this.options.transformers || {};
    this.options.postprocessors = this.options.postprocessors || [];
  }

  parse(text) {
    let {
      options: { transformers, postprocessors }
    } = this;
    let matches = this.pattern.exec(text);
    if (matches) {
      let range = {
        matches: Array.from(matches),
        ...matches.groups,
        first: matches.index,
        last: matches.index + matches[0].length - 1
      };
      for (let key in range) {
        if (transformers[key]) {
          range[key] = transformers[key](range[key]);
        }
      }
      for (let proc of postprocessors) {
        range = proc(range);
      }
      return range;
    }
    return null;
  }
}
