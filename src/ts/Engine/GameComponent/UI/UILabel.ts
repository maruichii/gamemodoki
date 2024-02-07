import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';


/**
 * UIボタン基底クラス
 */
export class UILabel extends GameComponent implements IContentComponent {

    public  _delegate: IGameComponentDelegate;  // 使わない 
    
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

    public backgroundColor: string = '#ffffff';
    public lineColor:       string = '#ffffff';
    public backgroundAlpha: number = 0.85;
    public lineThickness:   number = 5;
    public radius:          number = 10;

    public renderObject: PIXI.Container;
    private _labelBase: PIXI.DisplayObject;

    public set alpha(value:number) {

    }
    
    constructor (c? : Partial<UILabel>) {
        super();
        Object.assign(this, c);
        this.state = GameComponentState.ready;
    } 
    
    // 使わない
    public setDelegate(d: IGameComponentDelegate): void { 
         
    }

    public async init():Promise<void> {
        await this.initElement();
    }

    public destroy() {

    }

    public async initElement(): Promise<void> {
        this.renderObject = new PIXI.Container;

        let labelBase: PIXI.Sprite | PIXI.Graphics = new PIXI.Graphics();

        // TODO: とりあえず四角を表示(画像指定できるようにしたい)
        if (this.backgroundSrc == null) {
            labelBase = new PIXI.Graphics()
            .lineStyle(this.lineThickness, this.lineColor)
            .beginFill(this.backgroundColor)
            .drawRoundedRect(0,0, this.width, this.height, this.radius)
            .endFill()
        }
        // 画像指定があれば9スライスで表示
        else {
            TextureRepository.instance.register(this.backgroundSrc);
            await TextureRepository.instance.load();
            labelBase = PIXI.Sprite.from(TextureRepository.instance.get(this.backgroundSrc));
            this.renderObject.addChild(labelBase);
            this._labelBase = labelBase;
        }

        labelBase.alpha = this.backgroundAlpha;
        labelBase.pivot.x = 0;
        labelBase.pivot.y = 0;
        this.renderObject.addChild(labelBase);
        this._labelBase = labelBase;

        // テキスト
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
        
    
        this.renderObject.visible = true;
    }
}