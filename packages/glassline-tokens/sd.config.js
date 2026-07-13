import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => `  --${t.name}: ${t.$value};`);
    return `@theme {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'css/root-variables',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => `  --${t.name}: ${t.$value};`);
    return `:root {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'css/dark-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => {
      const name = `--${t.name}`.replace('--gl-alias-dark-', '--gl-alias-');
      return `  ${name}: ${t.$value};`;
    });
    const body = lines.join('\n');
    return [
      `@media (prefers-color-scheme: dark) {`,
      `  :root:not([data-theme="light"]) {`,
      body.split('\n').map(l => '  ' + l).join('\n'),
      `  }`,
      `}`,
      `[data-theme="dark"] {`,
      body,
      `}`,
      '',
    ].join('\n');
  },
});

const sd = new StyleDictionary({
  source: ['tokens.json'],
  usesDtcg: true,
  platforms: {
    web: {
      prefix: 'gl',
      transformGroup: 'css',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/root-variables',
          filter: (token) => token.path[0] !== 'aliasDark',
        },
        {
          destination: 'tokens-theme.css',
          format: 'css/tailwind-theme',
          filter: (token) => token.path[0] !== 'aliasDark',
        },
        {
          destination: 'tokens-dark.css',
          format: 'css/dark-theme',
          filter: (token) => token.path[0] === 'aliasDark',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
