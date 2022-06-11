import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import { IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { SerifWindow } from '../Engine/GameComponent/UI/UIWindow';
import { TextureRepository } from '../Repository/TextureRepository';
import { SequenceRepository } from '../Repository/SequenceRepository';
import { EmptyComponent } from '../Engine/GameComponent/Misc/EmptyComponent';
import { CharaStage, CharaStageSequence } from '../Engine/GameComponent/CharaStage';
import { SequenceManager } from '../Engine/GameComponent/ComponentManager/SequenceManager';

export class EntryScene extends Scene {
    constructor(c? : Partial<EntryScene>) {
        super(c);
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.objectList = new Array<ChildComponent>();
    }

    public async init(): Promise<void> {

        let sequenceManater = new SequenceManager();   // 会話シーンマネージャー
        let sequence = await SequenceRepository.instance.load(0);

        // キャラお立ち台
        let charaStage = new CharaStage();
        this.addObject(charaStage);
        let charaSequence = sequence.map((s) => s.chara);
        charaStage.setSequence(charaSequence as CharaStageSequence);
        sequenceManater.registerComponent(charaStage);

        // セリフウィンドウ
        let sampleSerifWindow = new SerifWindow({
            width: 1280,
            height: 220,
            center: true,
            bottom: 30,
            backgroundColor: 0x888888,
            textStyle: {
                fontFamily : 'Noto Sans CJK JP, 游ゴシック,Osaka',
                fontWeight: 'bold',
                lineHeight: 36,
                fontSize: 30,
                fill: 0x333333,
                stroke: 0xffffff,
                strokeThickness: 4,
                wordWrap: true,
                breakWords: true
            } as PIXI.TextStyle,
            textSpeed: 200
        });
        this.addObject(sampleSerifWindow, 1000);
        // HACK: くそ
        let text_speakerSequence = ({text: new Array<string>(), speaker: new Array<string>()});
        sequence.map((s) => {
            text_speakerSequence.text.push(s.text); 
            text_speakerSequence.speaker.push(s.speaker);
        });
        sampleSerifWindow.setScriptSequence(text_speakerSequence.text, text_speakerSequence.speaker);
        sequenceManater.registerComponent(sampleSerifWindow);

        // SceneのinitにPIXI.Loaderを使ってる各Repogitoryのload()を組み込みましょう
        await super.init();        
    }

}