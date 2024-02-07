import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { GameComponent, GameComponentState, IGameComponent, ISequenceActor, ISteppableComponent, ISteppableComponentDelegate } from '../Core/IGameComponent';
import { ITweenPIXIGraphics, ITweenPIXISprite } from '../Core/ITweenDisplayObject';
import { BackgroundConfig, Sequence, TRANSITION_TYPE } from "ts/Repository/EventRepository";
import { TextureRepository } from "ts/Repository/TextureRepository";
import { Game } from "ts/Engine/Core/Game";
import { GameSound } from "ts/Engine/GameComponent/GameSound";


// register the plugin
gsap.registerPlugin(PixiPlugin);

export type BackgroundSequence = Array<BackgroundConfig>;


export class Background extends GameComponent {
    public alias: string;
    public screen: ITweenPIXIGraphics;      // 背景切り替え時のスクリーン
    public touchScreen: PIXI.Graphics;      // クリックイベント受ける用
    public currentBackground: ITweenPIXISprite = new PIXI.Sprite();
    public nextBackground: ITweenPIXISprite = null;
    public transition: TRANSITION_TYPE = TRANSITION_TYPE.NONE;

    public renderObject: PIXI.Container;

    protected _masterVol: number;
    protected _seVol: number;
    protected _bgmVol: number;


    /**
     * コンストラクタではなくこれでインスタンス生成する
     * @param alias 背景画像のエイリアス
     * @returns 
     */
    public static async build(alias: string, isInteractive:boolean = false):Promise<Background> {
        const s = new Background(isInteractive);
        let c = new PIXI.Sprite();
        TextureRepository.instance.register(alias);
        try {
            await TextureRepository.instance.load();
            c = PIXI.Sprite.from(TextureRepository.instance.get(alias));
            c.zIndex = 10;
        }
        catch(e) {
            console.log(e);
        }

        const aspectRatio = c.texture.width / c.texture.height;
        const game = Game.instance;
        if (game.width / game.height > aspectRatio) {
            // ステージの幅がアスペクト比よりも広い場合
            c.width = game.height * aspectRatio;
            c.height = game.height;
        } else {
            // ステージの高さがアスペクト比よりも広い場合
            c.width = game.width;
            c.height = game.width / aspectRatio;
        }

        c.anchor.set(0.5);
        c.x = game.width / 2;
        c.y = game.height / 2;

        s.currentBackground = c;
        s.renderObject.addChild(c);
        s.state = GameComponentState.ready;

        console.log(c);

        return s;
    }

    
    protected constructor(isInteractive: boolean = false) {
        super();
        const game = Game.instance;

        const container = new PIXI.Container();
        container.width = game.width;
        container.height = game.height;
        container.x = 0
        container.y = 0;
        container.sortableChildren = true;
        this.renderObject = container;

        this.screen = new PIXI.Graphics()
        .beginFill(0x000000)
        .drawRect(0, 0, game.width, game.height)
        .endFill();
        this.screen.alpha = 0;
        this.screen.zIndex = 1000;
        this.renderObject.addChild(this.screen);


        this.touchScreen = new PIXI.Graphics()
        .beginFill(0xffffff, 0.0001)     // ほぼ透明
        .drawRect(0, 0, game.width, game.height)
        .endFill();
        this.touchScreen.zIndex = 100;
        this.touchScreen.interactive = isInteractive;
        this.touchScreen.cursor = 'pointer';
        this.renderObject.addChild(this.touchScreen);

        this.touchScreen.on('pointertap', this.onTap.bind(this));
    }

    set interactive(value: boolean) {
        this.touchScreen.interactive = value;
    }

    public setScreenColor(color: number, alpha: number = 1.0) {
        const game = Game.instance;
        const newScreen = new PIXI.Graphics()
        .beginFill(color, alpha)
        .drawRect(0, 0, game.width, game.height)
        .endFill();
        newScreen.alpha = 0;
        newScreen.zIndex = 1000;

        this.renderObject.addChild(newScreen);
        this.renderObject.removeChild(this.screen);
        this.screen.destroy();
        this.screen = newScreen;
    }   

    public async setCurrent(alias: string): Promise<void> {
        let n = new PIXI.Sprite();
        TextureRepository.instance.register(alias);
        try {
            await TextureRepository.instance.load();
            n = PIXI.Sprite.from(TextureRepository.instance.get(alias));
        }
        catch(e) {
            console.log(e);
        }

        const aspectRatio = n.texture.width / n.texture.height;
        const game = Game.instance;
        if (game.width / game.height > aspectRatio) {
            // ステージの幅がアスペクト比よりも広い場合
            n.width = game.height * aspectRatio;
            n.height = game.height;
        } else {
            // ステージの高さがアスペクト比よりも広い場合
            n.width = game.width;
            n.height = game.width / aspectRatio;
        }

        n.anchor.set(0.5);
        n.x = game.width / 2;
        n.y = game.height / 2;
        n.zIndex = 10;
        this.renderObject.addChild(n);
        this.renderObject.removeChild(this.currentBackground);
        this.currentBackground.destroy();

        this.currentBackground = n;
    }

    public async setNext(alias: string): Promise<void> {
        let n = new PIXI.Sprite();
        TextureRepository.instance.register(alias);
        try {
            await TextureRepository.instance.load();
            n = PIXI.Sprite.from(TextureRepository.instance.get(alias));
        }
        catch(e) {
            console.log(e);
        }

        const aspectRatio = n.texture.width / n.texture.height;
        const game = Game.instance;
        if (game.width / game.height > aspectRatio) {
            // ステージの幅がアスペクト比よりも広い場合
            n.width = game.height * aspectRatio;
            n.height = game.height;
        } else {
            // ステージの高さがアスペクト比よりも広い場合
            n.width = game.width;
            n.height = game.width / aspectRatio;
        }

        n.anchor.set(0.5);
        n.x = game.width / 2;
        n.y = game.height / 2;
        this.nextBackground = n;
    }

    public async changeNext(duration: number = 1.0): Promise<void> {

        return new Promise((resolve, reject) => {
            if (this.state === GameComponentState.ready) {
                this.state = GameComponentState.suspended;

                // 遷移開始(背景隠す)
                this.screen.tween = gsap.to(
                    this.screen, 
                    duration,
                    { 
                        pixi: {
                            alpha: 1
                        },
                        ease: "power2.inOut",
                        onComplete: () => {
                            changeNextCallback.bind(this).call();
                            resolve();
                        }
                    }
                );


                function changeNextCallback() {
                    if (this.nextBackground != null) {
                        this.renderObject.addChild(this.nextBackground);
                        this.renderObject.removeChild(this.currentBackground);
                        this.currentBackground.destroy();

                        this.currentBackground = this.nextBackground;
                        this.currentBackground.zIndex = 10;
                        this.nextBackground = null;
                    }
                    // 遷移終了(背景復帰)
                    this.screen.tween = gsap.to(
                        this.screen, 
                        duration,
                        { 
                            pixi: {
                                alpha: 0
                            },
                            ease: "power2.inOut",
                        }
                    );

                    this.state = GameComponentState.ready;  // HACK: onCompleteでやった方がいいかも
                }

            }
            else {
                resolve();
            }
        })
    }


    public async onTap(e: PIXI.FederatedPointerEvent):Promise<void> {
        const se = await GameSound.build('se_tap');
        se.play();
        this.changeNext();
    }

    public async die(): Promise<void> {
        [this.screen, this.touchScreen].map((_) => {
            if (_ != null && _.destroyed == false) {
                _.clear();
                _.destroy();
            }
        });

        [this.currentBackground, this.nextBackground].map((_) => {
            if (_ != null && _.destroyed == false) {
                _.destroy();
            }
        });
        this.state = GameComponentState.die;
        return;
    }
}


export class SequentialBackground extends Background implements ISteppableComponent, ISequenceActor {

    public steppableComponentDelegate?: ISteppableComponentDelegate;

    public isWaitNext: boolean = true;

    private _sequence: BackgroundSequence;
    private _sequenceCursor: number = 0;
    private _aliasList: Array<String> = new Array<string>();

    public static async build(alias:string = null, isInteractive:boolean = false): Promise<SequentialBackground> {
        const s = new SequentialBackground(isInteractive);

        if (alias != null && alias != '') {
            let c = new PIXI.Sprite();
            TextureRepository.instance.register(alias);
            try {
                await TextureRepository.instance.load();
                c = PIXI.Sprite.from(TextureRepository.instance.get(alias));
                c.zIndex = 10;
            }
            catch(e) {
                console.log(e);
            }
    
            const aspectRatio = c.texture.width / c.texture.height;
            const game = Game.instance;
            if (game.width / game.height > aspectRatio) {
                // ステージの幅がアスペクト比よりも広い場合
                c.width = game.height * aspectRatio;
                c.height = game.height;
            } else {
                // ステージの高さがアスペクト比よりも広い場合
                c.width = game.width;
                c.height = game.width / aspectRatio;
            }
    
            c.anchor.set(0.5);
            c.x = game.width / 2;
            c.y = game.height / 2;
    
            s.currentBackground = c;
            s.renderObject.addChild(c);
        }
        s.state = GameComponentState.ready;

        return s;
    }

    protected constructor(isInteractive:boolean = false) {
        super(isInteractive);
    }



    public async setSequence(sequence: Sequence): Promise<void> {
        let backgroundSequence = sequence.map((s) => s.background) as BackgroundSequence;    // キャラシーケンスに変換
        this._sequence = backgroundSequence;
        this._sequenceCursor = 0;
        
        this._aliasList = [];
        backgroundSequence.map((m) => {
            if (m != undefined && m.alias !== undefined && m.alias != null) {
                this._aliasList.push(m.alias);
            }
        })
        Object.keys(this._aliasList).map( (id) => {
            TextureRepository.instance.register(id);
        })

        await TextureRepository.instance.load();
        this.state = GameComponentState.ready;

        return null;
    }

    public setSteppableComponentDelegate(d: ISteppableComponentDelegate): void {
        this.steppableComponentDelegate = d;
    }

    public async flushCurrent(): Promise<void> {
        return;   
    }

    public async stepNext(): Promise<void> {
        if (this.checkIsSequenceEnd()) {
            // 終了
            return;
        }

        const next = this._sequence[this._sequenceCursor];
        if (next === undefined) {
            // 何もしない
            this._sequenceCursor++;
            return;
        }



        else if (next === null) {
            // 表示消す
            this.nextBackground = new PIXI.Sprite();
            this.changeNext();
        }

        else {
            if (next.screenColor != undefined) {
                this.setScreenColor(next.screenColor);
            }

            if (this._sequenceCursor == 0) {
                await this.setCurrent(next.alias);
            }
            else {
                await this.setNext(next.alias);
                this.changeNext();
            }            
        }

        this._sequenceCursor++;
    }

    private checkIsSequenceEnd() {
        if ( this._sequenceCursor >= this._sequence.length) {
            return true;    
        }
        else {
            return false;
        }
    }


    public async onTap(e: PIXI.FederatedPointerEvent): Promise<void> {
        this.onNext();
    }

    public onNext?(): void {
        if (this.steppableComponentDelegate) {
            this.steppableComponentDelegate.handleNext({sound: true});
        }
        else {
            this.stepNext();
        }
    }


    public async die(): Promise<void> {
        [this.screen, this.touchScreen].map((_) => {
            if (_ != null && _.destroyed == false) {
                _.clear();
                _.destroy();
            }
        });

        [this.currentBackground, this.nextBackground].map((_) => {
            if (_ != null && _.destroyed == false) {
                _.destroy();
            }
        });

        this.state = GameComponentState.die;
        return;
    }
    
}