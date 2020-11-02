import { isArray, isString, noop, get } from 'lodash-es';

import css from './index.scss';
import lineTemplate from './template.html';

import { DOWN_CODE, ENTER_CODE, LEFT_CODE, RIGHT_CODE, UP_CODE } from '@Term/constants/keyCodes';
import { getKeyCode } from '@general/utils/event';
import ICaret from '@Term/BaseCaret/ICaret';
import ICaretFactory from '@Term/CaretFactory/ICaretFactory';
import CaretFactory from '@Term/CaretFactory';
import { LOCK_TIMEOUT } from '@Term/Line/constants';
import { ValueType } from '@Term/types';
import TemplateEngine from '../TemplateEngine';
import ILine from './ILine';
import { ContentEditableInput, ViewableInput } from './Input';
import { NON_BREAKING_SPACE } from '../constants/strings';
import IInput from '@Term/Line/Input/IInput';
import { ParamsType } from '@Term/Line/types';
import BaseInput from '@Term/Line/Input/BaseInput';
import ILabel from '@Term/Line/Label/ILabel';
import Label from '@Term/Line/Label';

class Line extends TemplateEngine implements ILine {
  public static getHeight(
    params: {
      delimiter?: string;
      label?: string;
      value: ValueType;
      width: number;
      itemSize: { width: number; height: number },
    },
  ): number {
    const { delimiter, label, value, width, itemSize } = params;
    const { width: itemWidth, height: itemHeight } = itemSize;
    const valueString = BaseInput.getValueString(value);
    const labelLength = (delimiter ? delimiter.length + 1 : 0)
      + (label ? label.length + 1 : 0);
    const rowItemsCount = Math
      .floor((width - Line.itemHorizontalPadding - labelLength * itemWidth) / itemWidth);
    return Math.ceil((valueString.length || 1) / rowItemsCount) * itemHeight
      + 2 * Line.itemVerticalPadding;
  }

  private static cf: ICaretFactory = CaretFactory.getInstance();
  private static itemVerticalPadding: number = 4;
  private static itemHorizontalPadding: number = 16;

  public label?: ILabel;

  public get value(): ValueType {
    const { inputField } = this;
    return inputField ? inputField.value : '';
  }

  public set value(val: ValueType) {
    const { inputField } = this;
    if (inputField) {
      inputField.value = val;
      inputField.moveCaretToEnd();
    }
  }

  public get disabled(): boolean {
    const { input, editable } = this;
    return editable && input ? input.disabled : true;
  }
  public set disabled(value: boolean) {
    const { input, editable } = this;
    if (input && editable) input.disabled = value;
  }

  private isVisible: boolean = true;
  public get visible(): boolean {
    return this.isVisible;
  }
  public set visible(value: boolean) {
    const root = this.getRef('root');
    if (this.isVisible === value || !root) return;
    this.isVisible = value;
    if (value) {
      root.classList.add(css.visible);
    } else {
      root.classList.remove(css.visible);
    }
  }

  public get hidden(): boolean {
    return this.isHidden;
  }

  private heightField: number = 0;
  public get height(): number {
    return this.heightField;
  }

  private get characterSize(): { width: number; height: number } {
    const { offsetWidth, offsetHeight } = this.getRef('helpContainer') as HTMLElement;
    return { width: offsetWidth, height: offsetHeight };
  }

  private inputField?: IInput;
  public get input(): IInput | undefined {
    return this.inputField;
  }

  private secretField: boolean = false;
  public get secret(): boolean {
    return this.secretField;
  }

  public set secret(secret: boolean) {
    const { inputField } = this;
    this.secretField = secret;
    if (inputField) inputField.secret = secret;
  }

  public get caretOffset(): { left: number; top: number } {
    const { input } = this;
    return this.getInputRootOffset(input ? input.getCaretOffset() : { left: 0, top: 0 });
  }

  public get endOffset(): { left: number; top: number } {
    const { input } = this;
    return this.getInputRootOffset(input ? input.getEndOffset() : { left: 0, top: 0 });
  }

  private get labelWidth(): number {
    const { label, characterSize: { width } } = this;
    return label
      ? ((label.params.label?.length || -1) + (label.params.delimiter?.length || -1) + 2) * width
      : 0;
  }
  private get contentPadding(): { left: number; top: number } {
    const content = this.getRef('content');
    if (!content) return { left: 0, top: 0 };
    const styles = window.getComputedStyle(content);
    return {
      left: Number(styles.paddingLeft.replace('px', '')),
      top: Number(styles.paddingTop.replace('px', '')),
    };
  }
  private initialValue: ValueType = '';
  private caret?: ICaret;
  private className: string = '';
  private editable: boolean = false;
  private onSubmit: (params: {
    value: string; formattedValue: ValueType; lockString: string;
  }) => void = noop;
  private onChange: (value: string) => void = noop;
  private onUpdateCaretPosition: (caretPosition: number, caret?: ICaret) => void = noop;
  private lockTimeout?: ReturnType<typeof setTimeout>;
  private caretPosition?: number = -1;

  constructor(container: Element, params: ParamsType = {}) {
    super(lineTemplate, container);
    this.setParams(params);
    this.container = container;
    this.render({ label: params.label, delimiter: params.delimiter });
    this.setCaret(params.caret || 'simple');
    this.addEventListeners();
    this.updateHeight();
    this.frameHandler = this.updateCaretData;
    this.setupEditing();
  }

  public stopEdit() {
    const { label } = this;
    const labelParams = label ? label.params : { label: '', delimiter: '' };
    this.removeCaret();
    this.removeEventListeners();
    this.editable = false;
    this.unregisterFrameHandler();
    this.render(labelParams);
  }

  public focus() {
    const { inputField } = this;
    if (!inputField) return;
    const { isFocused } = inputField;
    if (!isFocused) {
      inputField.focus();
      inputField.moveCaretToEnd();
    }
  }

  public blur() {
    const { inputField } = this;
    if (!inputField) return;
    const { isFocused } = inputField;
    if (isFocused) inputField.blur();
  }

  public submit() {
    this.submitHandler();
  }

  public render(params: { label?: string, delimiter?: string }) {
    const { editable, className, secret } = this;
    const reRender = Boolean(this.getRef('root'));
    if (this.inputField) {
      this.initialValue = this.inputField.value;
      this.inputField.destroy();
    }
    if (this.label) this.label.destroy();
    super.render({
      css, editable, className, nbs: NON_BREAKING_SPACE,
    }, reRender ? { replace: this } : {});
    this.inputField = editable
      ? new ContentEditableInput(this.getRef('inputContainer') as HTMLElement)
      : new ViewableInput(this.getRef('inputContainer') as HTMLElement);
    this.label = new Label(this.getRef('labelContainer') as Element, params);
    this.inputField.value = this.initialValue;
    this.inputField.secret = secret;
  }

  public setCaret(name: string = 'simple') {
    const { inputField, editable } = this;
    this.removeCaret();
    const caret = Line.cf.create(name, this.getRef('inputContainer') as Element);
    if (!inputField) return;
    if (caret && editable) {
      inputField.hiddenCaret = true;
    } else {
      inputField.hiddenCaret = false;
      return;
    }
    this.caret = caret;
    this.updateCaretData();
  }

  public updateViewport() {
    const { isHidden } = this;
    if (isHidden) this.show();
    this.updateInputSize();
    if (isHidden) this.hide();
  }

  public destroy() {
    super.destroy();
    const { lockTimeout } = this;
    if (lockTimeout) clearTimeout(lockTimeout);
    this.removeCaret();
    this.removeEventListeners();
  }

  public moveCaretToEnd(isForce: boolean = false) {
    const { inputField, editable } = this;
    if (inputField && editable) (inputField as ContentEditableInput).moveCaretToEnd(isForce);
  }

  public clear() {
    this.value = '';
  }

  private setParams(params: ParamsType) {
    const {
      onUpdateCaretPosition = noop, onChange = noop, onSubmit = noop, editable = true,
      className = '', value, secret = false,
    } = params;
    this.className = className;
    this.onSubmit = onSubmit;
    this.onChange = onChange;
    this.onUpdateCaretPosition = onUpdateCaretPosition;
    this.editable = editable;
    this.secret = secret;
    this.initialValue = value || '';
  }

  private addEventListeners() {
    const { editable, inputField } = this;
    if (editable && inputField) {
      inputField.addEventListener('keydown', this.keyDownHandler);
      inputField.addEventListener('change', this.changeHandler);
    }
  }

  private removeEventListeners() {
    const { editable, inputField } = this;
    if (editable && inputField) {
      inputField.removeEventListener('keydown', this.keyDownHandler);
      inputField.removeEventListener('change', this.changeHandler);
    }
  }

  private updateHeight = () => {
    const root = this.getRef('root') as HTMLInputElement;
    if (!root) return;
    this.heightField = root.offsetHeight;
  }

  private setupEditing() {
    if (this.editable && this.inputField) {
      this.registerFrameHandler();
      this.inputField.moveCaretToEnd(true);
    }
  }

  private keyDownHandler = (e: KeyboardEvent) => {
    (({
      [ENTER_CODE]: this.submitHandler,
      [LEFT_CODE]: this.lockCaret,
      [RIGHT_CODE]: this.lockCaret,
      [UP_CODE]: this.lockCaret,
      [DOWN_CODE]: this.lockCaret,
    } as { [code: number]: (e: KeyboardEvent) => void })[Number(getKeyCode(e))] || noop)(e);
  }

  private submitHandler = (e?: Event) => {
    const { onSubmit, inputField, secret } = this;
    const value = inputField?.value || '';
    let formattedValue: ValueType = '';
    if (isString(value)) {
      formattedValue = secret ? '' : value;
    } else if (isArray(value)) {
      formattedValue = secret ? value.filter(item => get(item, 'lock')) : value;
    }
    e?.preventDefault();
    if (inputField && onSubmit) {
      onSubmit({
        formattedValue,
        value: inputField.getSimpleValue(),
        lockString: inputField.lockString,
      });
    }
  }

  private changeHandler = () => {
    const { inputField } = this;
    if (inputField) {
      this.updateInputSize();
      this.lockCaret();
      this.onChange(inputField.getSimpleValue());
    }
  }

  private updateInputSize = () => {
    const { width } = this.characterSize;
    const inputContainer = this.getRef('inputContainer');
    const input = this.getRef('input') as HTMLInputElement;
    const { offsetWidth } = inputContainer as HTMLElement;
    if (!input) return this.updateRowsCount(2);
    const value = this.editable ? input.value : input.innerHTML;
    if (!width || !value || !offsetWidth) return this.updateRowsCount(2);
    const rowLength = Math.floor(offsetWidth / width);
    this.updateRowsCount(Math.ceil(value.length / rowLength) + 1);
  }

  private updateRowsCount(count: number) {
    const input = this.getRef('input') as HTMLInputElement;
    if (this.editable && input && Number(input.getAttribute('rows')) !== count) {
      input.setAttribute('rows', String(count));
    }
    this.updateHeight();
  }

  private updateCaretData = () => {
    const {
      editable, caret, inputField, onUpdateCaretPosition, caretPosition: caretPositionPrev,
    } = this;
    if (!editable || !inputField || !caret) {
      if (caretPositionPrev !== -1) {
        this.caretPosition = -1;
        onUpdateCaretPosition(this.caretPosition, this.caret);
      }
      return;
    }
    const { caretPosition } = inputField;
    if (inputField.isFocused && caretPosition >= 0) {
      this.showCaret(caretPosition);
    } else {
      this.hideCaret();
    }
    if (caretPositionPrev !== caretPosition) {
      this.caretPosition = caretPosition;
      onUpdateCaretPosition(this.caretPosition, this.caret);
    }
  }

  private showCaret(caretPosition: number) {
    const { caret, inputField } = this;
    const { width, height } = this.characterSize;
    const inputContainer = this.getRef('inputContainer');
    if (!caret || !inputContainer || !inputField) return;
    const { offsetWidth } = inputContainer as HTMLElement;
    const value = inputField.getSimpleValue(false);
    const rowLength = Math.floor(offsetWidth / width);
    const row = Math.floor(caretPosition / rowLength);
    caret.hidden = false;
    const character = value[caretPosition] === ' '
      ? NON_BREAKING_SPACE : value[caretPosition] || NON_BREAKING_SPACE;
    const top = Math.round(height * row);
    const left = Math.round((caretPosition - row * rowLength) * width);
    caret.setPosition(left, top);
    caret.setValue(character);
  }

  private hideCaret() {
    const { caret } = this;
    if (!caret) return;
    caret.hidden = true;
  }

  private removeCaret() {
    const { caret } = this;
    if (!caret) return;
    this.caret = undefined;
    caret.destroy();
  }

  private lockCaret = () => {
    const { caret, lockTimeout } = this;
    if (lockTimeout) clearTimeout(lockTimeout);
    if (!caret) return;
    caret.lock = true;
    this.lockTimeout = setTimeout(() => caret.lock = false, LOCK_TIMEOUT);
  }

  private getInputRootOffset(offset: { left: number; top: number }): { left: number; top: number } {
    const { label, input, labelWidth, contentPadding: { top: pt, left: pl } } = this;
    if (!input && !label) return { left: pl, top: pt };
    return input
      ? { left: offset.left + labelWidth + pl, top: offset.top + pt }
      : { left: labelWidth + pl, top: pt };
  }
}

export default Line;