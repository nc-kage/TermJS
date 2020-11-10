import css from './index.scss';

import { isString } from 'lodash-es';

import TemplateEngine from '@Term/TemplateEngine';
import IInput from '@Term/Line/Input/IInput';
import {
  FormattedValueFragmentType,
  FormattedValueType,
  ValueFragmentType,
  ValueType,
} from '@Term/types';
import { NON_BREAKING_SPACE } from '@Term/constants/strings';
import { clearStringStyles, getStartIntersectionString } from '@Term/utils/string';
import {
  DATA_INDEX_ATTRIBUTE_NAME, SECRET_CHARACTER,
} from '@Term/Line/Input/constants';
import { escapeString } from '@general/utils/string';
import { checkElementFocus } from '@Term/utils/viewport';

abstract class BaseInput extends TemplateEngine implements IInput {
  public static getValueString(value: ValueType, params: { secret?: boolean } = {}): string {
    const { secret = false } = params;
    return isString(value)
      ? secret ? BaseInput.convertSecret(value) : value
      : value.reduce((acc: string, item: ValueFragmentType): string => {
        const str = isString(item) ? item : item.str;
        const val = secret && (isString(item) || !item.lock)
          ? BaseInput.convertSecret(str) : str;
        return `${acc}${val}`;
      }, '');
  }

  protected static getFragmentTemplate(
    str: string,
    params: { className?: string; index: number; secret?: boolean },
  ): string {
    const { className = '', secret = false, index } = params;
    const composedClassName = [secret ? css.secret : '', className].join(' ');
    const processedString = BaseInput.getNormalizedTemplateString(secret
      ? BaseInput.convertSecret(str) : str);
    return `<span
      ${DATA_INDEX_ATTRIBUTE_NAME}="${index}"
      ref="fragment-${index}"
      class="${composedClassName}">${processedString}</span>`;
  }

  protected static getNormalizedTemplateString(str: string): string {
    return escapeString(str).replace(/\s/g, NON_BREAKING_SPACE);
  }

  protected static getValueFragmentTemplate(
    valueFragment: ValueFragmentType, index: number, params: { secret?: boolean } = {},
  ): string {
    const { secret } = params;
    if (isString(valueFragment)) {
      return BaseInput.getFragmentTemplate(valueFragment, { index, secret });
    }
    const { str, className = '', lock } = valueFragment;
    const isSecret = !lock && secret;
    return BaseInput.getFragmentTemplate(str, { className, index, secret: isSecret });
  }

  protected static getValueTemplate(value: ValueType, params: { secret?: boolean } = {}): string {
    if (isString(value)) return BaseInput.getNormalizedTemplateString(value);
    return value.reduce((acc: string, item: ValueFragmentType, index: number): string => {
      return `${acc}${BaseInput.getValueFragmentTemplate(item, index, params)}`;
    }, '');
  }

  protected static getUpdatedValueField(value: string, prevValue: ValueType): ValueType {
    if (isString(prevValue)) return value;
    let checkValue = clearStringStyles(value);
    let stop = false;
    const updatedValueField = prevValue.reduce((
      acc: FormattedValueType, item: ValueFragmentType,
    ): FormattedValueType => {
      const isStringItem = isString(item);
      const itemStr = (isStringItem ? item : (item as FormattedValueFragmentType).str) as string;
      const { str, isFull } = getStartIntersectionString(itemStr, checkValue);
      if (str && !stop) {
        acc.push(isStringItem ? str : { ...(item as FormattedValueFragmentType), str });
        checkValue = checkValue.substring(str.length);
        stop = !isFull;
      }
      return acc;
    }, [] as FormattedValueType);
    checkValue.replace(/<span[^>]*>/g, '')
      .split('')
      .forEach(char => updatedValueField.push(char));
    return updatedValueField.filter(item => isString(item) ? item : item.str);
  }

  protected static getLockString(value: ValueType): string {
    if (isString(value)) return '';
    let str = '';
    let lockStr = '';
    value.forEach((item: ValueFragmentType) => {
      if (isString(item)) {
        str += item;
      } else {
        str += item.str;
        if (item.lock) lockStr = str;
      }
    });
    return lockStr;
  }

  private static convertSecret(str: string): string {
    return (new Array(str.length)).fill(SECRET_CHARACTER).join('');
  }

  protected characterWidth: number = 8;
  protected characterHeight: number = 16;
  public get characterSize(): { width: number; height: number } {
    const { characterContainer } = this;
    return characterContainer
      ? { width: characterContainer.offsetWidth, height: characterContainer.offsetHeight }
      : { width: this.characterWidth, height: this.characterHeight };
  }

  public get caretPosition(): number {
    return -1;
  }
  public get selectedRange(): { from: number; to: number } {
    return { from: 0, to: 0 };
  }

  public get disabled(): boolean {
    return true;
  }

  protected valueField: ValueType = '';
  public get value(): ValueType {
    return this.valueField;
  }
  public set value(val: ValueType) {
    this.valueField = val;
  }

  public get lockString(): string {
    const { valueField } = this;
    return BaseInput.getLockString(valueField);
  }

  protected isCaretHidden: boolean = false;
  public get hiddenCaret(): boolean {
    return this.isCaretHidden;
  }
  public set hiddenCaret(isCaretHidden: boolean) {
    this.isCaretHidden = isCaretHidden;
  }

  protected secretField: boolean = false;
  public get secret(): boolean {
    return this.secretField;
  }
  public set secret(secret: boolean) {
    this.secretField = secret;
  }

  public get isFocused(): boolean {
    const editElement = this.getEditElement();
    if (!editElement) return false;
    return checkElementFocus(editElement as HTMLElement);
  }

  private characterContainer?: HTMLElement;

  protected constructor(
    template: string, container?: Element, cssData?: { [key: string]: string },
  ) {
    super(template, container);
    this.render({ css: cssData });
    this.setCharacterContainer();
    this.addHandlers();
  }

  protected addHandlers() {
    const editElement = this.getEditElement();
    if (editElement) {
      editElement.addEventListener('click', this.clickHandler);
      editElement.addEventListener('mousedown', this.mouseDownHandler);
    }
  }

  protected removeHandlers() {
    const editElement = this.getEditElement();
    if (editElement) {
      editElement.removeEventListener('click', this.clickHandler);
      editElement.removeEventListener('mousedown', this.mouseDownHandler);
    }
  }

  protected mouseDownHandler = (e: Event) => {
    const valueFieldItem = this.getEventFormattedValueFragment(e);
    if (valueFieldItem && valueFieldItem.clickHandler && valueFieldItem.lock) {
      e.preventDefault();
    }
  }

  protected clickHandler = (e: Event) => {
    const valueFieldItem = this.getEventFormattedValueFragment(e);
    if (valueFieldItem && valueFieldItem.clickHandler) {
      valueFieldItem.clickHandler(e, valueFieldItem.id);
    }
  }

  protected getValueItemString(index: number): string {
    const { valueField } = this;
    if (isString(valueField)) return index ? '' : valueField;
    const item = valueField[index];
    if (!item) return '';
    return isString(item) ? item : item.str;
  }

  protected abstract getRootElement(): Element | undefined;
  protected abstract getEditElement(): Element | undefined;

  public getSimpleValue(showSecret: boolean = true): string {
    const { secretField } = this;
    return BaseInput.getValueString(this.valueField, { secret: secretField && !showSecret });
  }

  public abstract moveCaretToEnd(isForce?: boolean): void;

  public addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) {
    const editElement = this.getEditElement() as HTMLElement;
    if (editElement) editElement.addEventListener(type, listener, options);
  }

  public removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ) {
    const editElement = this.getEditElement() as HTMLElement;
    if (editElement) editElement.removeEventListener(type, listener, options);
  }

  public focus() {
    const editElement = this.getEditElement() as HTMLElement;
    if (editElement) editElement.focus();
  }

  public blur() {
    const editElement = this.getEditElement() as HTMLElement;
    if (editElement) editElement.blur();
  }

  public destroy() {
    this.removeHandlers();
    super.destroy();
  }

  public getCaretOffset(): { left: number; top: number } {
    const { caretPosition, characterSize } = this;
    const rowCharactersCount = this.getRowCharactersCount();
    if (!rowCharactersCount) return { left: 0, top: 0 };
    const row = Math.floor(caretPosition / rowCharactersCount);
    const relativePosition = caretPosition - row * rowCharactersCount;
    return {
      left: relativePosition * characterSize.width,
      top: row * characterSize.height,
    };
  }

  public getEndOffset(): { left: number; top: number } {
    const { characterSize, valueField } = this;
    const rowCharactersCount = this.getRowCharactersCount();
    if (!rowCharactersCount) return { left: 0, top: 0 };
    const charactersCount = BaseInput.getValueString(valueField).length;
    const row = Math.floor(charactersCount / rowCharactersCount);
    const relativePosition = charactersCount - row * rowCharactersCount;
    return {
      left: relativePosition * characterSize.width,
      top: row * characterSize.height,
    };
  }

  private getRowCharactersCount(): number {
    const { characterSize } = this;
    const root = this.getRootElement();
    return root ? Math.floor((root as HTMLElement).offsetWidth / characterSize.width) : 0;
  }

  private getEventFormattedValueFragment(e: Event): FormattedValueFragmentType | null {
    const target = e.target as Element;
    if (!target) return null;
    return this.getElementFormattedValueFragment(target);
  }

  private getElementFormattedValueFragment(element: Element): FormattedValueFragmentType | null {
    const { valueField } = this;
    if (isString(valueField)) return null;
    const dataIndex = element.getAttribute(DATA_INDEX_ATTRIBUTE_NAME);
    const valueFieldItem = dataIndex ? valueField[Number(dataIndex)] : null;
    return !valueFieldItem || isString(valueFieldItem)
      ? null : valueFieldItem as FormattedValueFragmentType;
  }

  private setCharacterContainer() {
    const root = this.getRef('root');
    if (root) {
      const characterContainer = document.createElement('span');
      characterContainer.style.position = 'absolute';
      characterContainer.style.visibility = 'hidden';
      characterContainer.style.pointerEvents = 'none';
      characterContainer.style.left = '0';
      characterContainer.style.top = '0';
      characterContainer.innerHTML = NON_BREAKING_SPACE;
      (root as HTMLElement).appendChild(characterContainer);
      this.characterContainer = characterContainer;
    }
  }
}

export default BaseInput;
