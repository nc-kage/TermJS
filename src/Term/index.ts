import { noop, last, get } from 'lodash-es';
import ResizeObserver from 'resize-observer-polyfill';

import ITerm from './ITerm';
import ITermEventMap from './ITermEventMap';
import Line from './Line';
import ILine from './Line/ILine';

import TemplateEngine from '@Term/TemplateEngine';
import template from './template.html';

import css from './index.scss';
import './theme.scss';

class Term extends TemplateEngine implements ITerm {
  private lines: ILine[] = [];
  private readonly ro: ResizeObserver;
  private size: { width: number; height: number } = { width: 0, height: 0 };
  private caret?: string;

  constructor(container: Element, params: {
    lines: string[];
    header?: string;
    onSubmit?: (line: string, lines: string[]) => void;
    onChange?: (line: string) => void;
    caret?: string;
  } = { lines: [''] }) {
    super(template, container);
    this.size.width = (container as HTMLElement).offsetWidth;
    this.size.height = (container as HTMLElement).offsetHeight;
    this.ro = new ResizeObserver(this.observeHandler);
    this.ro.observe(container);
    this.caret = params.caret;
    this.render({ css, header: params.header });
    this.addLines(params.lines);
    this.addListeners();
  }

  public addEventListener<K extends keyof ITermEventMap>(
    type: K, handler: (e: ITermEventMap[K]) => void, options?: EventListenerOptions,
  ) {
    throw new Error('No implementation');
  }

  public removeEventListener<K extends keyof ITermEventMap>(
    type: K, handler: (e: ITermEventMap[K]) => void, options?: EventListenerOptions,
  ) {
    throw new Error('No implementation');
  }

  destroy() {
    this.lines.forEach((line) => {
      line.destroy();
    });
    this.removeListeners();
    super.destroy();
  }

  public write(data: string | string[], duration?: number) {
    throw new Error('No implementation');
  }

  public setCaret(caret: string) {
    this.caret = caret;
    const line = last(this.lines);
    if (!line) return;
    line.setCaret(caret);
  }

  public setHeader(text: string) {
    const header = this.getRef('header');
    const headerText = this.getRef('headerText') as Element;
    if (text) {
      headerText.innerHTML = text;
      header?.classList.remove(css.hidden);
    } else {
      header?.classList.add(css.hidden);
    }
  }

  private observeHandler = (entries: ResizeObserverEntry[]) => {
    const { size, lines } = this;
    const { width, height } = get(entries, '[0].contentRect');
    if (size.width !== width || size.height !== height) {
      size.width = width;
      size.height = height;
      lines.forEach((line: ILine) => {
        line.updateViewport();
      });
    }
  }

  private addListeners() {
    const root = this.getRef('root') as HTMLElement;
    if (!root) return;
    root.addEventListener('click', this.clickHandler);
  }

  private removeListeners() {
    const root = this.getRef('root') as HTMLElement;
    if (!root) return;
    root.removeEventListener('click', this.clickHandler);
  }

  protected addLines(lines: string[]) {
    const linesContainer = this.getRef('linesContainer') as Element;
    const lastLineIndex = lines.length - 1;
    this.lines = lines.map((lineValue: string, index: number): ILine => {
      return new Line(linesContainer, index === lastLineIndex ? {
        editable: true,
        onSubmit: this.submitHandler,
        onChange: this.changeHandler,
        caret: this.caret,
      } : {});
    });
  }

  private clickHandler = (e: MouseEvent) => {
    if (e.target === this.getRef('linesContainer')) {
      const lastLine = last(this.lines) as ILine;
      lastLine.focus();
    }
  }

  private submitHandler = (value: string) => {
    const { lines } = this;
    const linesContainer = this.getRef('linesContainer') as HTMLElement;
    last(lines)?.stopEdit();
    const newLine = new Line(linesContainer, {
      editable: true, onSubmit: this.submitHandler, onChange: this.changeHandler, caret: this.caret,
    });
    lines.push(newLine);
    this.scrollBottom();
    newLine.focus();
  }

  private changeHandler = (value: string) => {
    this.scrollBottom();
  }

  private scrollBottom() {
    const linesContainer = this.getRef('linesContainer') as HTMLElement;
    if (!linesContainer) return;
    linesContainer.scrollTop = linesContainer.scrollHeight + linesContainer.offsetHeight;
  }
}

export default Term;
