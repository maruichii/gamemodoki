import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import * as Util from 'ts/Util/Util';
import { GameComponentState, IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { EventManager } from 'ts/Engine/GameComponent/ComponentManager/EventManager';
import { InteractiveCharaSprite, InteractiveCharaStage } from 'ts/Engine/GameComponent/CharaStage';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { ENV, GAME_HEIGHT, GAME_WIDTH, LAYER_SCENE_NEAR_UI } from 'ts/Const';
import { PARAM_GROUP, PARAM_OP, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { Background } from 'ts/Engine/GameComponent/Background';

export class SceneOpening extends Scene {
    constructor(c? : Partial<SceneOpening>) {
        super(c);
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.children = new Array<ChildComponent>();
    }
    

    public async init(): Promise<void> {
        await super.init();
    
        let destSceneName = '';

        const opEvent = new EventManager();
        opEvent.setScene(this);
        opEvent.setEventId(90001001);
        opEvent.emitEvent();
        const opEventObserver = opEvent.observable;
        opEventObserver.subscribe({
            next: (sceneName) => {
                destSceneName = sceneName;
            },
            complete: () => {
                opEvent.die();
                if (destSceneName != null) {
                    // シーンを生成&移動
                    Game.changeScene(destSceneName);
                }
            }
        });

        // スキップボタン
        const buttonSkip = new UIButton(1, {
            ...ENV.defaultButtonStyle, ...{top: GAME_HEIGHT * 0.6, lineColor: '#06b300', text: 'シーン\nスキップ'}
        });
        const skipObserver = buttonSkip.observable;
        skipObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                Util.ClearEventBuffer();
                this.changeScene('SceneFrontDoor');
                return;
            }
        })
        await this.addObject(buttonSkip, '', LAYER_SCENE_NEAR_UI);
        buttonSkip.x = GAME_WIDTH * 0.975 - ENV.defaultButtonStyle.width;
    }
}