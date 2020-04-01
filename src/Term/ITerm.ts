import ITermEventMap from './ITermEventMap';
import IKeyboardShortcutsManager from '@Term/KeyboardShortcutsManager/IKeyboardShortcutsManager';
import IPluginManager from '@Term/PluginManager/IPluginManager';

export default interface ITerm {
  keyboardShortcutsManager: IKeyboardShortcutsManager;
  pluginManager: IPluginManager;
  write(data: string | string [], duration?: number): void;
  setCaret(caret: string): void;
  addEventListener<K extends keyof ITermEventMap>(
    type: K,
    handler: (e: ITermEventMap[K]) => void,
    options?: EventListenerOptions,
  ): void;
  removeEventListener<K extends keyof ITermEventMap>(
    type: K,
    handler: (e: ITermEventMap[K]) => void,
    options?: EventListenerOptions,
  ): void;
  destroy(): void;
  setLabel(params?: { label?: string; delimiter?: string }): void;
}
