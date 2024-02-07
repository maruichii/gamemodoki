/**
 * サウンド周り
 * 
 */

import * as Util from '../../Util/Util';
import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import { sound, Sound, SoundLibrary, SoundSprite, Options as SoundOptions, Options} from '@pixi/sound';
import { PixiPlugin } from "gsap/PixiPlugin";
import { Game } from '../Core/Game';
import { SoundRepository } from 'ts/Repository/SoundRepository';
import { GameComponent, GameComponentState, IGameComponent, IGameComponentDelegate, ISequenceActor, ISteppableComponent, ISteppableComponentDelegate } from "../Core/IGameComponent";
import { ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { Script, Sequence } from 'ts/Repository/EventRepository';

/**
 * SoundOptionsを拡張
 */
export type SoundConfig =  {
    alias: string;
    options?: SoundOptions
}

export type BgmSeConfig = {
    bgm?:    SoundConfig,
    se?:     SoundConfig
};

export enum SoundType  {
    SE  =  0,
    BGM =  1
}

export type SoundSequence = Array<BgmSeConfig>;


/**
 * GameComponentを継承するがrenderObjectは持たない
 */
export class GameSound extends GameComponent {
    
    public alias: string;
    public options: Options;
    public instance: Sound;

    protected _masterVol: number = 1.0;
    protected _seVol: number = 1.0;
    protected _bgmVol: number = 1.0;


    /**
     * コンストラクタではなくこれでインスタンス生成する
     * @param seAlias?   音源エイリアス(RES_SOUND参照),
     * @param options PIXI.sound.Options 
     * @returns 
     */
    public static async build(alias: string, options?: Options): Promise<GameSound> {
        const s = new GameSound();
        await s.setSound(alias, options);
        return s;
    }


    protected constructor() {
        super();
        this.renderObject = new PIXI.Container();

        // TODO: 設定値から読む
        // this._masterVol = 1.0;
    }


    public async setSound(alias: string, options: Options = null): Promise<void> {
        // 既にアセットが読み込まれていればsound内にあるので取ってくる
        let soundInstance:Sound;
        if (sound.exists(alias)) {
            soundInstance = sound.find(alias);
        }
        else {
            // なければアセット登録してロード
            try {
                SoundRepository.instance.register(alias);
                await SoundRepository.instance.load();
                soundInstance = sound.find(alias);
            }
            catch(e) {
                console.log(e);
            }
        }

        if (options != null) {
            soundInstance.loop = options.loop ?? false;
            soundInstance.speed = options.speed ?? 1.0;
            const vol = options.volume?? 1.0;
            soundInstance.volume = this._masterVol * this._bgmVol * vol; 
        }

        this.instance = soundInstance;
        this.alias = alias;
    }


    public play():void {
        this.instance.play();
    }

    public pause():void {
        this.instance.pause();
    }

    public async die(): Promise<void> {
        this.instance = null;
        await SoundRepository.instance.unload(this.alias);
        this.state = GameComponentState.die;
        return;
    }
}


export class SequentialGameSound extends GameComponent implements ISteppableComponent, ISequenceActor {

    public currentSe?: GameSound = null;
    public currentBgm?: GameSound = null;

    public objectLabel: string;
    public renderObject: PIXI.DisplayObject;
    public gameComponentDelegate?: IGameComponentDelegate;
    public steppableComponentDelegate?: ISteppableComponentDelegate;
    public state: GameComponentState;

    public isWaitNext: boolean = true;

    protected _sequenceCursor: number;
    private _sequence: SoundSequence;

    public currentBgmSeConfig: BgmSeConfig;

    private _aliasList = new Array<string>();

    constructor() {
        super();
        this.renderObject = new PIXI.Container();
    }
    
    renderComponent(): void {
        return null;
    }
    init(): Promise<void> {
        return null;
    }
    start(): Promise<void> {
        return null;
    }
    doUpdate(): Promise<void> {
        return null;
    }
    doFixedUpdate(): Promise<void> {
        return null;
    }
    afterUpdate(): Promise<void> {
        return null;
    }
    suspend(): void {
        return null;
    }
    resume(): void {
        return null;
    }
    onTap?(e: PIXI.FederatedPointerEvent): void {
        return null;
    }
    onClose?(): void {
        return null;
    }

    flushCurrent(): Promise<void> {
        return;
    }
  
    public setGameComponentDelegate?(delegate: IGameComponentDelegate): void {
        this.gameComponentDelegate = delegate;
    }

    public setSteppableComponentDelegate(d: ISteppableComponentDelegate) {
        this.steppableComponentDelegate = d;
    }

    public async setSequence(sequence: Sequence): Promise<void> {
        let soundSequence = sequence.map( (s) => {return {bgm: s.bgm, se: s.se} as BgmSeConfig} ) as SoundSequence;   // キャラシーケンスに変換
        this._sequence = soundSequence;
        this._sequenceCursor = 0;

        this._aliasList = [];
        
        soundSequence.map((m) => {
            if(m.bgm != undefined && m.bgm.alias != undefined) {
                this._aliasList.push(m.bgm.alias)
            }
            if(m.se != undefined && m.se.alias != undefined) {
                this._aliasList.push(m.se.alias)
            }
        });
        Object.keys(this._aliasList).map((id) => {
            SoundRepository.instance.register(id);
        })

        await SoundRepository.instance.load();
        this.state = GameComponentState.ready;

        return null;
    }

    public onNext?(): void {
        if (this.steppableComponentDelegate) {
            this.steppableComponentDelegate.handleNext();
        }
        else {
            this.stepNext();
        }
    }


    public async stepNext(): Promise<void> {
        if (this.checkIsSequenceEnd()) {
            // 終了
            return;
        }

        this.currentBgmSeConfig = this._sequence[this._sequenceCursor];

        if (this.currentBgmSeConfig === undefined) {
            // 何もしない
            this._sequenceCursor++;
            return;
        }

        const bgmConfig = this.currentBgmSeConfig.bgm;
        const seConfig = this.currentBgmSeConfig.se;

        // BGM
        if (bgmConfig === undefined) {
            // 何もしない
        }
        else if (bgmConfig == null) {
            // 止める
            if (this.currentBgm != null) {
                this.currentBgm.pause();
            }
        }
        else {
            // 追加・再生
            if (this.currentBgm != null) {
                await this.currentBgm.die();
            }
            this.currentBgm = await GameSound.build(bgmConfig.alias, bgmConfig.options);
            this.currentBgm.play();
        }

        // SE
        if (seConfig === undefined) {
            // 何もしない
        }
        else if (seConfig == null) {
            // 止める
            if (this.currentSe != null) {
                this.currentSe.pause();
            }
        }
        else {
            // 追加・再生
            if (this.currentSe != null) {
                await this.currentSe.die();
            }
            this.currentSe = await GameSound.build(seConfig.alias, seConfig.options);
            this.currentSe.play()
        }


        this._sequenceCursor++;
    }

    private checkIsSequenceEnd() {
        if ( this._sequenceCursor >= this._sequence.length) {
            return true;    
        }
        else {
            return false;
        }
    }


    public async die(): Promise<void> {
        this._aliasList.map( async (alias) => {
            await SoundRepository.instance.unload(alias);
        })
        this.state = GameComponentState.die;
    }
}