import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import { IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { SerifWindow } from '../Engine/GameComponent/UI/UIWindow';
import { TextureRepository } from '../Repository/TextureRepository';
import { SequenceRepository } from '../Repository/SequenceRepository';
import { EmptyComponent } from '../Engine/GameComponent/Misc/EmptyComponent';
import { EventCharaStage, CharaStageSequence } from '../Engine/GameComponent/CharaStage';
import { SequenceManager } from '../Engine/GameComponent/ComponentManager/SequenceManager';
import { EventManager } from '../Engine/GameComponent/ComponentManager/EventManager';
import { COMEVENT_BASEID, ENV, GAME_HEIGHT } from 'ts/Const';

import * as Util from '../Util/Util';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';

export class SceneWIP extends Scene {
    constructor(c? : Partial<SceneWIP>) {
        super(c);
    }

    public async init(): Promise<void> {
        // SceneのinitにPIXI.Loaderを使ってる各Repogitoryのload()を組み込みましょう
        await super.init();
        
        const eventManger = new EventManager();
        eventManger.setScene(this);
        eventManger.setEventId(99001000);
        // await Util.sleep(3000);
        eventManger.emitEvent();


        // スキップボタン
         const buttonSkip = new UIButton(1, {
            ...ENV.defaultButtonStyle, ...{top: GAME_HEIGHT * 0.6, lineColor: '#06b300', text: 'シーン\n繰り返し'}
        });
        const skipObserver = buttonSkip.observable;
        skipObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                Game.changeScene('SceneFrontDoor');
                return;
            }
        })
        this.addObject(buttonSkip);
    }

}