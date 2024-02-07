import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import { IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { EventManager } from '../Engine/GameComponent/ComponentManager/EventManager';
import { COMEVENT_BASEID, ENV, GAME_HEIGHT } from 'ts/Const';

import * as Util from '../Util/Util';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { TURNMONITOR_TIMEINDEX, TurnMonitor } from 'ts/Engine/GameComponent/UI/TurnMonitor';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { MoneryMonitor } from 'ts/Engine/GameComponent/UI/MoneyMonitor';
import { Background } from 'ts/Engine/GameComponent/Background';


/**
 * 単純にイベントを再生するだけのクラス
 * 内部的に呼び出すのみ イベントの副作用によるシーン遷移には使わない
 */

export class SceneSimpleEvent extends Scene {

    public eventId: number;
    public destSceneName: string = '';
    public isShowUi: boolean = false;
    public time: TURNMONITOR_TIMEINDEX = TURNMONITOR_TIMEINDEX.MORNING;

    constructor(c? : Partial<SceneSimpleEvent>) {
        super(c);

        Object.assign(this, c);
    }

    public async init(): Promise<void> {
        await super.init();

        if (this.isShowUi) {
            /**
             * ヘッダーUI
             */
            await this.showHeaderUI();
        }

        /**
         * イベント再生
         */
        const event = new EventManager();
        event.setScene(this);
        event.setEventId(this.eventId);
        event.emitEvent();
        const eventObserver = event.observable;
        eventObserver.subscribe({
            next: (sceneName) => {
                this.destSceneName = sceneName;
            },
            complete: () => {
                event.die();
                if (this.destSceneName != null) {
                    // シーンを生成&移動
                    Game.changeScene(this.destSceneName);
                }
            }
        });

    }

}