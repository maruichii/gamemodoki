import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import { PixiPlugin } from "gsap/PixiPlugin";
import { IGameComponent, IContentComponent, ISteppableComponent, ISteppableComponentDelegate, IGameComponentDelegate } from '../../Core/IGameComponent';
import { ITweenPIXIGraphics } from '../../Core/ITweenDisplayObject';
import { Game } from "../../Core/Game";
import RText from 'RText';

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);


/**
 * UIウィンドウ基底クラス
 * コンストラクタ引数 {
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */
export class UIWindow implements IGameComponent, IContentComponent {

    public objectLabel: string = '';
    public renderObject: PIXI.Container;
    protected window: PIXI.Graphics;

    public textStyle? : PIXI.TextStyle;
    public backgroundColor: number;

    public width: number;
    public height: number;

    public center: boolean;
    public left: number;
    public right: number;

    public middle: boolean;
    public top: number;
    public bottom: number;

    constructor (c? : Partial<UIWindow>) {
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
    } 

    public async init():Promise<void> {
        this.initElement();
    }

    public async start():Promise<void> {
        return null;
    }

    protected initElement(): void {
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

        // ウィンドウ
        let window = new PIXI.Graphics()
        .lineStyle(5, 0xffffff)
        .beginFill(this.backgroundColor)
        .drawRoundedRect(0,0, this.width, this.height, 10)
        .endFill()
        window.alpha = 0.75;
        window.pivot.x = 0;
        window.pivot.y = 0;
        
        // イベントリスナー設定
        window.interactive = true;
        window.visible = true;
        this.window = window;
        this.renderObject.addChild(this.window);
    }

    public async doUpdate(): Promise<void> {
        return null;
    }

    public async doFixedUpdate(): Promise<void> {
        return null;
    }

    public render(): void {
        return null;
    }

    public destroy(): void {
        return null;
    }   
}


/**
 * テキストウィンドウクラス
 * コンストラクタ引数 {
 *   id:        テキストのid
 *   textSpeed: テキスト送りの速度
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */


export class TextWindow extends UIWindow implements ISteppableComponent {
    public textSpeed: number;
    public gameComponentDelegate?: IGameComponentDelegate;
    public steppableComponentDelegate?: ISteppableComponentDelegate;
    
    protected _textSequence: string[] = [];
    protected _currentText: string;
    protected _isWaitNext: boolean;
    protected _textCursor: number;
    protected _charCursor: Generator<unknown, any, unknown>;
    protected _prevFrame: number;

    // DisplayObject
    protected _textLabel: PIXI.Text;
    protected _btnNextMsg: PIXI.Graphics;
    protected _btnCloseWindow: PIXI.Graphics;  


    constructor (c? : Partial<SerifWindow>) {
        super(c);
        Object.assign(this, c);
    }
    
    setGameComponentDelegate(d: IGameComponentDelegate): void {
        this.gameComponentDelegate = d;
    }
    setSteppableComponentDelegate(d: ISteppableComponentDelegate): void {
        this.steppableComponentDelegate = d;
    }

    public async init():Promise<void> {
        this.initElement();
    }

    public async start():Promise<void> {
        this.stepNext();
    }

    protected initElement():void {
        super.initElement();

        // テキストスタイル
        if (!this.textStyle.wordWrapWidth) {
            this.textStyle.wordWrapWidth = (this.textStyle.fontSize as number) 
                ? this.width - (this.textStyle.fontSize as number)
                : this.width - 16;
        }

        // テキストラベル
        let textLabel = new PIXI.Text( '', this.textStyle );
        textLabel.x = 0;
        textLabel.y = 0;
        textLabel.x = (this.textStyle.fontSize as number) ?  (this.textStyle.fontSize as number) * 0.5 : 16 * 0.5;
        textLabel.y = this.textStyle.lineHeight ? this.textStyle.lineHeight * 1.5 : 16;
        textLabel.visible = true;

        // テキスト送りボタン
        let btnNextMsg = new PIXI.Graphics() as ITweenPIXIGraphics;
        btnNextMsg.lineStyle(0, 0xffffff)
        .beginFill(0xffffff)
        .drawPolygon([
            0, 0,
            30, 0,
            15, 25
        ])
        .endFill()
        btnNextMsg.alpha = 0.9;
        btnNextMsg.scale.x = btnNextMsg.scale.y = 0.9;
        btnNextMsg.x = this.width - 58;
        btnNextMsg.y = this.height - 45;
        btnNextMsg.tween = gsap.to(btnNextMsg, 1.0,
            {  pixi:
                { alpha: 0.2 }, ease: Power0.easeNone, repeat: -1, yoyo: true,
            }
        )
        btnNextMsg.visible = false;

        // ウィンドウ閉じるボタン
        let btnCloseWindow;
        btnCloseWindow = new PIXI.Graphics() as ITweenPIXIGraphics;
        btnCloseWindow.lineStyle(4, 0xffffff)   
        .moveTo(0,0)              
        .lineTo(25,25)             
        .moveTo(25,0)     
        .lineTo(0,25);
        btnCloseWindow.scale.x = btnCloseWindow.scale.y = 0.9;
        btnCloseWindow.x = this.width - 58;
        btnCloseWindow.y = this.height - 45;
        btnCloseWindow.tween = gsap.to(btnCloseWindow, 1.0,
            {  pixi:
                { alpha: 0.2 }, ease: Power0.easeNone, repeat: -1, yoyo: true,
            }
        );
        btnCloseWindow.visible = false;


        // イベントリスナー設定
        this.window.interactive = true;
        textLabel.interactive = true;
        btnNextMsg.interactive = true;
        btnNextMsg.buttonMode = true;

        this.window.on('pointertap', this.onTap.bind(this));
        textLabel.on('pointertap', this.onTap.bind(this));
        btnNextMsg.on('pointertap', this.onTap.bind(this));

        btnCloseWindow.interactive = true;
        btnCloseWindow.buttonMode = true;

        // 子要素をthisで持つ
        this._textLabel = textLabel;
        this._btnNextMsg = btnNextMsg;
        this._btnCloseWindow = btnCloseWindow;


        // 子要素をコンテナに入れる
        this.renderObject.addChild(textLabel);
        this.renderObject.addChild(btnNextMsg);
        this.renderObject.addChild(btnCloseWindow);

        this._prevFrame = Game.currentTime;
    }


    /**
     * 一連の文章をセット
     */
    public setTextSequence(textSequence: string[]): void {
        this._textSequence = textSequence;
        this._textCursor = 0;
    }

    /**
     * 本文表示処理本体
     */
    public async doUpdate(): Promise<void> {
        let isElapsedTargetTime =  Game.currentTime - this._prevFrame >  this.textSpeed;
        if (Game.getKeyDown('KeyZ') == 1) {
            this.onTap(null);
        }
        else if ( isElapsedTargetTime && !this._isWaitNext && this._charCursor != null ) {
            // 一定時間経過 かつ テキスト送り待ちでなければ 次の文字を表示する
            this.stream();
            this._prevFrame = Game.currentTime;
        }
    }

    /**
     * 次の1文へ
     */
    public stepNext():void {
        // あとになければなにもしない
        if (!this.checkIsSequenceEnd()) {
            this._textLabel.text = "";
            this._currentText  = ' ' + this._textSequence[this._textCursor]; // 1文字目の待機用に空白をいれる
            this._charCursor = this.getNextCharGenerator();
            this._btnNextMsg.visible = false;
            this._isWaitNext = false;

            this.stream();
            this._textCursor++;
        }
    }


    /**
     * 1文字ずつ表示する
     */
    protected stream():void {
        let n = this._charCursor.next();

        if (!n.done) {
            // 1文字追加
            this._textLabel.text += n.value;
        }
        else if (this._isWaitNext == false) {
            // 文末かつflush()してない
            this._isWaitNext = true;
            this._btnNextMsg.visible = true;
        }
        else {
            
        }
    }

    /**
     * 1文字ずつ返すジェネレータ
     */
    protected *getNextCharGenerator(): Generator<unknown, any, unknown> {
        let index = 0;
        while(this._currentText[index] !== undefined) {
            yield this._currentText[index++];
        }
        yield '';
    }

    /**
     * 一括表示
     */
    public flush():void {
        this._textLabel.text  = this._currentText;
        this._isWaitNext = true;
        this._btnNextMsg.visible = true;
        this.checkIsSequenceEnd();
    }

    /**
     * 文章配列の末尾か判定
     */
    protected checkIsSequenceEnd(): boolean {
        if ( this._textSequence[this._textCursor] === undefined) {
            // テキストが終わりなら閉じる待機
            this._btnNextMsg.visible = false;
            this._btnCloseWindow.visible = true;
            return true;    
        }
        else {
            return false;
        }
    }


    /**
     * ユーザーアクションにしたがってなんかする 
     */
    public onTap(e: any): void  {
        this.onNext();
    }

    public onClose(): void {
        return null;
    }

    public onNext(): void {
        if (this.steppableComponentDelegate) {
            this._isWaitNext ? this.steppableComponentDelegate.handleNext() : this.flush();
        }
        else {
            // 表示が完了していれば次の文章へ、そうでなければ一括表示
            this._isWaitNext ? this.stepNext() : this.flush();
        }
    }

}


/**
 * 会話ウィンドウクラス
 * コンストラクタ引数 {
 *   id:        テキストのid
 *   textSpeed: テキスト送りの速度
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */
export class SerifWindow extends TextWindow implements ISteppableComponent {

    protected _speaker: string;
    protected _speakerSequence: string[];

    // DisplayObject
    protected _speakerFrame: PIXI.Graphics;
    protected _speakerLabel: PIXI.Text;

    public async init(): Promise<void> {
        this.initElement();
    }

    protected initElement(): void {
        super.initElement();

        // 話者ラベル
        let speakerTextStyle = new PIXI.TextStyle();
        Object.assign(speakerTextStyle, this.textStyle);
        speakerTextStyle.lineHeight = 1.0;
        speakerTextStyle.strokeThickness = 0;
        speakerTextStyle.fontSize = Math.trunc(Number(speakerTextStyle.fontSize) * 0.8);

        let speakerLabel = new PIXI.Text( '', speakerTextStyle);
        speakerLabel.x = 50 + 60;
        speakerLabel.y = -14;
        speakerLabel.visible = true;

        // 話者ラベル枠
        let speakerFrame = new PIXI.Graphics();
        speakerFrame.lineStyle(0, 0xffffff)
        .beginFill(0xffffb5)
        .drawPolygon([
            0, 0,
            Number(speakerTextStyle.fontSize) * 10, 0,
            Number(speakerTextStyle.fontSize) * 10, 36,
            0, 36
        ])
        .endFill()
        speakerFrame.alpha = 0.9;
        speakerFrame.x = 50;
        speakerFrame.y = -18;

        this._speakerFrame = speakerFrame;
        this._speakerLabel = speakerLabel;
        this.renderObject.addChild(speakerFrame);
        this.renderObject.addChild(speakerLabel);
    }


    /**
     * 一連の文章をセット
     */
     public setScriptSequence(textSequence: string[], speakerSequence: string[]): void {
        this._speakerSequence = speakerSequence;    
        this.setTextSequence(textSequence);
    }


    /**
    * 次の1文へ
    */
    public stepNext(): void {
       // あとになければなにもしない
       if (!this.checkIsSequenceEnd()) {
           
           // 話者ラベル表示設定
           if ( this._speakerSequence[this._textCursor] != null) {
               this._speakerLabel.text = this._speakerSequence[this._textCursor]; 

               this._speakerLabel.visible = true;
               this._speakerFrame.visible = true;

               this._speakerLabel.x = this._speakerFrame.x + (this._speakerFrame.width - this._speakerLabel.width) / 2;
           }
           else {
               this._speakerLabel.text = '';
               this._speakerLabel.visible = false;
               this._speakerFrame.visible = false;
           }
           this._textLabel.text = "";
           this._currentText  = ' ' + this._textSequence[this._textCursor]; // 1文字目の待機用に空白をいれる
           this._charCursor = this.getNextCharGenerator();
           this._btnNextMsg.visible = false;
           this._isWaitNext = false;

           this.stream();
           this._textCursor++;
       }
   }
}
