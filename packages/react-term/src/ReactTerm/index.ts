import { Plugin, ITermInfo, IKeyboardShortcutsManager } from '@term-js/term';

import IReactTerm from '@ReactTerm/IReactTerm';
import { PLUGIN_NAME } from '@ReactTerm/constants';

class ReactTerm extends Plugin implements IReactTerm {
  public readonly name: string = PLUGIN_NAME;

  public setTermInfo(termInfo: ITermInfo, keyboardShortcutsManager: IKeyboardShortcutsManager) {
    super.setTermInfo(termInfo, keyboardShortcutsManager);
  }

  public updateTermInfo(termInfo: ITermInfo) {
    super.updateTermInfo(termInfo);
  }

  public clear() {
    super.clear();
  }

  public destroy() {
    super.destroy();
  }
}

export default ReactTerm;
