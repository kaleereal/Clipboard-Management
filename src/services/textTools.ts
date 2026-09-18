export interface CleanOptions {
  removeExcessLines: boolean;
  trimSpaces: boolean;
  removeTabs: boolean;
  removeDoubleSpaces: boolean;
}

export function cleanText(input: string, options: CleanOptions): string {
  let result = input;
  if (options.removeTabs) {
    result = result.replace(/\t/g, '    ');
  }
  if (options.removeDoubleSpaces) {
    result = result.replace(/ {2,}/g, ' ');
  }
  if (options.removeExcessLines) {
    result = result.replace(/\n{3,}/g, '\n\n');
  }
  if (options.trimSpaces) {
    result = result
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  }
  return result;
}

export function convertCase(input: string, targetCase: string): string {
  if (!input) return '';

  const words = input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/);

  switch (targetCase.toLowerCase()) {
    case 'camelcase':
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join('');
    case 'snake_case':
      return words.map(w => w.toLowerCase()).join('_');
    case 'kebab-case':
      return words.map(w => w.toLowerCase()).join('-');
    case 'uppercase':
      return input.toUpperCase();
    case 'lowercase':
      return input.toLowerCase();
    case 'title case':
    case 'titlecase':
      return words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    default:
      return input;
  }
}

export function formatCode(input: string, format: string, mode: 'PRETTIFY' | 'MINIFY'): string {
  if (format.toUpperCase() === 'JSON') {
    try {
      const parsed = JSON.parse(input);
      if (mode === 'MINIFY') {
        return JSON.stringify(parsed);
      }
      return JSON.stringify(parsed, null, 2);
    } catch (err: any) {
      return `[Error Parsing JSON]: ${err.message}`;
    }
  }

  if (format.toUpperCase() === 'XML' || format.toUpperCase() === 'HTML') {
    if (mode === 'MINIFY') {
      return input.replace(/>\s+</g, '><').trim();
    }
    // Simple basic indent formatter for XML/HTML
    let formatted = '';
    let indent = 0;
    const tab = '  ';
    input.split(/>\s*</).forEach(node => {
      if (node.match(/^\/\w/)) indent = Math.max(0, indent - 1);
      formatted += `${tab.repeat(indent)}<${node}>\n`;
      if (node.match(/^<?\w[^>]*[^\/]$/)) indent++;
    });
    return formatted.replace(/^<|>\n$/g, '').trim();
  }

  return input;
}

export interface ExtractedData {
  phoneNumbers: string[];
  emails: string[];
  urls: string[];
  ipAddresses: string[];
}

export function extractData(input: string): ExtractedData {
  const phoneRegex = /(?:\+?[\d\s\-\(\)]{8,16}\d)/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRegex = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
  const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;

  return {
    phoneNumbers: Array.from(new Set(input.match(phoneRegex) || [])),
    emails: Array.from(new Set(input.match(emailRegex) || [])),
    urls: Array.from(new Set(input.match(urlRegex) || [])),
    ipAddresses: Array.from(new Set(input.match(ipRegex) || [])),
  };
}

export function generateLorem(type: 'PARAGRAPHS' | 'SENTENCES' | 'WORDS', count: number): string {
  const wordsList = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit',
    'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
    'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
    'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  if (type === 'WORDS') {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(wordsList[i % wordsList.length]);
    }
    return result.join(' ');
  }

  if (type === 'SENTENCES') {
    const sentences: string[] = [];
    for (let s = 0; s < count; s++) {
      const sentenceWords = wordsList.slice(0, 8 + (s % 6));
      const str = sentenceWords.join(' ');
      sentences.push(str.charAt(0).toUpperCase() + str.slice(1) + '.');
    }
    return sentences.join(' ');
  }

  // PARAGRAPHS
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const paragraphSentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    ];
    paragraphs.push(paragraphSentences.join(' '));
  }
  return paragraphs.join('\n\n');
}

export function substituteVariables(text: string, clipboardText: string = ''): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID');
  const timeStr = now.toLocaleTimeString('id-ID');
  const dateTimeStr = `${dateStr} ${timeStr}`;

  return text
    .replace(/\{date\}/g, dateStr)
    .replace(/\{time\}/g, timeStr)
    .replace(/\{datetime\}/g, dateTimeStr)
    .replace(/\{clipboard\}/g, clipboardText);
}

export function calculateTextStats(text: string): { charCount: number; wordCount: number; lineCount: number } {
  if (!text) {
    return { charCount: 0, wordCount: 0, lineCount: 0 };
  }
  const charCount = text.length;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = text.split('\n');
  const lineCount = lines.length;
  return { charCount, wordCount, lineCount };
}
