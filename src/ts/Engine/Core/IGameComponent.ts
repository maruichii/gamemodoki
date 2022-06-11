import * as PIXI from 'pixi.js';
import {Game} from './Game';

// ゲームコンポーネント
export interface IGameComponent {
    objectLabel: string;
    renderObject: PIXI.DisplayObject;
    gameComponentDelegate?: IGameComponentDelegate;

    render(): void;                     // レンダラーにrenderObjectを渡す
    init(): Promise<void>;              // UnityのStart
    start(): Promise<void>;
    doUpdate(): Promise<void>;          // UnityのUpdate
    doFixedUpdate(): Promise<void>;     // UnityのFixedUpdate
    destroy(): void;                    // delete
    
    // イベントアクション
    setGameComponentDelegate?(delegate: IGameComponentDelegate): void;
    onTap?(e: PIXI.InteractionEvent): void;
    onClose?(): void;
}

export interface IGameComponentDelegate {
    handleTap(e: PIXI.InteractionEvent): void;
    handleClose(): void;
}


// コンテナ内に配置されるコンポーネント
export interface IContentComponent {
    width: number;
    height: number;

    center: boolean;
    left: number;
    right: number;
    
    middle: boolean;
    top: number;
    bottom: number;
}


// 1ステップずつ状態が進行するコンポーネント
export interface ISteppableComponent extends IGameComponent {
    stepNext(): void;

    steppableComponentDelegate?: ISteppableComponentDelegate;
    setSteppableComponentDelegate(d: ISteppableComponentDelegate);
    onNext?(): void;
}

export interface ISteppableComponentDelegate {
    handleNext(): void;
}