import './fonts.scss';
import './theme.scss';
import TemplateEngine from '@Term/TemplateEngine';
import { EditLineParamsType, FormattedValueFragmentType, TermConstructorParamsType } from '@Term/types';
import ITerm from './ITerm';
import ITermEventMap from './ITermEventMap';
import IKeyboardShortcutsManager from '@Term/KeyboardShortcutsManager/IKeyboardShortcutsManager';
import IPluginManager from '@Term/PluginManager/IPluginManager';
declare class Term extends TemplateEngine implements ITerm {
    private headerField;
    get header(): string;
    set header(val: string);
    private readonly ro;
    private readonly vl;
    readonly keyboardShortcutsManager: IKeyboardShortcutsManager;
    readonly pluginManager: IPluginManager;
    private history;
    private params;
    private isEditing;
    private writingInterval?;
    private submitTimeout?;
    private itemSize;
    private heightCache;
    private lines;
    private editLine?;
    private listeners;
    constructor(container: Element, params?: TermConstructorParamsType);
    addEventListener: <K extends "caretPosition" | "change" | "submit" | "action" | "focus" | "blur" | "keydown" | "keypress" | "keyup">(type: K, handler: (e: ITermEventMap[K]) => void, options?: EventListenerOptions | undefined) => void;
    removeEventListener: <K extends "caretPosition" | "change" | "submit" | "action" | "focus" | "blur" | "keydown" | "keypress" | "keyup">(type: K, handler: (e: ITermEventMap[K]) => void, options?: EventListenerOptions | undefined) => void;
    destroy(): void;
    setLabel: (params?: {
        label?: string | undefined;
        delimiter?: string | undefined;
    }) => void;
    write: (data: string | FormattedValueFragmentType, duration?: number | undefined) => boolean | Promise<boolean>;
    setCaret(caret: string): void;
    setHeader(text: string): void;
    blur(): void;
    private updateEditLine;
    private init;
    private preStart;
    private setParams;
    private characterUpdater;
    private itemGetter;
    private heightGetter;
    private observeHandler;
    private addListeners;
    private removeListeners;
    protected addEditLine(editLineParams: EditLineParamsType): void;
    private clickHandler;
    private lastLineFocus;
    private submitHandler;
    private changeHandler;
    private updateCaretPositionHandler;
    private clearHistoryState;
    private addKeyDownHandler;
    private removeKeyDownHandler;
    private lineKeydownHandler;
    private prevHistory;
    private nextHistory;
    private applyHistory;
    private addKeyboardShortcutsManagerListeners;
    private clearHandler;
    private actionHandler;
    private registerListener;
    private unregisterAllListeners;
    private unregisterListener;
    private setLines;
    private getTermInfo;
    private getTermInfoElements;
    private getTermInfoLabel;
    private getTermInfoCaret;
    private getTermInfoEdit;
    private getTermInfoLines;
    private updateTermInfo;
}
export default Term;
