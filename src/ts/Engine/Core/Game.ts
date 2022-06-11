import * as Util from '../Util/Util';
import * as PIXI from 'pixi.js';
import { IGameComponent } from './IGameComponent';
import {Scene} from './Scene';

export const K_STATUS = {
    PRESS: 1,
    RELEASE: 0,
    PENDING: -1,
    WAIT: -2
}

export class Game {

    private static _instance: Game;

    public width : number;
    public height : number;
    private loader? : PIXI.Loader;
    private textures?: Map<string, PIXI.Texture>;
    public app?: PIXI.Application;

    public static readonly fps: number = 30;       // ゲームのFPS
    public static dateInstance: Date = new Date();
    public static startTime: number;
    public static prevFrameTime: number;
    public static prevFixedUpdateTime: number;
    public static currentTime: number;

    private static keyPress = {};
    private static keyDown = {}
    private static isStopKeyPropagation = false;

    private sceneList?: Map<string, Scene>;
    private activeScene?: [string, Scene];

    private pause = false;
    private ticker: number; // setIntervalのタイマーID

    public  gameHtmlElmId: string = 'game';
    private gameHtmlElm: HTMLElement;


    constructor(c? : Partial<Game>) {
        if (!Game._instance) {
            Object.assign(this, c);

            this.loader = new PIXI.Loader();
            this.textures = new Map<string, PIXI.Texture>();

            // ビュー(PIXI.Application)の初期化
            this.app = new PIXI.Application({
                width: this.width, height: this.height,
                backgroundColor: 0xe0e0e0,
                // backgroundColor: 0x420036,   // あずき色
                resolution: window.devicePixelRatio || 1,
            });

            this.sceneList = new Map<string, Scene>();  // シーンリスト初期化
            this.activeScene = null;

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
        this.gameHtmlElm = gameEl;
        gameEl.innerHTML = '';
        gameEl.appendChild(this.app.view);

        window.addEventListener('keydown', Game.onKeyDown);
        window.addEventListener('keyup', Game.onKeyUp);
    }

    public static get instance(): Game {
        if (Game._instance) {
            return Game._instance
        }
        else {
            throw ('ゲーム未初期化');
            return null;
        }
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
     *  fixedUpdate()とfixedUpdate()を呼ぶだけ
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
            Game.keyDown = {};              // キーを押してない → 押したの状態をリセット
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
        }

        // シーンの更新
        await Util.sleep(1);
        this.fixedUpdate();
    }

    

    public async initScene():Promise<void> {
        await this.activeScene[1].init();     // this.activeScene[1]:Scene
        await this.activeScene[1].start(); 
        this.app.stage.addChild(this.activeScene[1].renderObject);
    }

    public addScene(key: string, newScene: Scene):void {
        this.sceneList.set(key, newScene);
    }

    public async setActiveScene(key: string):Promise<void> {
        if (this.sceneList.has(key)) {
            if (this.activeScene != null && this.setActiveScene[1] != null) {
                this.app.stage.removeChild(this.activeScene[1].renderObject);
            }
            this.activeScene = [key, this.sceneList.get(key)];
            this.startTransitScene();
            await this.initScene();
            this.endTransitScene();
        }
        else {
            throw new Error('シーンがないです');
        }
    }

    public startTransitScene():void {

    }
    public endTransitScene():void {

    }



    /**
     * キーの状態(押されてる:1, 押されてない:0, 取得出来ない:-1)
     * @param code キーコード 'KeyZ' とか 'ArrowUp' とか
     */
    public static getKey(code: string): number {
        // どこかでstopKeyPropagationされてたら値は読めない
        if (!Game.isStopKeyPropagation && Game.keyPress[code] != undefined) {
            return Game.keyPress[code];
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
        if (!Game.isStopKeyPropagation && Game.keyDown[code] != undefined) {
            return Game.keyDown[code] == K_STATUS.PRESS ? 1 : 0;
        }
        else {
            return -1;
        }
    }

    private static onKeyDown(e: KeyboardEvent): void {
        if (Game.keyPress[e.code] == undefined || Game.keyPress[e.code] == K_STATUS.RELEASE ) {
            // e.codeが押されてない → 押された の場合のみ 押されたことにする 
            Game.keyDown[e.code] = K_STATUS.PRESS;
        }
        Game.keyPress[e.code] = K_STATUS.PRESS;


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
        Game.keyPress[e.code] = K_STATUS.RELEASE;
    }
    public static stopKeyPropagation(): void {
        Game.isStopKeyPropagation = true;
    }
    public static resetKeyPropagation(): void {
        Game.isStopKeyPropagation = false;
    }


     /**
     * 指定したurlの画像からテクスチャを生成してグローバルなMapにセット
     * @param {string} name 
     * @param {string} url
     */
      public loadTexture(name:string, url: string):void {
        this.loader.add(name, url)
    }

    public async asyncMethod(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true);
        })
    }

}