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

import * as Util from '../Util/Util';

export class SceneSampleSequence extends Scene {
    constructor(c? : Partial<SceneSampleSequence>) {
        super(c);
    }

    public async init(): Promise<void> {
        // SceneのinitにPIXI.Loaderを使ってる各Repogitoryのload()を組み込みましょう
        await super.init();
        
        const eventManger = new EventManager();
        eventManger.setScene(this);
        eventManger.setEventId(0);
        // await Util.sleep(3000);
        eventManger.emitEvent();
    }

}