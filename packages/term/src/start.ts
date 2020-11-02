import Term from '@Term/index';
import ITerm from '@Term/ITerm';
import { ValueType } from '@Term/types';

import './index.scss';

const container = document.querySelector('.content');
if (container) {
  const term = new Term(container, {
    onChange: console.log,
    header: 'Test',
    virtualizedTopOffset: 400,
    virtualizedBottomOffset: 400,
    label: 'guest',
    editLine: { secret: true, value: [{ str: 'Password: ', lock: true }] },
    lines: (new Array(1).fill(null)).map((
      _, index,
    ): ValueType => ([
      { str: 'User name: ' },
      `test ${index} `,
      (new Array(40).fill(null)).map((): string => 's').join(''),
    ])),
  });
  (window as unknown as { term: ITerm }).term = term;
}
