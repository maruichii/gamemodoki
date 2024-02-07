const { TEXT, ENV } = require('ts/Const');
import * as Util from 'ts/Util/Util';
import * as PIXI from 'pixi.js';
import * as Rx from 'rxjs';
// import { IObserver } from '../../Core/IObserver';
import { ISideEffectDispacher } from "../../Core/IEffectDispacher";
import { SequenceManager } from "./SequenceManager";
import { Event, EventRepository, FlagEffect, SCRIPT_TYPE, SIDE_EFFECT_TYPE, Script, Sequence, SideEffect, SideEffectBunch } from "../../../Repository/EventRepository";
import { EventCharaStage } from "../CharaStage";
import { Scene } from "../../Core/Scene";
import { SequencialTextWindow, SerifWindow } from "../UI/UIWindow";
import { Param, ParameterManager } from '../../Core/ParameterManager';
import { FlagManager } from '../../Core/FlagManager';
import { SequentialBackground } from 'ts/Engine/GameComponent/Background';
import { SequentialGameSound } from 'ts/Engine/GameComponent/GameSound';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';
import { ClearEventBuffer } from 'ts/Util/Util';
import { LAYER_BG, LAYER_EVENT_UI } from 'ts/Const';



/**
 * イベント(シーケンス + サイドエフェクト)の登録・制御を行う
 */
export class EventManager  {
    public scene: Scene;
    private _eventId:         number = null;
    private _sequenceManager: SequenceManager;
    private _sequence:        Sequence;         // イベントを直接設定して起動する時用(セーブからの復帰など)

    private _sideEffectBunchList: Array<SideEffectBunch>;
    private _sideEffectIdx: number = 0;

    private _isSetEvent: boolean = false;

    private _completeSubject = new Rx.Subject<string>();

    constructor(c?: Partial<EventManager>) {
        this._sequenceManager = new SequenceManager();  
    
        Object.assign(this, c);
    }



    get observable(): Rx.Observable<string> {
        return this._completeSubject.asObservable();
    }

    public async die(): Promise<void> {
        this.scene = null;
        await this._sequenceManager.die();
        this._sequenceManager = null;
    }

    public setScene(scene: Scene) {
        this.scene = scene;
        this._sequenceManager.setScene(scene)// HACK: scene渡すのはテスト用
    }

    public setEventId(eId: number) {
        this._isSetEvent = true;
        this._eventId = eId;
    }

    public setEvent(event: Event, sideEffectIdx:number = 0) {
        this._isSetEvent = true;
        this._eventId = null;
        this._sequence = event.sequence;
        this._sideEffectIdx = sideEffectIdx;
        this._sideEffectBunchList = event.sideEffect;
        SystemDataManager.instance.sysdata.current_sideeffect_list = event.sideEffect;
    }

    public async emitEvent(): Promise<void> {

        // シーンがなければ実行しない
        if (this.scene == null) {
            return Promise.reject();
        }

        // 背景
        const background = await SequentialBackground.build(null, true);

        // キャラお立ち台
        const charaStage = new EventCharaStage();
       
        // セリフウィンドウ
        const serifWindow = new SerifWindow({
            width: 1350,
            height: 220,
            center: true,
            bottom: 30,
            backgroundColor: '#080808fa',
            textStyle: {...ENV.defaultTextStyle, ...{fill: '#ffffff', stroke: '#cecece', strokeThickness: 0}} as PIXI.TextStyle,
            textSpeed: 20
        });

        // BGM
        const sSound = new SequentialGameSound();

        await this.scene.addObject(background, 'background', LAYER_EVENT_UI + 1);
        this._sequenceManager.registerComponent(background);
        
        await this.scene.addObject(charaStage, 'charaStage', LAYER_EVENT_UI + 2);
        this._sequenceManager.registerComponent(charaStage);

        await this.scene.addObject(serifWindow, 'serifWindow', LAYER_EVENT_UI + 3);
        this._sequenceManager.registerComponent(serifWindow);
        
        await this.scene.addObject(sSound, 'sound', LAYER_BG + 1);
        this._sequenceManager.registerComponent(sSound);



        if (this._isSetEvent) {
            if (this._eventId != null) {
                // イベントIDから設定する場合はリソースから読み込む
                const event = await EventRepository.instance.load(this._eventId);
                if (event.sequence != undefined || event.sequence != null) {
                    const sequence = event.sequence;
                    SystemDataManager.instance.sysdata.current_sideeffect_list = event.sideEffect;
                    await this._sequenceManager.setSequence(sequence);
                    this._sequenceManager.setSideEffectIndex(this._sideEffectIdx);  // ロード時のリザルト副作用IDセット用
                }

                if (event.sideEffect != null) {
                    this._sideEffectBunchList = event.sideEffect;
                }
            }
        }
        else {
            throw new Error(this.constructor.name + ': イベント未設定');
        }

        const sequenceObserver = this._sequenceManager.observable;
        sequenceObserver.subscribe({
            next: (idx) => {
                // シーケンス完了時のサイドエフェクトID通知
                this._sideEffectIdx = idx;
            },
            complete: () => this.finishEvent(),
        })

        this._sequenceManager.start();
    }


    // DELETE:
    // public async handleNotification(param?: any): Promise<void> {
    //     // イベント内副作用IDリストの格納
    //     if (param != null && param.length != null) {
    //         this._resultSideEffectIdList = param;
    //     }
    //     else if (param != null) {
    //         this._resultSideEffectIdList.push(param);
    //     }
    // }


    public async finishEvent(): Promise<void> {
        let destSceneName: string = null;

        if (this._sideEffectBunchList === undefined || this._sideEffectBunchList === null || this._sideEffectBunchList.length <= 0) {
            // 副作用なしならそのまま完了
            this.notifyEventComplete(destSceneName);
        }

        else {

            if (this._sideEffectBunchList.length < this._sideEffectIdx + 1) {
                throw new Error(this.constructor.name + ': 指定されたIDの副作用が設定されていません');
            }

            const sideEffectBunch = this._sideEffectBunchList[this._sideEffectIdx];

            // 副作用の伝達

            let msg = new Array<string>();  // 終了時メッセージ

            for (const sideEffect of sideEffectBunch) {
                if (sideEffect != null && sideEffect.effect != null) {
                    
                    // パラメーター変動メッセージの表示 or 非表示
                    const isResultMsg = sideEffect.isResultMsg !== undefined ? sideEffect.isResultMsg : false;

                    // 事後メッセージの取得
                    if (sideEffect.afterMsg !== undefined && sideEffect.afterMsg !== '' && sideEffect.afterMsg !== '') {
                        msg.push(sideEffect.afterMsg);
                    }
                    

                    switch(sideEffect.type as SIDE_EFFECT_TYPE) {
                        case SIDE_EFFECT_TYPE.PARAM :
                            // パラメータ変更メッセージ
                            const ret = ParameterManager.instance.setParam(sideEffect.effect as Param, isResultMsg);
                            if (ret != null) {
                                msg.push(ret);
                            }
                            
                            break;
                        case SIDE_EFFECT_TYPE.FLAG :
                            const e = sideEffect.effect as FlagEffect;
                            FlagManager.instance.setFlag(e.target, e.value);
                            break;

                        case SIDE_EFFECT_TYPE.SCENE :
                            destSceneName = sideEffect.effect.target as string;
                            break;

                        default:
                            break;
                    }
                }
            }


            /**
             * 完了後メッセージの表示
             */
            let endSequence:Sequence = new Array<Script>();
            for (const m of msg) {
                endSequence.push({
                    type: SCRIPT_TYPE.NORMAL,
                    text: m,
                    chara: [],
                })
            }
            if (endSequence.length > 0) {
                // HACK: シーケンスマネージャー再利用
                console.log(this.scene.renderObject.children);
                await this._sequenceManager.setSequence(endSequence);
                const endSequenceObserver = this._sequenceManager.resetObservable();
                endSequenceObserver.subscribe({
                    complete: () => this.notifyEventComplete(destSceneName),
                })
                this._sequenceManager.start();
                console.log(this.scene.renderObject.children);
            }
            else {
                // 空なら表示しない
                this.notifyEventComplete(destSceneName);
            }
        }
    }


    public notifyEventComplete(destSceneName: string = null) {
        if (destSceneName != null) {
            this._completeSubject.next(destSceneName);
        }
        this._completeSubject.complete();

        // システムデータクリア
        Util.ClearEventBuffer();
        
        // 死
        this.die();
    }
}