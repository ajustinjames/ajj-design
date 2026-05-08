import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => `  --${t.name}: ${t.$value};`);
    return `@theme {\n${lines.join('\n')}\n}\n`;
  },
});

const sd = new StyleDictionary({
  source: ['tokens.json'],
  usesDtcg: true,
  platforms: {
    web: {
      prefix: 'ds',
      transformGroup: 'css',
      buildPath: 'dist/web/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/tailwind-theme',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
