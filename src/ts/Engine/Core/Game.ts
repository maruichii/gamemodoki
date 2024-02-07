import * as Util from '../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import { gsap } from "gsap";
import { GameComponentContainer, GameComponentState, IGameComponent } from './IGameComponent';
import { FlagManager } from './FlagManager';
import { Scene } from './Scene';
import { Base, Heroine, ParameterManager, Player } from './ParameterManager';
import { SceneBad1 } from 'ts/Scene/Scene_Bad1';
import { SceneFrontDoor } from 'ts/Scene/SceneFrontDoor';
import { ITweenPIXISprite } from 'ts/Engine/Core/ITweenDisplayObject';
import { SceneWIP } from 'ts/Scene/Scene_WIP';
import { SceneGenkan } from 'ts/Scene/SceneGenkan';
import { SceneSimpleEvent } from 'ts/Scene/SceneSimpleEvent';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { CTEXT, ENV, GAME_HEIGHT, GAME_WIDTH, LAYER_SYSTEM } from 'ts/Const';
import { UILabel } from 'ts/Engine/GameComponent/UI/UILabel';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';
import { SceneOpening } from 'ts/Scene/SceneOpening';

// register the plugin
gsap.registerPlugin(PixiPlugin);


export const K_STATUS = {
    PRESS: 1,
    RELEASE: 0,
    PENDING: -1,
    WAIT: -2
}

export class Game {

    private static _instance: Game;

    /**
     * 画面系
     */
    public width : number;      // 画面幅
    public height : number;     // 画面高さ

    // private loader? : PIXI.Loader;  // 画像リソースローダー      →  Assets に統合
    
    private _textures?: Map<string, PIXI.Texture>;   // テクスチャリポジトリ
    public app?: PIXI.Application;                  // 描画エリア
    public static readonly fps: number = 30;        // ゲームのFPS
    public  gameHtmlElmId: string = 'game';         // 描画領域のHTMLエレメントID
    private _gameHtmlElm: HTMLElement;               // 描画領域のHTMLエレメント

    private _loadingScreen: ITweenPIXISprite;


    /**
     * システム系
     */
    private isContinue: boolean;                    // セーブデータを読み込むか(インスタンス化する際に指定)
    
    private _flagManager: FlagManager = new FlagManager();                    // フラグ管理クラス
    private _parameterManager: ParameterManager = new ParameterManager();     // パラメーター管理クラス
    private _sysDataManager: SystemDataManager = new SystemDataManager();

    public static dateInstance: Date = new Date();  // 日付管理用
    public static startTime: number;                // 起動時間
    public static prevFrameTime: number;            // 直前フレームにフレームがアップデートされた時間
    public static prevFixedUpdateTime: number;      // 直前の固定フレームがアップデートされた時間
    public static currentTime: number;              // 現在の時間

    private static _keyPress = {};                   // キー押しっぱなし格納用
    private static _keyPressStartTime = {};          // キー押しっぱなし開始時間
    private static _keyPressDuration = {};           // キー押しっぱなし時間
    private static _keyDown = {};                    // キー押下(1度)格納用
    private static _isStopKeyPropagation = false;    // キー入力を下位コンポーネントへ伝播するかどうかのフラグ
    

    private pause = false;      // ゲームの一時停止フラグ
    private ticker: number;     // setIntervalのタイマーID


    /**
     * シーン関連
     */
    private sceneList?: Map<string, Scene>;         // シーン(コンポーネントの集まり)のリスト
    private activeScene?: [string, Scene];          // 現在動いているシーン


    constructor(c? : Partial<Game>) {
        if (!Game._instance) {
            Object.assign(this, c);

             // private loader? : PIXI.Loader;  // 画像リソースローダー      →  Assets に統合
            this._textures = new Map<string, PIXI.Texture>();

            // ビュー(PIXI.Application)の初期化
            this.app = new PIXI.Application({
                width: this.width, height: this.height,
                backgroundColor: '#ffffff',
                // backgroundColor: 0xe0e0e0,
                // backgroundColor: 0x420036,   // あずき色
                resolution: window.devicePixelRatio || 1,
                antialias: true
            });
            
            this.sceneList = new Map<string, Scene>();  // シーンリスト初期化
            this.activeScene = null;

            this._loadingScreen = PIXI.Sprite.from('/loading.png');
            this._loadingScreen.alpha = 0;

            // ゲーム全体のタイマー初期化
            Game.startTime = Game.dateInstance.getTime();
            Game.currentTime = Game.dateInstance.getTime();
            Game.prevFrameTime = 0;
            Game.prevFixedUpdateTime = 0;

            Game._instance = this;
        }
        else {
            return Game._instance;
        }

        // HTMLに追加
        let gameEl: HTMLElement = document.getElementById(this.gameHtmlElmId);
        this._gameHtmlElm = gameEl;
        gameEl.innerHTML = '';
        gameEl.appendChild(this.app.view as HTMLCanvasElement);

        window.addEventListener('keydown', Game.onKeyDown);
        window.addEventListener('keyup', Game.onKeyUp);


        if (this.isContinue) {
            this.loadGame();
        }
        else {
            this.newGame();
        }

    }

    public static get instance(): Game {
        if (Game._instance) {
            return Game._instance
        }
        else {
            throw new Error(this.constructor.name + ':ゲーム未初期化');
            return null;
        }
    }

    public loadGame():void {

    }

    public newGame():void {

    }

 
    public startGame():void {
        if (this.activeScene) {
            this.loop();
        }
        else {
            console.log('シーンがないよ');
        }
    }

    public pauseGame():void {
        clearInterval(this.ticker);
    }

    public resumeGame():void {
        if (this.activeScene) {
            this.loop();
        }
    }


    /**
     *  fixedUpdate()とupdate()を呼ぶだけ
     */
    public async loop():Promise<void> {
        if (this.activeScene) {
            this.fixedUpdate();
            this.update();
        }
        else {
            console.log('シーンがセットされてないです');
        }
    }

    /**
     * フレームごとに回す
     */
     public async update():Promise<void> {
        // シーンの固定フレーム更新
        if (Game.currentTime - Game.prevFrameTime > (1.0 / Game.fps * 1000) ) {
            Game.prevFrameTime = Game.currentTime;
            await this.activeScene[1].doUpdate();
            await this.activeScene[1].afterUpdate();
            Game._keyDown = {};              // キーを押してない → 押したの状態をリセット
        }
        await Util.sleep(1);
        Game.resetKeyPropagation();     // キーボード入力の伝播停止解除
        this.update();
    }

    /**
     * 一定周期で回す
     */
    public async fixedUpdate():Promise<void> {
        // ゲーム内現在時刻更新
        Game.dateInstance = new Date();
        Game.currentTime = Game.dateInstance.getTime();
        if (Game.currentTime - Game.prevFixedUpdateTime >  10 ) {
            Game.prevFixedUpdateTime = Game.currentTime;
            await this.activeScene[1].doFixedUpdate();
            await this.activeScene[1].afterUpdate();
        }

        // シーンの更新
        await Util.sleep(1);
        this.fixedUpdate();
    }

    
    /**
     * アクティブシーン初期化 
     */
    public async initScene():Promise<void> {
        await this.activeScene[1].init();     // this.activeScene[1]:Scene
        await this.activeScene[1].start(); 
        this.app.stage.addChild(this.activeScene[1].renderObject);
    }

    public async startScene(): Promise<void> {
        
    }

    /**
     * シーン追加 
     */
    public addScene(key: string, newScene: Scene):void {
        this.sceneList.set(key, newScene);
    }

    /**
     * シーン遷移(遷移前シーンは削除)
     */
    public async setActiveScene(key: string):Promise<void> {
        const prevActiveKey = this.activeScene ? this.activeScene[0] : null; 
        if (this.sceneList.has(key)) {

            if (this.activeScene != null && this.activeScene[1] != null) {
                // アクティブシーンがあるならステージから削除
                this.app.stage.removeChild(this.activeScene[1].renderObject);
            }

            this.activeScene = [key, this.sceneList.get(key)];
            if (prevActiveKey) {
                await Promise.all(
                    [
                        this.startTransitScene(),
                        // 直前シーンを削除
                        this.destoryScene(prevActiveKey)
                    ]
                );
            }
            else {
                await this.startTransitScene()
            }

            await this.initScene();
            await this.endTransitScene();
        }
        else {
            throw new Error(this.constructor.name + ':シーンがないです');
        }
    }

    /**
     * 遷移開始
     */
    public startTransitScene(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.app.stage.addChild(this._loadingScreen);
            this._loadingScreen.tween = gsap.to(
                this._loadingScreen, 
                0.5,
                { 
                    pixi: {
                        alpha: 1
                    },
                    ease: "power2.inOut",
                    onComplete: () => { resolve(); }
                }
            );
        });
    }

    /**
     * 遷移完了
     */
    public endTransitScene(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.app.stage.addChild(this._loadingScreen);
            this._loadingScreen.tween = gsap.to(
                this._loadingScreen, 
                0.5,
                { 
                    pixi: {
                        alpha: 0
                    },
                    ease: "power2.inOut",
                    onComplete: () => { 
                        this.app.stage.removeChild(this._loadingScreen);
                        resolve(); 
                    }
                }
            );
        });
        
    }

    /**
     * シーンKill
     */
    public async destoryScene(key: string): Promise<void> {
        if (this.sceneList.has(key) && 
            (this.activeScene == null || this.activeScene[0] !== key)
        ) {
            // アクティブシーンが null → 消していい
            // アクティブシーンと key が被ってない → 消していい
            let delScene = this.sceneList.get(key);
            this.app.stage.removeChild(delScene.renderObject);
            await delScene.die();
            this.sceneList.delete(key);
        }
    }



    /**
     * キーの状態(押されてる:1, 押されてない:0, 取得出来ない:-1)
     * @param code キーコード 'KeyZ' とか 'ArrowUp' とか
     */
    public static getKey(code: string): number {
        // どこかでstopKeyPropagationされてたら値は読めない
        if (!Game._isStopKeyPropagation && Game._keyPress[code] != undefined) {
            return Game._keyPress[code];
        }
        else {
            return -1;
        }
    }

    /**
     * 特定キーの押しっぱなし時間の取得
     */
    public static getKeyPressDuration(code: string):number {
        if (!Game._isStopKeyPropagation && Game._keyPress[code] != undefined && Game._keyPress[code] == K_STATUS.PRESS) {
            return  Game._keyPressDuration[code];
        }
        else {
            return -1;
        }
    }

    /**
     * キーが押されてない → 押された (1回入力)の取得
     * @param code キーコード 'KeyZ' とか 'ArrowUp' とか
     */
    public static getKeyDown(code: string): number {
        // どこかでstopKeyPropagationされてたら値は読めない
        if (!Game._isStopKeyPropagation && Game._keyDown[code] != undefined) {
            return Game._keyDown[code] == K_STATUS.PRESS ? 1 : 0;
        }
        else {
            return -1;
        }
    }


    private static onKeyDown(e: KeyboardEvent): void {
        if (Game._keyPress[e.code] == undefined || Game._keyPress[e.code] == K_STATUS.RELEASE ) {
            // e.codeが押されてない → 押された の場合のみ 押されたことにする 
            Game._keyDown[e.code] = K_STATUS.PRESS;
        }
        Game._keyPress[e.code] = K_STATUS.PRESS;

        // 押しっぱなし時間の記録
        if (Game._keyPressStartTime[e.code] == undefined || Game._keyPressStartTime[e.code] == 0) {
            Game._keyPressStartTime[e.code] = Game.currentTime;
            Game._keyPressDuration[e.code] = 0;
        }
        else {
            Game._keyPressDuration[e.code] = Game.currentTime - Game._keyPressStartTime[e.code];
        }
        


        // スクロール対策
        switch (e.code) {
            case 'ArrowUp' :
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'Arrowright':
                e.preventDefault();
                break;
            default: 
                break;
        }
    }
    private static onKeyUp(e: KeyboardEvent): void {
        Game._keyPress[e.code] = K_STATUS.RELEASE;
        Game._keyPressStartTime[e.code] = 0;
        Game._keyPressDuration[e.code] = 0;
    }
    public static stopKeyPropagation(): void {
        Game._isStopKeyPropagation = true;
    }
    public static resetKeyPropagation(): void {
        Game._isStopKeyPropagation = false;
    }



    /**
     * 指定したクラス名のシーンに遷移
     * @param sceneName 
     */
    public static async changeScene(sceneName: string = null, c: Object = {}): Promise<void> {
        let scene:Scene = null;
        if (sceneName != null) {
            switch(sceneName) {
                case 'SceneWIP': 
                    scene = new SceneWIP(c);
                    break;
                case 'SceneBad1': 
                    scene = new SceneBad1(c);
                    break;
                case 'SceneFrontDoor':
                    scene = new SceneFrontDoor(c);
                    break;

                case 'SceneGenkan':
                    scene = new SceneGenkan(c);
                    break;

                case 'SceneSimpleEvent':
                    scene = new SceneSimpleEvent(c);
                    break;

                case 'SceneOpening':
                    scene = new SceneOpening(c);
                    break;

                default:
                    throw new Error(this.constructor.name + ': 指定された名前のシーンは存在しない:' + sceneName);
                    break;
            }
            let sceneId = 'scene' + Math.floor(Math.random() * 100000 - 10000) + 10000;
            this.instance.addScene(sceneId, scene);
            await this.instance.setActiveScene(sceneId);
        }
        else {
            throw new Error(this.constructor.name + ': シーン名が未指定');
        }
    }




    /**
     * ダイアログ表示
     */
    public async showDialog(label: string = '', options: Array<string>, 
                            next?:(selectedIdx: number) => void, 
                            complete?:() => void, 
                            error?:(err: any) => void )
                        : Promise<void> 
    {
        if (this.activeScene[1] != undefined && this.activeScene[1] != null) {

            const scene = this.activeScene[1];
            const dialogComponentList: Array<IGameComponent> = [];

            const dialogWidthRatio = 0.5;
            const buttonWidthRatio = (1.0 / options.length) - 0.05; 
            
            // アクティブシーンへダイアログを表示する
            const container = new GameComponentContainer();

            /**
             * 背景(他のボタンを押せないように)
             */
            const modalBg = new SimplePixiObject({
                renderObject: new PIXI.Graphics()
                .beginFill('#ffffff88')
                .drawRoundedRect(0, 0, GAME_WIDTH, GAME_HEIGHT, 0)
            })
            await scene.addObject(modalBg, 'ダイアログ背景', LAYER_SYSTEM);
            modalBg.renderObject.interactive = true;

            dialogComponentList.push(modalBg);


            /**
             * 枠
             */
            const dialogFrame = new SimplePixiObject({
                renderObject: new PIXI.Graphics()
                .beginFill('#0c1018ec')
                .drawRoundedRect(0, 0, GAME_WIDTH * dialogWidthRatio, GAME_HEIGHT * 0.35, 16)
            })
            await scene.addObject(dialogFrame, 'ダイアログ枠', LAYER_SYSTEM);
            container.addChild(dialogFrame);
            dialogComponentList.push(dialogFrame);
           
            
            /**
             * ラベル
             */
            const saveConfirmLabel = new UILabel({
                width: dialogWidthRatio * GAME_WIDTH,
                height: 0.1 * GAME_HEIGHT,
                backgroundColor: '#000000',
                backgroundAlpha: 0,
                lineColor: '#000000',
                lineThickness: 2,
                text: label,
                textStyle: {...ENV.defaultTextStyle, ...{ fontSize:30, fill: '#ffffff', strokeThickness: 0}} as PIXI.TextStyle
            });
            await scene.addObject(saveConfirmLabel, 'ダイアログラベル', LAYER_SYSTEM + 1);
            saveConfirmLabel.x = 0;
            saveConfirmLabel.y = 30;
            container.addChild(saveConfirmLabel);
            dialogComponentList.push(saveConfirmLabel);



            // 選択肢の数分のストリームをマージ
            const observalbes = options.map( (option:string, index:number) => {
                /**
                 * ボタン表示
                 */
                let button = new UIButton( index, {
                    isOnce: true,
                    // ダイアログ幅 × 0.9 × (ボタン％)  1個: 100%, 2個: 47.5%
                    width: dialogWidthRatio * GAME_WIDTH * 0.9 * buttonWidthRatio,
                    height: 0.1 * GAME_HEIGHT,
                    top: 0.175 * GAME_HEIGHT,
                    left: ( (dialogWidthRatio * 0.9 * buttonWidthRatio + 0.05) * GAME_WIDTH  ) * index + dialogWidthRatio * GAME_WIDTH * 0.05,
                    backgroundColor: '#ffffff',
                    text: option,
                    textStyle: { ...ENV.defaultTextStyle, ...{fontSize: 21, fontFamily:'Notosansjp Bold', fill: '#2e2e2e', strokeThickness: 0}} as PIXI.TextStyle
                });
                scene.addObject(button, 'ダイアログボタン' + index , LAYER_SYSTEM + index + 2);
                container.addChild(button);
                dialogComponentList.push(button);

                // ストリームを返す
                return button.observable;
            });


            // コンテナ位置調整
            container.x = (GAME_WIDTH - container.width) / 2;
            container.y = (GAME_HEIGHT - container.height) / 2;


            const mergedButtonRace$ = Rx.race(...observalbes);

            mergedButtonRace$.subscribe({
                next: buttonIndex => {
                    next(buttonIndex);  // コールバック
                },
                error: err => { 

                    error(err) 
                },
                complete: () => {
                    // ダイアログコンポーネント削除
                    for (const c of dialogComponentList) {
                        c.state = GameComponentState.die;
                    }
                    complete(); // コールバック
                }
            })
        }
    }

}