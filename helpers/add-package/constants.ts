import * as path from 'path';

export const PACKAGES_PATH = path.join(__dirname, '../../packages');
export const TEMPLATE_FILES_PATH = path.join(__dirname, 'template-files');
export const WEBPACK_RESOLVE_PATH = path.join(__dirname, '../../webpack.resolve.js');
export const TS_ROOT_CONFIG_PATH = path.join(__dirname, '../../tsconfig.json');

export const EXISTS_ERROR = 'exists';
export const INCORRECT_NAME_ERROR = 'incorrect name';
export const NOT_FOUND_ERROR = 'not found';