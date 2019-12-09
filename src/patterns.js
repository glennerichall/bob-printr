export const positiveInt = '\\d+';
export const positiveFloat = '\\d+(\\.\\d+){0,1}';
export const float = `-{0,1}${positiveFloat}`;
export const int = `-{0,1}${positiveInt}`;
export const ratio = `((${positiveFloat})/(${positiveInt}))`;

export const tagCapture = (tag, content) =>
  `(?<tag>${tag})(?<target>${content || '.*'})`;

export const tagSequence = (tagBegin, tagEnd, content) =>
  tagCapture(
    `${tagBegin}\\s*(?<sequence>${positiveInt})\\s*${tagEnd}`,
    content
  );

export const errorTag = (tag, sep, content) =>
  tagSequence(
    `(?<error>${tag})\\s*\\(`,
    `\\)\\s*${sep || ''}`,
    content || '.*'
  );

export const commentBlock = '(\\/\\*)([\\s\\S]*?)(\\*\\/)';
export const commentLine = '(\\/\\/)(.*)($)';
export const commentXml = '(<!--)([\\s\\S]*?)(-->)';
export const commentSharp = `(^#)(.*)($)`;

export const comment =
  '(' + [commentBlock, commentLine, commentXml, commentSharp].join('|') + ')';

