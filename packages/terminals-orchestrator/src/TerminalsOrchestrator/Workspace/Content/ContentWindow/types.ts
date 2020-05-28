import IContentWindow from './IContentWindow';

export type MoveType = 'left' | 'right' | 'top' | 'bottom' | 'leftTop' | 'rightTop'
  | 'leftBottom' | 'rightBottom' | 'header';

export type OptionsType = {
  position: { left: number, right: number, top: number, bottom: number },
  onStartMove?: (type: MoveType, contentWindow: IContentWindow, e: MouseEvent) => void;
  onEndMove?: (type: MoveType, contentWindow: IContentWindow, e: MouseEvent) => void;
  onMove?: (type: MoveType, contentWindow: IContentWindow, e: MouseEvent) => void;
};
