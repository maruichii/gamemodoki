import '@babel/polyfill';
import * as Util from 'ts/Util/Util';
import * as PIXI from 'pixi.js';
import { GameComponentContainer, GameComponentState, IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { EventManager } from 'ts/Engine/GameComponent/ComponentManager/EventManager';
import { InteractiveCharaSprite, InteractiveCharaStage } from 'ts/Engine/GameComponent/CharaStage';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { COMEVENT_BASEID, CTEXT, ENV, GAME_HEIGHT, GAME_WIDTH, LAYER_BG, LAYER_SCENE_FAR_UI, STORYEVENT_BASEID } from 'ts/Const';
import { PARAM_GROUP, PARAM_OP, Param, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { Background } from 'ts/Engine/GameComponent/Background';
import { TURNMONITOR_TIMEINDEX, TurnMonitor } from 'ts/Engine/GameComponent/UI/TurnMonitor';
import { HeroineStatusMonitor } from 'ts/Engine/GameComponent/UI/HeroineStatusMonitor';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { MoneryMonitor } from 'ts/Engine/GameComponent/UI/MoneyMonitor';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';

export class SceneFrontDoor extends Scene {

    public baseEventId: number = 91001000;
    private _lastWindowCloseTime: number = 0;

    constructor(c? : Partial<SceneFrontDoor>) {
        super(c);
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.children = new Array<ChildComponent>();
    }
    

    public async init(): Promise<void> {
        await super.init();

        // 現在日
        const day = ParameterManager.instance.Base.day;
        this.baseEventId += (day - 1) * 1000;
        console.log('ベースイベントID:' + this.baseEventId);

        let destSceneName = null;

        this._bgm = await GameSound.build('bgm_kumazemi', {loop: true, volume: 0.15});
        this._bgm.play();


        // 時刻(夕)セット
        ParameterManager.instance.setBaseParam({property: 'time', value: 2} as Param);

        // 背景
        const bg = await Background.build('bg_frontdoor');
        await this.addObject(bg, 'bg', LAYER_BG);


        // ヘッダーUI
        await this.showHeaderUI();


        // ヒロインステータス
        const heroineStatusMonitor = new HeroineStatusMonitor();
        heroineStatusMonitor.x = 10;
        heroineStatusMonitor.y = Util.ratioToPix( 0.25, Util.RATIO_TO_PIX_TYPE.HEIGHT);
        await this.addObject(heroineStatusMonitor, 'status_monitor', LAYER_SCENE_FAR_UI);


        // ヒロイン立ち絵表示
        const chara = await InteractiveCharaSprite.build('heroine_tachi_n', true);
        chara.renderObject.scale.x = chara.renderObject.scale.y = 0.8;
        chara.renderObject.anchor.set(0.5);
        chara.renderObject.x = Util.ratioToPix( 0.5, Util.RATIO_TO_PIX_TYPE.WIDTH);
        chara.renderObject.y = Util.ratioToPix( 0.625, Util.RATIO_TO_PIX_TYPE.HEIGHT);
        await  this.addObject(chara, 'heroine', LAYER_SCENE_FAR_UI);

        // ヒロインクリック
        const charaClickObserver = chara.observable;
        charaClickObserver
        .pipe()
        .subscribe({
            next: (clickCount: number) => {
                if ( Game.currentTime -  this._lastWindowCloseTime > 300) {
                    chara.state = GameComponentState.suspended;
                    const osawariEvent = new EventManager();
                    osawariEvent.setScene(this);
                    osawariEvent.setEventId(this.baseEventId + 100 + 0);   // 本来はクリックカウントで変更する
                    osawariEvent.emitEvent();
                    const osawariEventObserver = osawariEvent.observable;
                    osawariEventObserver.subscribe({
                        complete: () => {
                            chara.state = GameComponentState.ready;
                            this._lastWindowCloseTime = Game.currentTime;
                        },
                    })
                }
            }
        })





        /**
         * ボタン
         */

        const buttonContainer = new GameComponentContainer();

        // 話すボタン
        const buttonTalk = new UIButton(1, {
            ...ENV.defaultButtonStyle, ...{lineColor: '#06b300', text: '話す'}
        });
        const talkObserver = buttonTalk.observable;
        talkObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                this.setDisabledAllButtons();
                // 話すイベント
                const talkEvent = new EventManager();
                const talk_count = ParameterManager.instance.Base.talk_count;
                const ap = ParameterManager.instance.Player.ap;
                const eventId = this.baseEventId + talk_count;
                ParameterManager.instance.setParam({target:PARAM_GROUP.BASE, property: 'talk_count', operator:PARAM_OP.ADD, value: 1});
                talkEvent.setScene(this);
                talkEvent.setEventId(eventId);
                talkEvent.emitEvent();
                console.log('話すイベント:' + eventId);
                const talkEventObserver = talkEvent.observable;
                talkEventObserver.subscribe({
                    next: (sceneName) => {
                        destSceneName = sceneName;
                    },
                    complete: () => {
                        // シーン遷移あり
                        if (destSceneName != null) {
                            // シーンを生成&移動
                            this.changeScene(destSceneName);
                            return;
                        }
                        this.setEnabledAllButtons();
                        ParameterManager.instance.setParam({target:PARAM_GROUP.PLAYER, property: 'ap', operator:PARAM_OP.SUB, value: 1});
                        this._lastWindowCloseTime = Game.currentTime;
                    }
                })
            }
        })
        this._buttons.push(buttonTalk);
        await this.addObject(buttonTalk, 'button_talk', LAYER_SCENE_FAR_UI);
        buttonContainer.addChild(buttonTalk);


        // 家に入るボタン
        if (day > 1) {
            const buttonGoHome = new UIButton(2, {
                ...ENV.defaultButtonStyle, 
                ...{
                     top: GAME_HEIGHT * 0.15, lineColor: '#136bbd', text: '家に入る',
                     textStyle: {...ENV.defaultButtonStyle.textStyle, ...{wordWrap: true, wordWrapWidth: 100000} } as PIXI.TextStyle
                }
            });
            const awayObserver = buttonGoHome.observable;
            awayObserver
            .pipe()
            .subscribe({
                next: (val: number) => {
                    this.setDisabledAllButtons();
                    this.endDay();
                }
            });
            this._buttons.push(buttonGoHome);
            await  this.addObject(buttonGoHome, 'button_gohome', LAYER_SCENE_FAR_UI);
            buttonContainer.addChild(buttonGoHome);
        }

        buttonContainer.x = GAME_WIDTH - buttonContainer.width - 25;
        buttonContainer.y = GAME_HEIGHT * 0.25;


        // 行動力監視
        ParameterManager.instance.paramChange$.subscribe({
            next: (change) => {
                if (change.paramName == 'ap' && change.paramValue <= 0) {
                    // 最大ターンを超えたら1日終了イベント表示、シーン遷移
                    this.endDay();
                }
            }
        })
    }
    

    private endDay(): void {
        const ap = ParameterManager.instance.Player.ap;
        const apDiff = ap == 0 ? 2 : 1; 
        const dayEndEv = new EventManager();
        dayEndEv.setScene(this);
        dayEndEv.setEventId(COMEVENT_BASEID + apDiff);
        dayEndEv.emitEvent();

        const dayEndEvObserver = dayEndEv.observable;
        dayEndEvObserver.subscribe({
            complete: () => {
                const day = ParameterManager.instance.Base.day;

                if (day == 1) {
                    ParameterManager.instance.Base.time = TURNMONITOR_TIMEINDEX.EVENING;
                    const eventId = STORYEVENT_BASEID + 1000 + 2;
                    this.changeScene('SceneSimpleEvent', {eventId: STORYEVENT_BASEID + 1000 + 2, destSceneName: 'SceneGenkan', isShowUi: true})
                }
                else {
                    this.changeScene('SceneGenkan');
                }
            }
        })
    }
}