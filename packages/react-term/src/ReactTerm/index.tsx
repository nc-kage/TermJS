import React, { Component, createRef, RefObject } from 'react';
import { Term, ITerm, ValueType } from '@term-js/term';
import '@term-js/term/dist/index.css';

export { ValueType } from '@term-js/term';

interface IReactTermProps {
  /**
   * Root element class name
   */
  className?: string;

  /**
   * Zone in pixels which would be pre-rendered by VirtualizedList.
   */
  virtualizedOffset?: { top?: number; bottom?: number };

  /**
   * Label for each line.
   */
  label?: string;

  /**
   * Delimiter between label and line text.
   * @default ~
   */
  delimiter?: string;

  /**
   * Terminal title
   */
  title?: string;

  /**
   * Simple input string initial value or initial input value with general params
   * or initial input value parts.
   * @default ''
   * @type {String|Object|Array.<String|Object>}
   * @property {String|Array.<String|Object>} value.value Input value or input value parts.
   * @property {Boolean} [value.secret] Hides user input
   * @property {String|Object} value[] Simple string part or formatted part.
   * @property {String} value[].str String value of the input value formatted part.
   * @property {String|Number} [value[].id] Formatted part uniq identifier
   * @property {Boolean} [value[].lock] Shows that current formatted part is locked
   * and cannot be cleared
   * @property {String} [value[].className] Formatted part class name. Useful for styling.
   * @property {Function} [value[].clickHandler] Formatted part click handler.
   */
  initialValue?: ValueType | { value: ValueType; secret?: boolean };

  /**
   * Pre-rendered lines.
   * @default []
   * @type {Array.<String|Object>}
   * @property {String} lines[] Simple string line.
   * @property {Array.<Object>} lines[] Line parts.
   * @property {String|Object} lines[][] Simple line part or formatted line part.
   * @property {String|Number} lines[][].id Formatted part uniq identifier
   * @property {Boolean} [lines[][].lock] Shows that current formatted part is locked
   * and cannot be cleared
   * @property {String} [lines[][].className] Formatted part class name. Useful for styling.
   * @property {Function} [lines[][].clickHandler] Formatted part click handler.
   */
  initialLines?: ValueType[];

  /**
   * Input submit handler.
   * @param {String} line New line value.
   * @param {String[]} lines All lines.
   */
  onSubmit?: (line: string, lines?: string[]) => void;

  /**
   * Input value change handler.
   * @param {String} line Input value.
   */
  onChange?: (line: string) => void;
}

class ReactTerm extends Component<IReactTermProps> {
  private readonly root: RefObject<HTMLDivElement>;
  private term?: ITerm;

  constructor(props: IReactTermProps) {
    super(props);
    this.root = createRef<HTMLDivElement>();
  }

  public componentDidMount() {
    const {
      delimiter, virtualizedOffset = {}, label = '', title = '', initialLines = [], onSubmit,
      initialValue = '', onChange,
    } = this.props;
    const { current: rootContainer } = this.root;
    this.term = new Term(rootContainer as HTMLElement, {
      onSubmit,
      onChange,
      label,
      delimiter,
      lines: initialLines,
      header: title,
      editLine: initialValue,
      virtualizedTopOffset: virtualizedOffset.top || 0,
      virtualizedBottomOffset: virtualizedOffset.bottom || 0,
    });
  }

  public componentDidUpdate() {
    this.updateTitle();
    this.updateLabel();
  }

  public componentWillUnmount() {
    const { term } = this;
    if (term) term.destroy();
  }

  public render() {
    const { className } = this.props;
    return <div ref={this.root} className={className} />;
  }

  private updateTitle() {
    const { term } = this;
    const { title = '' } = this.props;
    if (term && term.header !== title) (term as Term).setHeader(title);
  }

  private updateLabel() {
    const { term } = this;
    const { label, delimiter } = this.props;
    if (term) term.setLabel({ label, delimiter });
  }
}

export default ReactTerm;
