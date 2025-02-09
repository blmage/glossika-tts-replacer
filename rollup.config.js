import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import metablock from 'rollup-plugin-userscript-metablock';
import yup from 'yup';
import pkg from './package.json'  assert { type: 'json' };
import rawSettings from './settings.json' assert { type: 'json' };

const settingsSchema = yup.object({
  api_key: yup.string().trim().required(),
  languages: yup.lazy(
    (map) => yup.object(
      Object.keys(map).reduce(
        (newMap, key) => ({
          ...newMap,
          [key]: yup.object({
            modelId: yup.string().trim().optional(),
            voice: yup.string().trim().required(),
            languageCode: yup.string().trim().required(),
            voiceSettings: yup.object({
              stability: yup.number().min(0).optional(),
              similarityBoost: yup.number().min(0).optional(),
              style: yup.number().min(0).optional(),
              useSpeakerBoost: yup.boolean().optional(),
            }).optional(),
          })
        }),
        {}
      ),
    ),
  )
});

let settings;

try {
  settings = await settingsSchema.validate(rawSettings ?? {});
} catch (error) {
  throw new Error(`Invalid configuration data found in "settings.json":\n${error.message}`);
}

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/gtr.user.js',
    format: 'iife',
    name: 'gtrUserScript',
    sourcemap: false,
  },
  plugins: [
    replace({
      preventAssignment: true,
      __api_key__: `"${settings.api_key}"`,
      __language_base_api_payloads__: JSON.stringify(settings.languages),
    }),
    nodeResolve({
      extensions: [ '.js', '.ts', '.tsx' ]
    }),
    commonjs({
      include: [
        'node_modules/**',
      ],
    }),
    metablock({
        file: './meta.json',
        override: {
          version: pkg.version,
          description: pkg.description,
          homepage: pkg.repository,
          author: pkg.author,
          license: pkg.license,
        }
      })
  ],
};