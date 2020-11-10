import { isString } from 'lodash-es';

import BaseInput from '@Term/Line/Input/BaseInput';
import IInput from '@Term/Line/Input/IInput';
import template from './template.html';
import {
  getContentEditableCaretPosition,
  moveContentEditableCaretToEnd,
  setContentEditableCaretPosition,
} from '@Term/utils/viewport';
import { CHANGE_EVENT_TYPE } from '../constants';
import { ValueFragmentType, ValueType } from '@Term/types';
import { getValueHtmlInfo } from './utils';
import { getKeyCode } from '@general/utils/event';
import { U_KEY_CODE, I_KEY_CODE, B_KEY_CODE } from '@general/constants/keyCodes';
import { TEXT_NODE_TYPE } from '@Term/Line/Input/ContentEditableInput/constants';

import css from './index.scss';

const CONTROL_KEY_CODES = [
  U_KEY_CODE, I_KEY_CODE, B_KEY_CODE,
];

class ContentEditableInput extends BaseInput implements IInput {
  private externalChangeListeners: (
    (this: HTMLElement, ev: HTMLElementEventMap['change']) => any
  )[] = [];

  private lockLengthLength: number = -1;
  private get lockLength(): number {
    let { lockLengthLength } = this;
    if (lockLengthLength >= 0) return lockLengthLength;
    const { valueField } = this;
    if (isString(valueField)) {
      lockLengthLength = 0;
    } else {
      let temp = 0;
      lockLengthLength = valueField.reduce((acc, item: ValueFragmentType): number => {
        if (isString(item)) {
          temp += item.length;
          return acc;
        }
        temp += item.str.length;
        if (item.lock) {
          // tslint:disable-next-line:no-parameter-reassignment
          acc += temp;
          temp = 0;
        }
        return acc;
      }, 0);
    }
    return lockLengthLength;
  }

  public get caretPosition(): number {
    const editPart = this.getRef('edit-part');
    const { lockLength } = this;
    if (!editPart) return -1;
    const position = getContentEditableCaretPosition(editPart as HTMLElement);
    return position >= 0 ? lockLength + position : position;
  }

  public set caretPosition(position: number) {
    const editPart = this.getRef('edit-part');
    if (position < 0 || !editPart) return;
    setContentEditableCaretPosition(editPart as HTMLElement, position);
  }

  private isDisabled: boolean = false;
  public get disabled(): boolean {
    return this.isDisabled;
  }
  public set disabled(value: boolean) {
    this.isDisabled = value;
  }

  public set hiddenCaret(isCaretHidden: boolean) {
    const input = this.getRef('input');
    if (this.isCaretHidden === isCaretHidden || !input) return;
    if (isCaretHidden) {
      (input as HTMLElement).classList.add(css.hiddenCaret);
    } else {
      (input as HTMLElement).classList.remove(css.hiddenCaret);
    }
    this.isCaretHidden = isCaretHidden;
  }

  public set value(val: ValueType) {
    this.valueField = val;
    this.updateContent();
  }

  public set secret(secret: boolean) {
    this.secretField = secret;
    this.updateContent();
  }

  constructor(container?: Element) {
    super(template, container, css);
    const root = this.getRootElement() as HTMLElement;
    const editElement = this.getEditElement() as HTMLElement;
    this.addEventListener('input', this.changeHandler);
    this.addEventListener('cut', this.changeHandler);
    this.addEventListener('paste', this.pasteHandler);
    this.addEventListener('keydown', this.keydownHandler);
    if (root) root.addEventListener('click', this.rootClickHandler);
    if (editElement) editElement.removeEventListener('click', this.editClickHandler);
  }

  public moveCaretToEnd(isForce: boolean = false) {
    const editPart = this.getRef('edit-part');
    if (!editPart) return;
    moveContentEditableCaretToEnd(editPart as HTMLElement, isForce);
  }

  public addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === CHANGE_EVENT_TYPE) {
      this.externalChangeListeners.push(
        listener as (this: HTMLElement, ev: HTMLElementEventMap['change']) => any,
      );
    } else {
      super.addEventListener(type, listener, options);
    }
  }

  public removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ) {
    if (type === CHANGE_EVENT_TYPE) {
      this.externalChangeListeners = this.externalChangeListeners.filter((
        item,
      ): boolean => item !== listener);
    } else {
      super.removeEventListener(type, listener, options);
    }
  }

  public destroy() {
    const root = this.getRootElement() as HTMLElement;
    const editElement = this.getEditElement() as HTMLElement;
    this.removeEventListener('input', this.changeHandler);
    this.removeEventListener('cut', this.changeHandler);
    this.removeEventListener('paste', this.pasteHandler);
    this.removeEventListener('keydown', this.keydownHandler);
    if (root) root.removeEventListener('click', this.rootClickHandler);
    if (editElement) editElement.removeEventListener('click', this.editClickHandler);
    super.destroy();
  }

  protected getEditElement(): Element | undefined {
    return this.getRef('edit-part');
  }

  protected getRootElement(): Element | undefined {
    return this.getRef('input');
  }

  private updateContent() {
    this.setString();
    this.updateStyles();
  }

  private setString() {
    const { secretField } = this;
    const editPart = this.getRef('edit-part') as HTMLElement;
    const lockPart = this.getRef('lock-part') as HTMLElement;
    if (editPart && lockPart) {
      const { edit, lock } = getValueHtmlInfo(this.valueField, { secret: secretField });
      editPart.innerHTML = edit;
      lockPart.innerHTML = lock;
    }
  }

  private updateStyles() {
    const editElement = this.getEditElement() as HTMLElement;
    if (editElement) {
      Array.prototype.forEach.call(
        editElement.childNodes, (childNode: HTMLElement, index: number) => {
          if (childNode.nodeType !== TEXT_NODE_TYPE) {
            const { color } = window.getComputedStyle(childNode);
            if (color) (editElement.childNodes[index] as HTMLElement).style.textShadow = `0 0 0 ${color}`;
          }
        },
      );
    }
  }

  private pasteHandler = (e: ClipboardEvent) => {

  }

  private keydownHandler = (e: KeyboardEvent) => {
    const keyCode = getKeyCode(e) || -1;
    if (CONTROL_KEY_CODES.includes(keyCode) && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
    }
  }

  private rootClickHandler = (e: Event) => {
    this.moveCaretToEnd(true);
  }

  private editClickHandler = (e: Event) => {
    e.stopPropagation();
  }

  private changeHandler = (e: Event) => {
    this.updateValue();
    if (this.secret) this.hideSecretCharacters();
    this.externalChangeListeners
      .forEach(handler => handler.call(this.getRootElement() as HTMLElement, e));
  }

  private updateValue() {

  }

  private hideSecretCharacters() {

  }
}

export default ContentEditableInput;
