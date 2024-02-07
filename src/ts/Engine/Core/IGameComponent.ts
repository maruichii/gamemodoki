import * as PIXI from 'pixi.js';
import {Game} from './Game';
import { Sequence } from 'ts/Repository/EventRepository';


export enum GameComponentState {
    init,
    ready,
    suspended,
    die,
}


// ゲームコンポーネント
export interface IGameComponent {
    objectLabel: string;
    renderObject: PIXI.DisplayObject;
    gameComponentDelegate?: IGameComponentDelegate;

    state: GameComponentState;

    rawX: number;
    rawY: number;
    x:number;
    y:number;
    xOffset:number;
    yOffset:number;

    updateX();
    updateY();

    renderComponent(): void;             // レンダラーにrenderObjectを渡す
    init(): Promise<void>;              // UnityのStartに相当
    start(): Promise<void>;
    doUpdate(): Promise<void>;          // UnityのUpdateに相当
    doFixedUpdate(): Promise<void>;     // UnityのFixedUpdateに相当
    afterUpdate(): Promise<void>;       // 1フレーム処理後の後処理
    die(): Promise<void>;               // delete

    suspend(): void;
    resume():  void;
    
    // イベントアクション
    setGameComponentDelegate?(delegate: IGameComponentDelegate): void;
    onTap?(e: PIXI.FederatedPointerEvent): void;
    onClose?(): void;
}

export class GameComponent implements IGameComponent {
    public objectLabel: string;
    public renderObject: PIXI.DisplayObject;
    public gameComponentDelegate?: IGameComponentDelegate;
    public state: GameComponentState;

    public isInContainer: boolean = false;

    public rawX: number = 0;
    public rawY: number = 0;
    public xOffset: number = 0;
    public yOffset: number = 0;

    constructor() {
        this.state = GameComponentState.init;
    }

    public set x(val: number) {
        this.rawX = val;
        this.renderObject.x = val + this.xOffset;
    }
    public get x() {
        return this.rawX;
    }


    public set y(val: number) {
        this.rawY = val;
        this.renderObject.y = val + this.yOffset;
    }
    public get y() {
        return this.rawY;
    }

    public updateX() {
        this.renderObject.x = this.rawX + this.xOffset;
    }
    public updateY() {
        this.renderObject.y = this.rawY + this.yOffset;
    }

    renderComponent(): void {
        return;
    }
    init(): Promise<void> {
        this.state = GameComponentState.ready;
        return;
    }
    start(): Promise<void> {
        return;
    }
    doUpdate(): Promise<void> {
        return;
    }
    doFixedUpdate(): Promise<void> {
        return;
    }
    afterUpdate(): Promise<void> {
        return;
    }

    suspend(): void {
        this.state = GameComponentState.suspended;
    }
    resume(): void {
        this.state = GameComponentState.ready;
    }

    die(): Promise<void> {
        return;
    }
    setGameComponentDelegate?(delegate: IGameComponentDelegate): void {
        return;
    }
    onTap?(e: PIXI.FederatedPointerEvent): void {
        return;
    }
    onClose?(): void {
        return;
    } 
}




export interface IGameComponentContainer<T> {
    children: Array<T>;
    xOffset: number;
    yOffset: number;

    set x(value:number);
    set y(value:number);

    get x(): number;
    get y(): number;
    get width(): number;
    get height(): number;

    addChild(c:GameComponent)
    removeChild(c:GameComponent);
    removeAllChildren();
}



export class GameComponentContainer implements IGameComponentContainer<GameComponent> {
  
    public children: Array<GameComponent> = [];
    public xOffset: number = 0;
    public yOffset: number = 0;

    constructor(c? : Partial<GameComponentContainer>) {
        Object.assign(this, c);
    }
    
    public set x(val: number) {
        this.xOffset = val;
        this.children.map((c) => {
            c.xOffset = val;
            c.updateX();
        })
    }

    public set y(val: number) {
        this.yOffset = val;
        this.children.map((c) => {
            c.yOffset = val;
            c.updateY();
        })
    }

    get x():number {
        return this.xOffset;
    }
    get y():number {
        return this.yOffset;
    }

    get width():number {
        let rightEnd = 0;
        for (const c of this.children) {
            const cRightEnd = c.rawX + c.renderObject.getBounds().width;
            if (rightEnd < cRightEnd) {
                rightEnd = cRightEnd;
            }
        }
        return rightEnd;
    }

    get height():number {
        let bottomEnd = 0;
        for (const c of this.children) {
            const cBottomEnd = c.rawY + c.renderObject.getBounds().height;
            if (bottomEnd < cBottomEnd) {
                bottomEnd= cBottomEnd;
            }
        }
        return bottomEnd;
    }

    public addChild(c: GameComponent) {
        this.children.push(c);
        c.xOffset = this.xOffset;
        c.yOffset = this.yOffset;
        c.updateX();
        c.updateY();
    }

    public removeChild(c: GameComponent) {
        const indexToRemove = this.children.findIndex((item) => item === c);
        if (indexToRemove !== -1) {
            const target = this.children[indexToRemove];
            target.xOffset = 0;
            target.yOffset = 0;
            target.updateX();
            target.updateY();
            this.children.splice(indexToRemove, 1);
        }
    }

    public removeAllChildren() {
        for(const c of this.children) {
            c.xOffset = 0;
            c.yOffset = 0;
            c.updateX();
            c.updateY();
        };
        this.children = [];
    }
}


export interface IGameComponentDelegate {
    handleTouchStart?(e: PIXI.FederatedPointerEvent): void;
    handleTouchMove?(e: PIXI.FederatedPointerEvent): void;
    handleTouchEnd?(e: PIXI.FederatedPointerEvent): void;
    handleWheel?(e: PIXI.FederatedPointerEvent): void;    
    handleClose?(): void;
}


// コンテナ内に配置されるコンポーネント
export interface IContentComponent {
    _delegate: IGameComponentDelegate;
    width: number;
    height: number;

    center: boolean;
    left: number;
    right: number;
    
    middle: boolean;
    top: number;
    bottom: number;

    setDelegate(d: IGameComponentDelegate);
}


// 1ステップずつ状態が進行するコンポーネント
export interface ISteppableComponent extends IGameComponent {
    isWaitNext: boolean;
    stepNext(): Promise<void>;
    flushCurrent(): Promise<void>;

    steppableComponentDelegate?: ISteppableComponentDelegate;
    setSteppableComponentDelegate(d: ISteppableComponentDelegate);
    onNext?(): void;
}

export interface ISequenceActor {
    setSequence(sequence: Sequence): Promise<void>;
}

export interface ISteppableComponentDelegate {

    isWaitNext: boolean;

    start(): Promise<void>;
    handleNext(e?: any): Promise<void>;
    handleEnd(e?: any): Promise<void>;
}

export type SteppableComponentBranchEvent = {
    position: number;
}


// 内部要素をスクロール可能なコンポーネント
export interface IScrollableViewport {
    innerContainer: PIXI.Container;
    displayArea: PIXI.MaskData;
    
    onWheel(): void;
    onDragStart(): void;
    onDragging(): void;
    onDragEnd(): void;
}