
import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import { PixiPlugin } from "gsap/PixiPlugin";
import { Game } from '../Core/Game';
import {Spine} from 'pixi-spine';
import { TextureRepository } from '../../Repository/TextureRepository';
import { IGameComponent, IGameComponentDelegate, ISteppableComponent, ISteppableComponentDelegate } from "../Core/IGameComponent";
import { ITweenPIXISprite } from '../Core/ITweenDisplayObject';

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);

export type CharaConfig = {
    id: string,
    spriteId: string,
    scale?: number,
    x?: number | string,
    y?: number | string,
    z?: number,
    face?: number,
    animation?: object
}

export type CharaStageMoment = Array<CharaConfig>;
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

export class CharaStage implements IGameComponent, ISteppableComponent {
    public objectLabel: string = '';
    public renderObject: PIXI.Container;
    public gameComponentDelegate?: IGameComponentDelegate;
    public steppableComponentDelegate?: ISteppableComponentDelegate;

    // public spriteID?: string;
    // public spineAnimId?: string;
    // public renderSpine?: Spine;

    protected _sequenceCursor: number;
    private _sequence: CharaStageSequence;
    private _currentMoment: CharaStageMoment;
    private _currentCharaList: Array<CharaSpriteTuple>;

    constructor(c?: Partial<CharaStage>) {
        Object.assign(this, c);

        this.renderObject = new PIXI.Container();
        this.renderObject.sortableChildren = true;
    }

    public async init(): Promise<void> {
        this.renderObject.x = 0;
        return null;
    }

    public render(): void {
        return null;
    }
   
    public async start(): Promise<void> {
        this.stepNext();
    }

    public async doUpdate(): Promise<void> {
        return null;
    }
    public async doFixedUpdate(): Promise<void> {
        return null;
    }

    public destroy(): void {
        
    }

    public setSequence(sequence: CharaStageSequence): void {
        this._sequence = sequence;
        this._sequenceCursor = 0;
        
        let idList = {};
        sequence.map((m) => {
            m.map((c) => {
                // キャラIDを取り出す
                idList[c.spriteId] = true;
            })
        })
        Object.keys(idList).map( (id) => {
            TextureRepository.instance.register(id);
        })
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

    public onTap?(e: PIXI.InteractionEvent): void {
        return null;
    }
    public onClose?(): void {
        return null;
    }

    public stepNext(): void {
        if (!this.checkIsSequenceEnd()) {

            // DEV: ひとまずコンテナ全クリア
            this.renderObject.children.map((c) => {
                c.visible = false;
                c.destroy();
            })
            this.renderObject.removeChildren();


            this._currentMoment= this._sequence[this._sequenceCursor];
            this._currentMoment.map((charaInfo) => {
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


                if (charaInfo.animation != null) {
                    let pixiAnim = charaInfo.animation as any;
                    // 目標値が数値の場合起点を元オブジェクトにする
                    console.log(pixiAnim);
                    Object.keys(pixiAnim.pixi).map( k => {
                        console.log(k);
                        console.log(pixiAnim.pixi[k]);
                        if(Number.isFinite(pixiAnim.pixi[k])) {
                            console.log(chara[k]);
                            pixiAnim.pixi[k] = chara[k] + pixiAnim.pixi[k];
                        }
                    });
                    console.log(pixiAnim);

                    chara.tween = gsap.to(chara, pixiAnim.duration, pixiAnim);
                }

                // console.log('chara width : ' + chara.width);
                // console.log('chara x : ' + chara.x);
                this.renderObject.addChild(chara);
            })

            // console.log('game width : ' + Game.instance.app.screen.width);
            // console.log('container width : ' +  this.renderObject.width);
            this.renderObject.x = 0;
            this._sequenceCursor++;
        }
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