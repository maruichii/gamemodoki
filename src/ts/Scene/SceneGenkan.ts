import '@babel/polyfill';
import * as Util from 'ts/Util/Util';
import * as PIXI from 'pixi.js';
import { GameComponentState, IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { EventManager } from 'ts/Engine/GameComponent/ComponentManager/EventManager';
import { InteractiveCharaSprite, InteractiveCharaStage } from 'ts/Engine/GameComponent/CharaStage';
// import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { BASEEVENT_BASEID, COMEVENT_BASEID, ENV, GAME_HEIGHT, GAME_WIDTH, LAYER_BG, LAYER_SCENE_FAR_UI, WORKEVENT_BASEID } from 'ts/Const';
import { PARAM_GROUP, PARAM_OP, Param, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { Background } from 'ts/Engine/GameComponent/Background';
import { TurnMonitor } from 'ts/Engine/GameComponent/UI/TurnMonitor';
import { HeroineStatusMonitor } from 'ts/Engine/GameComponent/UI/HeroineStatusMonitor';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { MoneryMonitor } from 'ts/Engine/GameComponent/UI/MoneyMonitor';
import { FlagManager } from 'ts/Engine/Core/FlagManager';
import { UILabel } from 'ts/Engine/GameComponent/UI/UILabel';
import { UIRadioGroup } from 'ts/Engine/GameComponent/UI/UICheckBox';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';

export class SceneGenkan extends Scene {

    public baseEventId: number = WORKEVENT_BASEID;
    private _lastWindowCloseTime: number = 0;

    constructor(c? : Partial<SceneGenkan>) {
        super(c);
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.children = new Array<ChildComponent>();
    }
    

    public async init(): Promise<void> {
        await super.init();

        if (!this.isLoadedGame) {
            // AP回復 & 日付+1
            const maxAp =  ParameterManager.instance.getParam(PARAM_GROUP.PLAYER, 'max_ap');
            ParameterManager.instance.setParams([
                {target:PARAM_GROUP.BASE, property: 'day', operator:PARAM_OP.ADD, value: 1},
                {target:PARAM_GROUP.PLAYER, property: 'ap', operator:PARAM_OP.ASG, value: maxAp}
            ]);
        }


        // 現在日
        const day = ParameterManager.instance.Base.day;
        if (FlagManager.instance.getFlag('IS_RESCUED')) {
            this.baseEventId += 2000;
        }
        else {
            this.baseEventId += 1000;
        }
        
        let destSceneName = null;


        // 時刻(朝)セット
        ParameterManager.instance.setBaseParam({property: 'time', value: 0} as Param);
        

        // 背景
        const bg = await Background.build('bg_genkan');
        bg.setNext('bg_oshigoto');
        bg.setScreenColor(0x333333, 0.9);
        await this.addObject(bg, 'bg', LAYER_BG);


        // ヘッダーUI
        await this.showHeaderUI();


        // 行動ラベル
        const dousuruLabel = new UILabel({
            width: GAME_WIDTH * 0.4,
            height: GAME_HEIGHT * 0.1125,
            right: GAME_HEIGHT * 0.075,
            top: GAME_HEIGHT * 0.2,
            backgroundColor: '#ffffff',
            lineColor: '#555555',
            lineThickness: 2,
            text: '今日はどうしようか',
            textStyle: {...ENV.defaultTextStyle, ...{fontSize:34 ,fill: '#2c2c2c', strokeThickness: 0}} as PIXI.TextStyle
        })
        await this.addObject(dousuruLabel, '', LAYER_SCENE_FAR_UI);

        // 行動選択
        const playerAction = new UIRadioGroup(
            [
                {
                    label: '普通に働く　　　　　',
                    sub:   '(行動力 －1)'
                },
                {
                    label: 'ムリして頑張る　　　',
                    sub:   '(行動力 －4)'
                },
                {
                    label: '適当にサボる　　　　',
                    sub:   '(行動力 ±0)'
                }
            ],
            {
                width: GAME_WIDTH * 0.3,
                // height: GAME_HEIGHT * 0.4,
                right: GAME_HEIGHT * 0.075,
                top: GAME_HEIGHT * (0.15 + 0.2), 
                backgroundColor: '#ffffff',
                lineColor: '#555555',
                lineThickness: 2,
                textStyle: {...ENV.defaultTextStyle, ...{fontSize:27 ,fill: '#2c2c2c', strokeThickness: 0}} as PIXI.TextStyle
            }
        )
        await this.addObject(playerAction, '', LAYER_SCENE_FAR_UI);

        if (FlagManager.instance.flags['IS_LIVE_TOGETHER'] > 2) {
            // ヒロインステータス
            const heroineStatusMonitor = new HeroineStatusMonitor();
            heroineStatusMonitor.x = 10;
            heroineStatusMonitor.y = 300;
            await this.addObject(heroineStatusMonitor, '', LAYER_SCENE_FAR_UI);


            // ヒロイン立ち絵表示
            const chara = await InteractiveCharaSprite.build('heroine_tachi_n', true);
            chara.renderObject.scale.x = chara.renderObject.scale.y = 0.8;
            chara.renderObject.anchor.set(0.5);
            chara.renderObject.x = 0.2 * GAME_WIDTH;
            chara.renderObject.y = 0.6 * GAME_HEIGHT;
            await this.addObject(chara, 'heroine', LAYER_SCENE_FAR_UI);


            // ヒロインクリック
            const charaClickObserver = chara.observable;
            charaClickObserver
            .pipe()
            .subscribe({
                next: (clickCount: number) => {
                    if ( Game.currentTime -  this._lastWindowCloseTime > 500) {
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
        }

        

        /**
         * ボタン
         */
        // 共通ボタンスタイル
        

        
        // 出発ボタン
        const buttonGo = new UIButton(1, 
            {
                ...ENV.defaultButtonStyle, 
                ...{
                    lineColor: '#e05b1e',
                    lineThickness: 4,
                    text: '出発',
                    circle: true,
                    width: GAME_WIDTH * 0.0875,
                    height: GAME_WIDTH * 0.0875
                } 
            }
        );
        await this.addObject(buttonGo
            , '', LAYER_SCENE_FAR_UI);
        buttonGo.x = GAME_WIDTH * 0.95 - buttonGo.width;
        buttonGo.y = GAME_HEIGHT * 0.675;


        const goObserver = buttonGo.observable;
        goObserver
        .pipe()
        .subscribe({
            next: async (val: number) => {
                buttonGo.state = GameComponentState.suspended;


                const seKaidanDown = await GameSound.build('se_kaidan', { volume: 0.1, speed: 1.25 });
                seKaidanDown.play();

                const randomValue = Math.random();
                let workEvId = 1;
                switch (playerAction.radioGroup.selected) {
                    case 0 :
                        // 普通に働く
                        if (randomValue <  0.5) {
                            // 1万円
                            workEvId = 1;
                        }
                        else {
                            // 1.5万円
                            workEvId = 2;
                        }
                        break;
                    case 1 :
                        // ムリして働く
                        if (randomValue < 0.7) {
                            // 3万円
                            workEvId = 3;
                        }
                        else if (randomValue < 0.95) {
                            // 5万円
                            workEvId = 5;
                        }
                        else {
                            // 1.5万円
                            workEvId = 4;
                        }
                        break;
                    case 2 :
                        // サボる
                        if (randomValue < 0.7) {
                            // 3万円
                            workEvId = 6;
                        }
                        else {
                            workEvId = 7;
                        }
                        break;
                    default:
                        throw new Error('ラジオボタンのエラーです');
                        break;
                }
                dousuruLabel.state = GameComponentState.die;
                buttonGo.state = GameComponentState.die;
                playerAction.state = GameComponentState.die;

                // 背景変更
                await bg.changeNext(0.25);

                // お仕事イベント発動
                const evWork = new EventManager({scene: this});
                console.log('お仕事' + (this.baseEventId + workEvId));
                evWork.setEventId(this.baseEventId + workEvId);
                evWork.emitEvent();
                const eventObserver = evWork.observable;
                eventObserver.subscribe({
                    next: (sceneName) => { },
                    complete: async () => {
                        evWork.die();
                        const seKaidanDown = await GameSound.build('se_kaidan', { volume: 0.1, speed: 1.0 });
                        seKaidanDown.play();
                        if (FlagManager.instance.getFlag('IS_RESCUED')) {
                            // 自室に帰る
                        }
                        else {
                            // 玄関前に帰る
                            Game.changeScene('SceneFrontDoor');
                        }
                    }
                });
                
            }
        })


        /**
         * 初日イベント
         */
        console.log(FlagManager.instance.flags);
        if (!FlagManager.instance.flags['IS_FIRST_MORNING_ENTER']) {
            const evFirstMorning = new EventManager({scene: this});
            evFirstMorning.setEventId(BASEEVENT_BASEID + 2000);
            evFirstMorning.emitEvent();
            FlagManager.instance.setFlag('IS_FIRST_MORNING_ENTER', true);
        }

    }

}