/**
 * キャラの立ち絵を画面に表示する系
 * *InteractiveCharaStage
 * * EventCharaStage
 */

import * as Util from '../../Util/Util';
import * as Rx from 'rxjs';
import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import { PixiPlugin } from "gsap/PixiPlugin";
import { Game } from '../Core/Game';
import {Spine} from 'pixi-spine';
import { TextureRepository } from '../../Repository/TextureRepository';
import { GameComponent, GameComponentState, IGameComponent, IGameComponentDelegate, ISequenceActor, ISteppableComponent, ISteppableComponentDelegate } from "../Core/IGameComponent";
import { ITweenPIXISprite } from '../Core/ITweenDisplayObject';
import { Sequence } from 'ts/Repository/SequenceRepository';

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

export type CharaConfig = {
    id: string,
    spriteId: string
    sheetId?: string
    scale?: number,
    x?: number | string,
    y?: number | string,
    z?: number,
    face?: number,
    animation?: object
}

/**
 *  ある時点における複数キャラの表示設定
 */
export type CharaStageMoment = Array<CharaConfig>;

/**
 * イベント内に置ける一連のキャラ表示設定
 */
export type CharaStageSequence = Array<CharaStageMoment>; 
export type CharaSpriteTuple = {
    id: string,
    sprite: PIXI.Sprite
};


const FACE_ID = {
    DEFAULT: 0,
    SMILE: 1,
    ANGER: 2,
    SADNESS: 3,
    HAPPY: 4,
    SURPRIZED: 5
};



export class InteractiveCharaSprite extends GameComponent {
    public renderObject: PIXI.Sprite;
    public interactive: boolean;
    private _clickSubject:  Rx.Subject<number>;
    private _clickCount: number = 0;
    public isOnce: boolean = false;
    
    protected constructor(c?: Partial<EventCharaStage>) {
        super();
        Object.assign(this, c);
    }

     /**
     * コンストラクタではなくこれでインスタンス生成する
     * @param alias 背景画像のエイリアス
     * @returns 
     */
     public static async build(alias: string, interactive:boolean = false) {
        const c = new InteractiveCharaSprite();
        let s = new PIXI.Sprite();
        TextureRepository.instance.register(alias);
        try {
            await TextureRepository.instance.load();
            s = PIXI.Sprite.from(TextureRepository.instance.get(alias));
        }
        catch(e) {
            console.log(e);
        }

        s.interactive = interactive;
        if (interactive) {
            s.cursor = 'pointer';
        }
        // イベント設定
        c._clickSubject = new Rx.Subject<number>();
        s.addEventListener('pointertap', (e) => {
            // console.log('タップされたね');
            if (c.renderObject.interactive == true && c.state == GameComponentState.ready) {
                c._clickSubject.next(c._clickCount);
                c._clickCount++;
                if (c.isOnce === true) {
                    c._clickSubject.complete();
                }
            }
        })

        c.renderObject = s;
        return c;
    }


    get observable(): Rx.Observable<number> {
        return this._clickSubject.asObservable();
    }

    public setInteractive(value: boolean):void {
        this.renderObject.interactive = value;
        if (value) {
            this.renderObject.cursor = 'pointer';
        }
        else {
            this.renderObject.cursor = 'default';
        }
    }
}



/**
 * イベント(会話)における一連のキャラ表示を制御する
 * ISteppableComponentを実装し、イベントを進める(stepNext())トリガーは外部に委譲する
 */
export class EventCharaStage extends GameComponent implements ISteppableComponent, ISequenceActor {
    public objectLabel: string = '';
    public renderObject: PIXI.Container;

    public gameComponentDelegate?: IGameComponentDelegate;
    public steppableComponentDelegate?: ISteppableComponentDelegate;

    public isWaitNext: boolean = true;

    // public spriteID?: string;
    // public spineAnimId?: string;
    // public renderSpine?: Spine;

    protected _sequenceCursor: number;
    private _sequence: CharaStageSequence;
    private _currentMoment: CharaStageMoment;
    private _currentCharaList: Array<CharaSpriteTuple>;

    constructor(c?: Partial<EventCharaStage>) {
        super();
        Object.assign(this, c);

        this.renderObject = new PIXI.Container();
        this.renderObject.sortableChildren = true;
    }

    public async init(): Promise<void> {
        this.renderObject.x = 0;
        return null;
    }

    public renderComponent(): void {
        return null;
    }
   
    public async start(): Promise<void> {
    }

    public async doUpdate(): Promise<void> {
        return null;
    }
    public async doFixedUpdate(): Promise<void> {
        return null;
    }

    public async afterUpdate(): Promise<void> {
        return null;
    }

    public destroy(): void {

    }

    public async flushCurrent(): Promise<void> {
        return;   
    }

    public async setSequence(sequence: Sequence): Promise<void> {
        let charaStageSequence = sequence.map((s) => s.chara? s.chara : null) as CharaStageSequence;    // キャラシーケンスに変換
        this._sequence = charaStageSequence;
        this._sequenceCursor = 0;
        
        let idList = {};
        charaStageSequence.map((m) => {
            if (m != undefined) {
                m.map((c) => {
                    // キャラIDを取り出す
                    idList[c.spriteId] = true;
                })
            }
        })
        Object.keys(idList).map( (id) => {
            TextureRepository.instance.register(id);
        })

        await TextureRepository.instance.load();
        this.state = GameComponentState.ready;

        return null;

        // MEMO: async版 load()をテクスチャ1つ毎にやるつもりだった時の名残
        // return new Promise(async (resolve, reject) => {
        //     this._sequence = sequence;
        //     this._textCursor = 0;
            
        //     let ids = {};
        //     sequence.map((m) => {
        //         m.map((c) => {
        //             // キャラIDを取り出す
        //             ids[c.spriteId] = true;
        //         })
        //     })
        //     Object.keys(ids).map( (id) => {
        //         TextureRepository.instance.register(id);
        //     })
        //     resolve();
        // })
    }


    public setGameComponentDelegate?(delegate: IGameComponentDelegate): void {
        this.gameComponentDelegate = delegate;
    }

    public setSteppableComponentDelegate(d: ISteppableComponentDelegate) {
        this.steppableComponentDelegate = d;
    }

    public onTap?(e: PIXI.FederatedPointerEvent): void {
        return null;
    }
    public onClose?(): void {
        return null;
    }

    public async stepNext(): Promise<void> {
        if (this.checkIsSequenceEnd()) {
            return;
        }

        this._currentMoment= this._sequence[this._sequenceCursor];

        // シーケンスこのモーメントにおける'chara'プロパティがあった
        if (this._currentMoment !== undefined && this._currentMoment != null) {

            // DEV: ひとまずコンテナ全クリア
            this.renderObject.children.map((c) => {
                c.visible = false;
                c.destroy();
            })
            this.renderObject.removeChildren();

            if(this._currentMoment.length > 0) {
                // キャラ表示設定があった
                this._currentMoment.map(async (charaInfo) => {
                    let chara = PIXI.Sprite.from(TextureRepository.instance.get(charaInfo.spriteId)) as ITweenPIXISprite; 
                    chara.scale.x = chara.scale.y = charaInfo.scale;
                    chara.anchor.x = 0.5;

                    // x座標設定
                    if (Number.isFinite(charaInfo.x)) {
                        chara.x = charaInfo.x as number;
                    }
                    else {
                        switch(charaInfo.x) {
                            case 'left' :
                                chara.x = chara.width / 2 + 20;
                                break;
                            case 'center' :
                                chara.x = Game.instance.app.screen.width / 2;
                                break;
                            case 'right' :
                                chara.x = Game.instance.app.screen.width - (chara.width / 2 + 20);
                                break;
                        }
                    }

                    // y座標設定
                    if (Number.isFinite(charaInfo.y)) {
                        chara.y = charaInfo.y as number;
                    }
                    else {
                        switch(charaInfo.y) {
                            case 'top' :
                                chara.y = chara.height / 2;
                                break;
                            case 'middle' :
                                chara.y = Game.instance.app.screen.height / 2
                                break;
                            case 'bottom' :
                                chara.y = Game.instance.app.screen.height - chara.height / 2;
                                break;
                        }
                    }


                    // アニメーション設定
                    if (charaInfo.animation != null) {
                        let pixiAnim = JSON.parse(JSON.stringify(charaInfo.animation))
                        // 目標値が数値の場合起点を元オブジェクトにする
                        // console.log(pixiAnim);
                        Object.keys(pixiAnim.pixi).map( k => {
                            // console.log(k);
                            // console.log(pixiAnim.pixi[k]);
                            if(Number.isFinite(pixiAnim.pixi[k])) {
                                console.log(chara[k]);
                                pixiAnim.pixi[k] = chara[k] + pixiAnim.pixi[k];
                            }
                        });
                        // console.log(pixiAnim);

                        chara.tween = gsap.to(chara, pixiAnim.duration, pixiAnim);
                    }

                    // console.log('chara width : ' + chara.width);
                    // console.log('chara x : ' + chara.x);
                    this.renderObject.addChild(chara);
                })
            }
            else {
                // キャラ表示設定が空の場合全クリア処理のみ
            }

            // console.log('game width : ' + Game.instance.app.screen.width);
            // console.log('container width : ' +  this.renderObject.width);
            this.renderObject.x = 0;
        }
        else {
            // 'chara'プロパティがなかった場合以前の表示を継続
        }

        this._sequenceCursor++;
    }

    public onNext?(): void {
        if (this.steppableComponentDelegate) {
            this.steppableComponentDelegate.handleNext();
        }
        else {
            this.stepNext();
        }
    }

    private checkIsSequenceEnd() {
        if ( this._sequence[this._sequenceCursor] === undefined) {
            return true;    
        }
        else {
            return false;
        }
    }
}





/**
 * クリックしたら何かしゃべったり、副作用があるタイプのキャラステージ
 */
export class InteractiveCharaStage extends EventCharaStage {
    objectLabel: string;
    renderObject: PIXI.Container;
    gameComponentDelegate?: IGameComponentDelegate;


    constructor(c?: Partial<InteractiveCharaStage>) {
        super(c);
        Object.assign(this, c);
    }
}
