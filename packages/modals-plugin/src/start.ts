import { Term, ITerm } from '@term-js/term';
import '@term-js/term/dist/index.css';

import Modals from '@Modals/index';
import IModals from '@Modals/IModals';

import './index.scss';
import { TERMINAL_CENTER_POSITION, EDIT_CENTER_POSITION } from '@Modals/constants';

const container = document.querySelector('#root');
if (container) {
  const plugin: IModals = new Modals();
  const term = new Term(container, {
    virtualizedTopOffset: 400,
    virtualizedBottomOffset: 400,
    label: 'guest',
    editLine: '',
    lines: [],
  });
  term.setHeader('modals-plugin');
  term.pluginManager.register(plugin);
  plugin.show({
    overlayHide: true,
    content: 'Test',
    position: EDIT_CENTER_POSITION,
  });
  plugin.show({
    overlayHide: true,
    content: 'Test 2',
    position: TERMINAL_CENTER_POSITION,
    actions: [[
      { text: 'Submit', type: 'submit' },
      { text: 'Cancel' },
    ]],
  });
  (window as unknown as { term: ITerm }).term = term;
  (window as unknown as { plugin: IModals }).plugin = plugin;
}
