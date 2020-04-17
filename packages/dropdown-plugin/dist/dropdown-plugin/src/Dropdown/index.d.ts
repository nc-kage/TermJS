import { Plugin, ITermInfo, IKeyboardShortcutsManager } from '@term-js/term';
import '@term-js/context-menu-plugin/dist/index.css';
import './theme.scss';
import IDropdown from '@Dropdown/IDropdown';
declare class Dropdown extends Plugin implements IDropdown {
    private itemsList;
    get items(): string[];
    set items(val: string[]);
    private highlightField;
    get highlight(): string;
    set highlight(val: string);
    private list?;
    private contextMenuPlugin?;
    private unlockCallback?;
    private isActive;
    private onSelect?;
    private onClose?;
    private readonly container;
    private append?;
    constructor(params?: {
        onSelect?: (text: string, index: number) => void;
        onClose?: () => void;
    });
    setTermInfo(termInfo: ITermInfo, keyboardShortcutsManager: IKeyboardShortcutsManager): void;
    updateTermInfo(termInfo: ITermInfo): void;
    clear(): void;
    destroy(): void;
    show(items?: string[], params?: {
        className?: string;
        append?: string | HTMLElement;
    }): void;
    hide(): void;
    private unregisterShortcut;
    private registerShortcut;
    private setContextMenuPlugin;
    private onNext;
    private onDown;
    private onUp;
    private onSubmit;
    private renderList;
    private renderAppend;
    private clearAppend;
    private selectHandler;
    private hideContextMenuHandler;
    private hideList;
}
export default Dropdown;
