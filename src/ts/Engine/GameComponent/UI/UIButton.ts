import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { gsap } from "gsap";
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { ITweenPIXIContainer, ITweenPIXIGraphics, ITweenPIXISprite } from 'ts/Engine/Core/ITweenDisplayObject';


// register the plugin
gsap.registerPlugin(PixiPlugin);


/**
 * UIボタン基底クラス
 */
export class UIButton extends GameComponent implements IContentComponent {

    public  _delegate: IGameComponentDelegate;  // 使わない 

    private _buttonIndex: number;
    private _clickSubject: Rx.Subject<number>;

    private _button: PIXIUI.Button;

    private buttonBase: ITweenPIXISprite | ITweenPIXIGraphics;

    public isOnce: boolean = false;
    
    public width: number;
    public height: number;
    public center: boolean;
    public left: number;
    public right: number;
    public middle: boolean;
    public top: number;
    public bottom: number;

    public text: string = '';
    public textStyle: PIXI.TextStyle = new PIXI.TextStyle();
    public backgroundSrc: string = null; 
    public backgroundScale: number = 1.0;

    public backgroundColor: string = '#ffffff';
    public lineColor:       string = '#ffffff';
    public lineThickness:   number = 5;
    public radius:          number = 10;
    public circle:          boolean = false;

    public renderObject: ITweenPIXIContainer;

    public set alpha(value:number) {

    }
    
    constructor (index: number, c? : Partial<UIButton>) {
        super();
        Object.assign(this, c);

        this._buttonIndex = index;
        this._clickSubject = new Rx.Subject<number>();
        this.state = GameComponentState.ready;
    } 
    
    // 使わない
    public setDelegate(d: IGameComponentDelegate): void { 
         
    }

    public async init():Promise<void> {
        await this.initElement();

        // イベント設定
        this.renderObject.addEventListener('pointertap', async (e) => {
            // console.log('タップされたね');
            if (this.state == GameComponentState.ready) {

                // 色変え
                let transitColor:string;
                if (Util.isDarkColor(this.backgroundColor)) {
                    transitColor = Util.lightenColor(this.backgroundColor, 70);
                }
                else {
                    transitColor = Util.darkenColor(this.backgroundColor, 70);
                }
                this.buttonBase.tween = gsap.to(
                    this.buttonBase, 
                    0.15,
                    { 
                        pixi: {
                            tint: transitColor
                        },
                        ease: "power2.inOut",
                        yoyo: true,
                        onComplete: () => { 
                            this.buttonBase.tint = this.backgroundColor;
                            this.buttonBase.tween = null;
                        }
                    }
                );
                
                const se = await GameSound.build('se_tap');
                se.play();

                this._clickSubject.next(this._buttonIndex);
                if (this.isOnce === true) {
                    this._clickSubject.complete();
                }
            }
        })
    }

    get observable(): Rx.Observable<number> {
        return this._clickSubject.asObservable();
    }

    public destroy() {

    }

    public async initElement(): Promise<void> {
        // DisplayObject設定
        this._button = new PIXIUI.Button();     // TODO: 今は使ってない
        this._button.view = new PIXI.Container();
        this.renderObject = this._button.view;

        let buttonBase: PIXI.Sprite | PIXI.Graphics = new PIXI.Graphics();

        // TODO: とりあえず四角を表示(画像指定できるようにしたい)
        if (this.backgroundSrc == null) {

            if (this.circle == true) {
                buttonBase = new PIXI.Graphics()
                .lineStyle(this.lineThickness, this.lineColor)
                .beginFill(this.backgroundColor)
                .drawCircle(Math.round(this.width/2), Math.round(this.width/2), Math.round(this.width/2))
                .endFill()
            }
            else {
                buttonBase = new PIXI.Graphics()
                .lineStyle(this.lineThickness, this.lineColor)
                .beginFill(this.backgroundColor)
                .drawRoundedRect(0,0, this.width, this.height, this.radius)
                .endFill()
            }
        }
        // 画像指定があれば9スライスで表示
        else {
            // とりあえず普通に単体スプライト
            TextureRepository.instance.register(this.backgroundSrc);
            await TextureRepository.instance.load();
            buttonBase = PIXI.Sprite.from(TextureRepository.instance.get(this.backgroundSrc));
            buttonBase.scale.set(this.backgroundScale);
        }

        buttonBase.alpha = 0.85;
        buttonBase.pivot.x = 0;
        buttonBase.pivot.y = 0;
        this.renderObject.addChild(buttonBase);
        this.buttonBase = buttonBase;

        // テキスト
        if (this.text != null) {
            // テキストスタイル
            if (this.textStyle.wordWrapWidth == undefined || this.textStyle.wordWrapWidth == null) {
                // 改行規則
                this.textStyle.wordWrapWidth = (this.textStyle.fontSize as number) 
                    ? this.width - (this.textStyle.fontSize as number)
                    : this.width - 16;
            }

            this.textStyle.align = 'center';

            // テキストラベル
            let textLabel = new PIXI.Text( this.text, this.textStyle );
            textLabel.anchor.set(0.5);
            textLabel.x = this.renderObject.width / 2;
            textLabel.y = this.renderObject.height / 2;
            textLabel.visible = true;

            this.renderObject.addChild(textLabel);
        }

        
        // グローバルな位置決めなど
        let game = Game.instance;
        if (this.center != undefined) {
            this.renderObject.x = (game.width - this.width) / 2;
        }
        else if (this.left != undefined) {
            this.renderObject.x = this.left;
        }
        else if (this.right != undefined) {
            this.renderObject.x = game.width - (this.width + this.right);
        }

        if (this.middle != undefined) {
            this.renderObject.y = (game.height - this.height) / 2;
        }
        else if (this.top != undefined) {
            this.renderObject.y = this.top;
        }
        else if (this.bottom != undefined) {
            this.renderObject.y = game.height - (this.height + this.bottom);
        }
        
        this.rawX = this.renderObject.x;
        this.rawY = this.renderObject.y;
        
        
        // イベントリスナー設定
        this.renderObject.interactive = true;
        this.renderObject.cursor = 'pointer';
        this.renderObject.visible = true;
    }

    public set enabled(value:boolean) {
        if (value === true) {
            this.state = GameComponentState.ready;
            this.renderObject.filters = [];
        }
        else {
            this.state = GameComponentState.suspended;
            const voidFilter = new PIXI.AlphaFilter(0.5);
            this.renderObject.filters = [voidFilter];
        }
    }
}