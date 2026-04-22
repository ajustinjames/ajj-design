import StyleDictionary from 'style-dictionary';

StyleDictionary.registerFormat({
  name: 'css/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens.map(t => `  --${t.name}: ${t.$value};`);
    return `@theme {\n${lines.join('\n')}\n}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-colors',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter(t => t.$type === 'color');
    const entries = tokens.flatMap(t => {
      const raw = t.$value;
      const name = t.name
        .replace(/^ds-/, '')
        .replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      // Handle rgba(...) values → Color.fromRGBO(r, g, b, opacity)
      const rgbaMatch = raw.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
      if (rgbaMatch) {
        const [, r, g, b, a = '1'] = rgbaMatch;
        return [`  static const Color ${name} = Color.fromRGBO(${r}, ${g}, ${b}, ${a});`];
      }
      // Handle hex values
      if (raw.startsWith('#')) {
        const hex = raw.replace('#', '');
        return [`  static const Color ${name} = Color(0xFF${hex.toUpperCase()});`];
      }
      // Skip unrecognised formats
      return [];
    });
    return [
      "import 'package:flutter/material.dart';",
      '',
      'class AppColors {',
      entries.join('\n'),
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-shadows',
  format: () => {
    return [
      "import 'package:flutter/material.dart';",
      '',
      'class AppShadows {',
      '  static const Map<int, BoxShadow> elevation = {',
      '    1: BoxShadow(offset: Offset(2, 2), blurRadius: 0, color: Color(0xFF000000)),',
      '    2: BoxShadow(offset: Offset(4, 4), blurRadius: 0, color: Color(0xFF000000)),',
      '    3: BoxShadow(offset: Offset(8, 8), blurRadius: 0, color: Color(0xFF000000)),',
      '  };',
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-spacing',
  format: ({ dictionary }) => {
    const tokens = dictionary.allTokens.filter(t =>
      t.name.startsWith('ds-alias-space-')
    );
    const entries = tokens.map(t => {
      const num = t.name.replace('ds-alias-space-', '');
      const px = parseFloat(t.value);
      return `  static const double space${num} = ${px}.0;`;
    });
    return [
      'class AppSpacing {',
      entries.join('\n'),
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-fonts',
  format: () => {
    return [
      'class AppFonts {',
      "  static const String mono = 'JetBrains Mono';",
      "  static const String ui   = 'Inter';",
      '}',
      '',
    ].join('\n');
  },
});

StyleDictionary.registerFormat({
  name: 'flutter/app-text-styles',
  format: () => {
    return [
      "import 'package:flutter/material.dart';",
      "import 'app_fonts.dart';",
      "import 'app_colors.dart';",
      '',
      'class AppTextStyles {',
      '  static const TextStyle label = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorInk,',
      '  );',
      '  static const TextStyle labelMuted = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorMuted,',
      '  );',
      '  static const TextStyle labelAccent = TextStyle(',
      "    fontFamily: AppFonts.mono,",
      '    fontSize: 11,',
      '    letterSpacing: 0.55,',
      '    color: AppColors.globalColorAccent,',
      '  );',
      '}',
      '',
    ].join('\n');
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
    flutter: {
      prefix: 'ds',
      transformGroup: 'css',
      buildPath: 'dist/flutter/',
      files: [
        { destination: 'app_colors.dart',      format: 'flutter/app-colors' },
        { destination: 'app_shadows.dart',     format: 'flutter/app-shadows' },
        { destination: 'app_spacing.dart',     format: 'flutter/app-spacing' },
        { destination: 'app_fonts.dart',       format: 'flutter/app-fonts' },
        { destination: 'app_text_styles.dart', format: 'flutter/app-text-styles' },
      ],
    },
  },
});

await sd.buildAllPlatforms();
