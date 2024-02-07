import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import * as Util from 'ts/Util/Util';
import { GameComponentContainer, IGameComponent } from '../Engine/Core/IGameComponent';
import { Game } from '../Engine/Core/Game';
import { ChildComponent, Scene } from '../Engine/Core/Scene';
import { EventManager } from 'ts/Engine/GameComponent/ComponentManager/EventManager';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { ENV, GAME_HEIGHT, GAME_WIDTH } from 'ts/Const';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';

export class SceneEntry extends Scene {
    constructor(c? : Partial<SceneEntry>) {
        super(c);
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.children = new Array<ChildComponent>();
    }

    public async init(): Promise<void> {
        await super.init();        

        /**
         * 白背景
         */
        const bg = new SimplePixiObject(
            { 
                renderObject: new PIXI.Graphics()
                .beginFill('#ffffff')
                .drawRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 0)
            }
        )
        await this.addObject(bg, 'bg', 0);


        /**
         * タイトルスプライト
         */
        const titleSpriteAlias = 'ui_title';
        TextureRepository.instance.register(titleSpriteAlias);
        await TextureRepository.instance.load();
        const titleSprite = new SimplePixiObject(
            { renderObject:PIXI.Sprite.from( TextureRepository.instance.get(titleSpriteAlias) ) }
        );
        await this.addObject(titleSprite, 'title', 10);
        titleSprite.x = GAME_WIDTH * 0.1;
        titleSprite.y = GAME_HEIGHT * 0.2;



        // ボタンコンテナ
        const buttonContainer = new GameComponentContainer();


        const buttonStyle = {
            textStyle: {fontSize: 40, fontFamily:'Notosansjp Medium'} as PIXI.TextStyle,
            lineColor: '#000000', lineThickness: 0, width: 50 * 4, height: 65 
        }

        /**
         * はじめからボタン
         */
        const buttonStart = new UIButton(1, {
            ...ENV.defaultButtonStyle, 
            ...buttonStyle,
            ...{ text: 'はじめから' }    
        });
        const buttonStartObserver= buttonStart.observable;
        buttonStartObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                this.setDisabledAllButtons();

                // オープニングシーン
                this.changeScene('SceneOpening');

                this.setEnabledAllButtons();
            }
        })
        await this.addObject(buttonStart, 'button_start', 1);
        buttonContainer.addChild(buttonStart);
        buttonStart.y = 0;


        

        /**
         * つづきからボタン
         */
        const buttonLoad = new UIButton(1, {
            ...ENV.defaultButtonStyle,
            ...buttonStyle,
            ...{ text: 'つづきから' }
        });
        const buttonLoadObserver= buttonLoad.observable;
        buttonLoadObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                this.setDisabledAllButtons();

                // ロード処理
                const destSceneName = Util.LoadGame();
                if (destSceneName != '') {
                    this.changeScene(destSceneName, {isLoadedGame: true});
                }

                this.setEnabledAllButtons();
            }
        })
        await this.addObject(buttonLoad, 'button_load', 1);
        buttonContainer.addChild(buttonLoad);
        buttonLoad.y = 150;

        buttonContainer.x = GAME_WIDTH * 0.85 - buttonContainer.width;
        buttonContainer.y = GAME_HEIGHT * 0.6; 
    }

}