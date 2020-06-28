import { CSS_MODULES_BLACK_LIST } from './rollup.const';
import configGenerator from '../../rollup.config';
import pkg from './package.json';

export default configGenerator({ pkg, cssBlackList: CSS_MODULES_BLACK_LIST });
