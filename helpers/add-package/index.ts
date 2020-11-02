import * as path from 'path';

import { getInput } from './terminal';
import {
  PACKAGES_PATH, WEBPACK_RESOLVE_PATH, INCORRECT_NAME_ERROR, TEMPLATE_FILES_PATH,
  TS_ROOT_CONFIG_PATH,
} from './constants';
import { mkDir, appendText, copyPack } from './fs';

const COPY_LIST: (string | { from: string; to: string })[] = [
  'package.json',
  '.babelrc',
  'LICENSE',
  'README.md',
  'tsconfig.json',
  'tslint.json',
  'webpack.config.js',
  'webpack.const.js',
  'webpack.resolve.js',
  'postcss.config.js',
  'tests/__mocks__/styleMock.js',
  'src/index.html',
  'src/index.scss',
  'rollup.const.js',
  'rollup.config.js',
  { from: 'src/start.tts', to: 'src/start.ts' },
  { from: 'src/index.tts', to: 'src/index.ts' },
  { from: 'src/Plugin/constants.tts', to: 'src/{{alias}}/constants.ts' },
  { from: 'src/Plugin/index.tts', to: 'src/{{alias}}/index.ts' },
  { from: 'src/Plugin/IPlugin.tts', to: 'src/{{alias}}/I{{alias}}.ts' },
  { from: 'typings/declarations.d.tts', to: 'src/typings/declarations.d.ts' },
];

getInput([
  'Enter package name:',
  'Enter package alias [{{$0}}]:',
]).then((data: string[]) => {
  const [name, setAlias] = data;
  if (!name) return Promise.reject(new Error(INCORRECT_NAME_ERROR));
  const alias = setAlias || name;
  const aliasPath = `packages/${name}/src/${alias}`;
  const rootDirPath = path.join(PACKAGES_PATH, name);
  return mkDir(rootDirPath)
    .then(() => appendText(
      TS_ROOT_CONFIG_PATH,
      `\n      "@${alias}/*": ["packages/${name}/src/${alias}/*"],`,
      '"paths": {',
    )).then(() => appendText(
      WEBPACK_RESOLVE_PATH,
      `\n      '@${alias}': path.resolve(__dirname, '${aliasPath}'),`,
      'alias: {',
    )).then(() => {
      const namePattern = new RegExp(`\{\{name}}`, 'g');
      const aliasPattern = new RegExp(`\{\{alias}}`, 'g');
      const params = {
        encoding: 'utf-8',
        preProcessor: (str: string): string => str.replace(namePattern, name)
          .replace(aliasPattern, alias),
      };
      return copyPack(COPY_LIST.map((
        item: string | { from: string; to: string },
      ): {
        from: string;
        to: string;
        params: { preProcessor: (data: string) => string, encoding: string };
      } => {
        const paths = typeof item === 'string'
          ? { from: path.join(TEMPLATE_FILES_PATH, item), to: path.join(rootDirPath, item) }
          : {
            from: path.join(TEMPLATE_FILES_PATH, item.from),
            to: path.join(rootDirPath, item.to.replace(aliasPattern, alias)),
          };
        return { params, ...paths };
      }));
    });
}).then(() => process.exit(0)).catch((err: Error) => {
  console.error(err.message);
  process.exit(0);
});
