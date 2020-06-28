import { Term, ITerm } from '@term-js/term';
import '@term-js/term/dist/index.css';

import ReactTerm from '@ReactTerm/index';
import IReactTerm from '@ReactTerm/IReactTerm';

import './index.scss';

const container = document.querySelector('#root');
if (container) {
  const plugin: IReactTerm = new ReactTerm();
  const term = new Term(container, {
    virtualizedTopOffset: 400,
    virtualizedBottomOffset: 400,
    label: 'guest',
    editLine: '',
    lines: [],
  });
  term.setHeader('react-term');
  term.pluginManager.register(plugin);
  (window as unknown as { term: ITerm }).term = term;
  (window as unknown as { plugin: IReactTerm }).plugin = plugin;
}
