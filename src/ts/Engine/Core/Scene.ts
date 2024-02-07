import * as Util from '../../Util/Util';
import * as PIXI from 'pixi.js';
import { TextureRepository } from '../../Repository/TextureRepository';
import { GameComponent, GameComponentState, IGameComponent, IGameComponentDelegate } from './IGameComponent';
import { UIButton } from 'ts/Engine/GameComponent/UI/UIButton';
import { Background } from 'ts/Engine/GameComponent/Background';
import { SimplePixiObject } from 'ts/Engine/GameComponent/Misc/SimplePixiObject';
import { TurnMonitor } from 'ts/Engine/GameComponent/UI/TurnMonitor';
import { MoneryMonitor } from 'ts/Engine/GameComponent/UI/MoneyMonitor';
import { Game } from 'ts/Engine/Core/Game';
import { CTEXT, ENV, GAME_WIDTH, LAYER_SCENE_FAR_UI, LAYER_SCENE_NEAR_UI } from 'ts/Const';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { EventManager } from 'ts/Engine/GameComponent/ComponentManager/EventManager';

export type ChildComponent = {
    label: string,
    order: number,
    component: IGameComponent
}

export class Scene extends GameComponent {
    protected children: Array<ChildComponent>;
    protected textures?: Map<string, PIXI.Texture>;
    public objectLabel: string = '';
    public renderObject: PIXI.Container;

    public isLoadedGame: boolean = false;
    public baseEventId: number;


    protected _buttons: Array<UIButton> = [];
    protected _bgm: GameSound;

    private _reservingRemoveList: Array<string>;

    protected constructor(c? : Partial<Scene>) {
        super();
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.renderObject.sortableChildren = true;
        this.children = new Array<ChildComponent>();
        this._reservingRemoveList = new Array<string>;

        // シーン毎にリセットするパラメータの初期化
        this.ResetSceneUniqueParams();
    }

    public async init():Promise<void> {
        super.init();
        console.log(await TextureRepository.instance.load());
        await Promise.all(this.children.map((o) => o.component.init()));
        this.state = GameComponentState.ready;
    }

    public async start(): Promise<void> {
        await Promise.all(this.children.map((o) => o.component.start()));
        SystemDataManager.instance.sysdata.current_scene = this.constructor.name;

        if (this.isLoadedGame && SystemDataManager.instance.sysdata.current_sequence.length > 0) {
            // ロードしたゲームがイベントの途中だったら復帰する
            await this.resumeLoadedGameEvent();
        }
    }

    renderComponent(): void {
        for (const o of this.children) {
            o.component.renderComponent();
        }
    }

    async die(): Promise<void> {
        await this.children.map(async (c) => {
            Util.recursiveDestroyPixiObject(c.component.renderObject);
            await c.component.die();
            c = null;
        })
        this.renderObject.destroy();
        return;
    }
    async doUpdate(): Promise<void> {
        await Promise.all(this.children.map((o) => {
            if (o.component.state === GameComponentState.ready) {
                o.component.doUpdate();
            }
        }));
    }
    async doFixedUpdate(): Promise<void> {
        await Promise.all(this.children.map((o) => {
            if (o.component.state === GameComponentState.ready) {
                o.component.doFixedUpdate();
            }
        }));
    }

    async afterUpdate(): Promise<void> {
        // 削除予約リストに入っているコンポーネントを削除
        for (const target of this._reservingRemoveList) {
            const indexToRemove = this.children.findIndex((item) => item.label === target);
            if (indexToRemove !== -1) {
                // let child = this.children[indexToRemove]
                // await child.component.die();  // 上からのdie()
                // this.renderObject.removeChildAt(indexToRemove);
                // child.component.renderObject.destroy();
                // child.component = null;
                // this.children.splice(indexToRemove, 1);
                // console.log(target + ' をシーンから削除');

                this.children[indexToRemove].component.state = GameComponentState.die;
            }

            // console.log(this);
            // console.log(this.renderObject.children);
        }
        this._reservingRemoveList = new Array<string>;

        // 自身で削除フラグを立てたコンポーネントを削除
        const newChildren = [];
        for (const child of this.children) {
            if (child.component.state == GameComponentState.die) {
                await child.component.die();
                this.renderObject.removeChild(child.component.renderObject);
                child.component.renderObject.destroy();
                child.component = null;
            }
            else {
                newChildren.push(child);
            }
        }
        this.children = newChildren;
    }

    public async addObject(c : IGameComponent, label:string = '', order: number = 0): Promise<void> {
        if (this.state === GameComponentState.ready) {
            // 既にシーンを初期化済みなら追加コンポーネントはここで初期化する
            // console.log(await TextureRepository.instance.load());
            await c.init();
        }

        c.renderObject.zIndex = order;
        this.children.push({
            label: label ? label : this.children.length.toString(),
            order: order, 
            component: c
        });
        this.children.sort((_, __) => _.order > __.order ? 1 : -1)    // orderで昇順に並び替え
        this.renderObject.addChild(c.renderObject);
        this.renderObject.sortChildren();
    
        // console.log(this.children.map((c) => c.order));
        // console.log(this.renderObject.children);
    }


    /**
     * 子コンポーネントの削除予約
     */
    public removeObjectByLabel(label: string) {
        this._reservingRemoveList.push(label);      
    }



    /**
     * シーン変更
     * @param sceneName:  遷移先シーンクラス名 
     * @param c: Partial<DestScene>  コンストラクタ引数オブジェクト
     */
    protected changeScene(sceneName: string, c?: Object) {
        if (this._bgm != undefined && this._bgm != null) {
            this._bgm.die();
        }
        Game.changeScene(sceneName, c);
    }



    /**
     * 登録されている全ボタンの無効化
     */
    public setDisabledAllButtons() {
        for(const b of this._buttons) {
            b.enabled = false;
        }
    }

    /**
     * 登録されている全ボタンの有効化
     */
    public setEnabledAllButtons() {
        for(const b of this._buttons) {
            b.enabled = true;
        }
    }


    /**
     * ヘッダーUIの表示
     */
    protected async showHeaderUI(): Promise<void> {
        // ヘッダー黒背景
        const headerScreenRect = new PIXI.Graphics()
                                .beginFill('#00000088')
                                .drawRoundedRect(0, 0, Game.instance.width, 70, 0);

        const headerScreen = new SimplePixiObject( {renderObject: headerScreenRect} );
        await this.addObject(headerScreen, '',  LAYER_SCENE_NEAR_UI);
        headerScreen.x = 0;
        headerScreen.y = 0;
        

        // 日数・ターン
        const turnCounter = new TurnMonitor();      // ターン(シーン内時刻)表示
        await this.addObject(turnCounter, '', LAYER_SCENE_NEAR_UI + 1);
        turnCounter.x = 24;
        turnCounter.y = 15;


        // 所持金
        const moneyMonitor = new MoneryMonitor();   // 所持金表示
        await this.addObject(moneyMonitor, '', LAYER_SCENE_NEAR_UI + 2);
        moneyMonitor.x = Game.instance.width - 24;  // 右端位置
        moneyMonitor.y = 15;
        

        // セーブボタン
        const buttonSave = new UIButton(1000, {backgroundSrc: 'button_save'});
        await this.addObject(buttonSave, 'button_save', LAYER_SCENE_FAR_UI + 3)
        buttonSave.x = GAME_WIDTH - buttonSave.renderObject.width - GAME_WIDTH * 0.025;
        buttonSave.y = headerScreen.renderObject.getBounds().height + (Number)(ENV.defaultTextStyle.fontSize) * 0.875;
        this._buttons.push(buttonSave);

        const saveObserver = buttonSave.observable;
        saveObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                this.setDisabledAllButtons();
                // セーブダイアログ
                Game.instance.showDialog(
                    CTEXT.S_SAVECONFIRM, 
                    ['いいえ', 'はい'],
                    async (selected) => {
                        if (selected === 1) {
                            await Util.SaveGame()
                        }
                    },
                    () => {  },
                    (error) => { console.log(this.constructor.name + ':' + error)}
                );
                this.setEnabledAllButtons();
            },
        })
        
        // ロードボタン
        const buttonLoad = new UIButton(1001, {backgroundSrc: 'button_load'});
        await this.addObject(buttonLoad, 'button_load', LAYER_SCENE_FAR_UI + 3)
        buttonLoad.x = GAME_WIDTH - buttonSave.renderObject.width*2.5 - GAME_WIDTH * 0.025;     // セーブボタンと横並び
        buttonLoad.y = headerScreen.renderObject.getBounds().height + (Number)(ENV.defaultTextStyle.fontSize) * 0.875; 
        this._buttons.push(buttonLoad);  

        const loadObserver = buttonLoad.observable;
        loadObserver
        .pipe()
        .subscribe({
            next: (val: number) => {
                this.setDisabledAllButtons();
                // セーブダイアログ
                Game.instance.showDialog(
                    CTEXT.S_LOADCONFIRM, 
                    ['いいえ', 'はい'],
                    async (selected) => {
                        if (selected === 1) {
                            const destSceneName =  Util.LoadGame();
                            if (destSceneName != '') {
                                this.changeScene(destSceneName, {isLoadedGame: true});
                            }
                        }
                    },
                    () => {  },
                    (error) => { console.log(this.constructor.name + ':' + error)}
                );
                this.setEnabledAllButtons();
            },
        })
        
    }




    /**
     * シーン毎パラメータの初期化
     */
    public ResetSceneUniqueParams() {
        if (!this.isLoadedGame) {
            // ロードされたゲームじゃない場合のみ初期化
            ParameterManager.instance.Base.talk_count = 1;
        }
    }


    /**
     * ロードした際のイベント復帰
     */
    protected async resumeLoadedGameEvent(): Promise<void> {


        /**
         * NOTE:
         * 中断イベントの復帰は
         * イベント完了後処理の復帰が難しいのでいったんやめる
         */

        // // イベント発行
        // const evResume = new EventManager({scene: this});

        // evResume.setEvent(
        //     {
        //         sequence: SystemDataManager.instance.sysdata.current_sequence,
        //         sideEffect: SystemDataManager.instance.sysdata.current_sideeffect_list
        //     },
        //     SystemDataManager.instance.sysdata.current_sideeffect_index  
        // );
        // evResume.emitEvent();
        // const eventObserver = evResume.observable;
        // let destSceneName = '';
        // eventObserver.subscribe({
        //     next: (sceneName) => { 
        //         destSceneName = sceneName;
        //     },
        //     complete: async () => {
        //         if (destSceneName != '') {
        //             this.changeScene(destSceneName);
        //         }
        //     }
        // });
    }   
}