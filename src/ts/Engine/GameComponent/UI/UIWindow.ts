import * as Util from '../../../Util/Util';

import { gsap } from "gsap";
import * as PIXI from 'pixi.js';
import { ScrollBox } from '@pixi/ui';

import { PixiPlugin } from "gsap/PixiPlugin";
import { IGameComponent, IContentComponent, ISteppableComponent, ISteppableComponentDelegate, IGameComponentDelegate, IScrollableViewport, GameComponent, GameComponentState, ISequenceActor } from '../../Core/IGameComponent';
import { ITweenPIXIGraphics } from '../../Core/ITweenDisplayObject';
import { Game } from "../../Core/Game";
import RText from 'RText';
// import { } from "ts/Repository/SequenceRepository";
import { ScriptText, TextParam, Sequence, REF_TYPE  } from 'ts/Repository/EventRepository';
import { FlagManager } from 'ts/Engine/Core/FlagManager';
import { ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { Subject } from 'rxjs';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';

// register the plugin
gsap.registerPlugin(PixiPlugin);
// give the plugin a reference to the PIXI object
PixiPlugin.registerPIXI(PIXI);





/**
 * UIウィンドウ基底クラス
 * ※四角の中にテキストが表示されるもの全般
 * コンストラクタ引数 {
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */
export class UIWindow extends GameComponent implements IContentComponent {

    public _delegate: IGameComponentDelegate;

    // public objectLabel: string = '';
    public renderObject: PIXI.Container;
    public isReservingDelete: boolean;

    protected window: PIXI.Graphics;

    public textStyle? : PIXI.TextStyle;
    public backgroundColor: string;

    public width: number;
    public height: number;

    public center: boolean;
    public left: number;
    public right: number;

    public middle: boolean;
    public top: number;
    public bottom: number;

    constructor (c? : Partial<UIWindow>) {
        super();
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
        
        this.rawX = this.renderObject.x;
        this.rawY = this.renderObject.y;

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
    
    public async afterUpdate(): Promise<void> {
        return;
    }

    public renderComponent(): void {
        return null;
    }

    public die(): Promise<void> {
        this._delegate = null;
        return null;
    }   

    public setDelegate(d: IGameComponentDelegate) {
        this._delegate = d;   
    }
}


/**
 * テキストウィンドウクラス
 * イベントにおける一連のテキスト表示を制御する
 * ISteppableComponentを実装し、イベントを進める(stepNext())トリガーは外部に委譲する
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


export class SequencialTextWindow extends UIWindow implements ISteppableComponent {
    public isWaitNext: boolean;
    public textSpeed: number;
    public gameComponentDelegate?: IGameComponentDelegate;
    public steppableComponentDelegate?: ISteppableComponentDelegate;
    
    protected _scriptTextSequence: Array<ScriptText> = new Array<ScriptText>();

    protected _currentText: string;
    protected _textCursor: number;
    protected _charCursor: Generator<unknown, any, unknown>;    // 文字カーソル
    protected _prevFrame: number;

    // DisplayObject
    protected _textLabel: PIXI.Text;
    protected _btnNextMsg: PIXI.Graphics;
    protected _btnCloseWindow: PIXI.Graphics;  

    protected _completeSubject = new Subject<void>();


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
        this.state = GameComponentState.init;   // 準備未完了
        this.initElement();
        
        // this._btnCloseWindow.addEventListener('pointertap', () => {
        //     this.die();
        // })
    }

    public async start():Promise<void> {
       
    }

    protected initElement():void {
        super.initElement();

        // テキストスタイル
        if (this.textStyle.wordWrapWidth == undefined || this.textStyle.wordWrapWidth == null) {
            // 改行規則
            this.textStyle.wordWrapWidth = (this.textStyle.fontSize as number) 
                ? this.width - (this.textStyle.fontSize as number) * 1.5
                : this.width - 16;
        }

        this.textStyle.align = 'left';

        // テキストラベル
        let textLabel = new PIXI.Text( '', this.textStyle );
        textLabel.x = 0;
        textLabel.y = 0;
        // 左端 padding 0.5em
        // textLabel.x = (this.textStyle.fontSize as number) ?  (this.textStyle.fontSize as number) * 0.5 : 16 * 0.5;
        // 左端 padding 1em
        textLabel.x = (this.textStyle.fontSize as number) ?  (this.textStyle.fontSize as number) * 1.0 : 16 * 1.0;
        // textLabel.y = this.textStyle.lineHeight ? this.textStyle.lineHeight * 1.5 : 16; 
        // 必ず文頭に1行余計に入るので
        textLabel.y = this.textStyle.lineHeight ? this.textStyle.lineHeight * -0.25 : -8; ; 
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
        btnNextMsg.cursor = 'pointer';

        this.window.on('pointertap', this.onTap.bind(this));
        textLabel.on('pointertap', this.onTap.bind(this));
        btnNextMsg.on('pointertap', this.onTap.bind(this));

        btnCloseWindow.interactive = true;
        btnCloseWindow.cursor = 'pointer';

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
     * 一連の文章をセット(HACK: このクラスではspeakerは使わないけどScriptText型でセットしちゃう)
     */
    public async setSequence(sequence: Sequence): Promise<void>{
        // HACK: くそ
        let scriptTextSequence = sequence.map((s) => {
            return {text: s.text, textParams: s.textParams, speaker: s.speaker} as ScriptText;
        });
        this._scriptTextSequence = scriptTextSequence;
        this._textCursor = 0;
        this.state = GameComponentState.ready;   // 準備完了
    }

    /**
     * 本文表示処理本体
     */
    public async doUpdate(): Promise<void> {
        const elapsedTime = Game.currentTime - this._prevFrame;
        let isElapsedTargetTime =  elapsedTime >  this.textSpeed;
        // console.log('KeyPress:' + Game.getKey('KeyZ'));
        // console.log('KeyDown:' + Game.getKeyDown('KeyZ'));
        // console.log('KeyDuration:' + Game.getKeyPressDuration('KeyZ'));
        if (Game.getKeyDown('KeyZ') == 1) {
            this.onTap(null);
        }
        else if (Game.getKey('KeyZ') == 1 && Game.getKeyPressDuration('KeyZ') > 300) {
            this.onTap(null);
        }
        else if ( isElapsedTargetTime && !this.isWaitNext && this._charCursor != null ) {
            // 一定時間経過 かつ テキスト送り待ちでなければ 次の文字を表示する
            this.stream();
            this._prevFrame = Game.currentTime;
        }
    }


    /**
     * 次の1文へ
     */
    public async stepNext(): Promise<void> {
        // あとになければなにもしない
        if (!this.checkIsSequenceEnd()) {
            this._textLabel.text = "";
            SystemDataManager.instance.sysdata.backlog.push({speaker: null, text: this._scriptTextSequence[this._textCursor].text});     //バックログ
            this._currentText  = '\n' + this._scriptTextSequence[this._textCursor].text; // 1文字目の待機用に空白をいれる

            // パラメーター置換
            if (Array.isArray(this._scriptTextSequence[this._textCursor].textParams)) {
                Array.prototype.forEach.call(this._scriptTextSequence[this._textCursor].textParams, (param, index) => {
                    let replaceStr = '';
                    switch(param.type) {
                        case REF_TYPE.FLAG :
                            replaceStr = FlagManager.instance.getFlag(param.target) ? 'TRUE' : 'FALSE';
                            break;
                        case REF_TYPE.PARAM :
                            replaceStr = ParameterManager.instance.getParam(param.target, param.targetProperty);
                            break;

                            // その他の型
                        default:
                            break;
                    }

                    const placeholder =  new RegExp(`{{${index}}}}`, 'g');
                    this._currentText =  this._currentText.replace(placeholder, replaceStr);
                });
            }

            this._charCursor = this.getNextCharGenerator();
            this._btnNextMsg.visible = false;
            this.isWaitNext = false;
            if (this.steppableComponentDelegate != null) {
                this.steppableComponentDelegate.isWaitNext = false;
            }

            this.stream();
            this._textCursor++;
        }

        else {
            this.finishSequence();
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
            this.playSe();
        }
        else if (this.isWaitNext == false) {
            // 文末かつflush()してない
            this.isWaitNext = true;
            if (this.steppableComponentDelegate != null) {
                this.steppableComponentDelegate.isWaitNext = true;
            }
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
    public async flushCurrent(): Promise<void> {
        this._textLabel.text  = this._currentText;
        this.isWaitNext = true;
        this._btnNextMsg.visible = true;

        // console.log(this.renderObject.getBounds());
        // console.log('テキストラベル位置');
        // console.log(this._textLabel.x);
        // console.log(this._textLabel.y);
        // console.log(this._textLabel.anchor);

        this.checkIsSequenceEnd();
    }

    /**
     * 文章配列の末尾か判定
     */
    protected checkIsSequenceEnd(): boolean {
        if ( this._scriptTextSequence[this._textCursor] === undefined || 
            this._scriptTextSequence[this._textCursor].text === undefined) {
            // テキストが終わりなら閉じる待機
            this._btnNextMsg.visible = false;
            this._btnCloseWindow.visible = true;
            return true;    
        }
        else {
            this._btnNextMsg.visible = true;
            this._btnCloseWindow.visible = false;
            return false;
        }
    }


    /**
     * 一連の文章表示完了処理
     */
    protected finishSequence() {
        this._completeSubject.complete();
    }



    protected async playSe(): Promise<void> {
        return;
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
            // デリゲートがあるならば任せる
            // this.steppableComponentDelegate.isWaitNext ? this.steppableComponentDelegate.handleNext() : this.flush();    // flushも上から呼ぶ
            this.steppableComponentDelegate.handleNext({sound: true});
        }
        else {
            // 表示が完了していれば次の文章へ、そうでなければ一括表示
            this.isWaitNext ? this.stepNext() : this.flushCurrent();
        }
    }

}


/**
 * 会話ウィンドウクラス
 * イベント(会話)における一連のテキスト表示を制御する
 * ISteppableComponentを実装し、イベントを進める(stepNext())トリガーは外部に委譲する
 * 
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
export class SerifWindow extends SequencialTextWindow implements ISteppableComponent, ISequenceActor {

    // protected _speaker: string;
    // protected _speakerSequence: string[];

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

        let speakerLabel = new PIXI.Text( '', {...speakerTextStyle, ...{fill: '#333333', strokeThickness: 0}});
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
    * 次の1文へ TODO: 親クラスと処理重複してるのがひどい
    */
    public async stepNext(): Promise<void> {
        // あとになければなにもしない
        if (!this.checkIsSequenceEnd()) {

            SystemDataManager.instance.sysdata.backlog.push({
                    speaker: this._scriptTextSequence[this._textCursor].speaker, 
                    text: this._scriptTextSequence[this._textCursor].text
            });     //バックログ
           
           // 話者ラベル表示設定
           if ( this._scriptTextSequence[this._textCursor].speaker != null && this._scriptTextSequence[this._textCursor].speaker != undefined) {
                this._speakerLabel.text = this._scriptTextSequence[this._textCursor].speaker; 

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
           this._currentText  = '\n' + this._scriptTextSequence[this._textCursor].text; // 1文字目の待機用に空白をいれる

           // パラメーター置換
           if (Array.isArray(this._scriptTextSequence[this._textCursor].textParams)) {
            Array.prototype.forEach.call(this._scriptTextSequence[this._textCursor].textParams, (param, index) => {
                let replaceStr = '';
                switch(param.type) {
                    case REF_TYPE.FLAG :
                        replaceStr = FlagManager.instance.getFlag(param.target) ? 'TRUE' : 'FALSE';
                        break;
                    case REF_TYPE.PARAM :
                        replaceStr = ParameterManager.instance.getParam(param.target, param.targetProperty);
                        break;

                        // その他の型
                    default:
                        break;
                }

                // const placeholder =  new RegExp(`{{${index}}}}`, 'g');
                const placeholder =  '{{' + index + '}}';
                this._currentText =  this._currentText.replace(placeholder, replaceStr);
            });
        }


            this._charCursor = this.getNextCharGenerator();
            this._btnNextMsg.visible = false;
            this.isWaitNext = false;
            if (this.steppableComponentDelegate != null) {
                this.steppableComponentDelegate.isWaitNext = false;
            }

            this.stream();
            this._textCursor++;
        }

        else {
            this.finishSequence();
        }
    }

    protected async playSe(): Promise<void> {
        if (this._speakerLabel.text != '' && this._speakerLabel.text != null) {
            let sound: GameSound;
            if (this._speakerLabel.text == '少女' || this._speakerLabel.text == '早希' || this._speakerLabel.text == '？？？') {
                sound = await GameSound.build('se_talk', {
                    volume: 1.15
                });
            }
            else {
                sound = await GameSound.build('se_talk2', {
                    volume: 0.75
                });
            }
            sound.play();
        }
    }

}



// /**
//  * スクロール可能なウィンドウクラス  → @pixi/ui ScrollBox で代用
//  */
// export class ScrollableWindow implements IGameComponent, IScrollableViewport {
    
//     objectLabel: string;
//     renderObject: PIXI.DisplayObject;
//     gameComponentDelegate?: IGameComponentDelegate;
//     innerContainer: PIXI.Container<PIXI.DisplayObject>;
//     displayArea: PIXI.MaskData;

//     onWheel(): void {
//         throw new Error("Method not implemented.");
//     }
//     onDragStart(): void {
//         throw new Error("Method not implemented.");
//     }
//     onDragging(): void {
//         throw new Error("Method not implemented.");
//     }
//     onDragEnd(): void {
//         throw new Error("Method not implemented.");
//     }
//     render(): void {
//         throw new Error("Method not implemented.");
//     }
//     init(): Promise<void> {
//         throw new Error("Method not implemented.");
//     }
//     start(): Promise<void> {
//         throw new Error("Method not implemented.");
//     }
//     doUpdate(): Promise<void> {
//         throw new Error("Method not implemented.");
//     }
//     doFixedUpdate(): Promise<void> {
//         throw new Error("Method not implemented.");
//     }
//     destroy(): void {
//         throw new Error("Method not implemented.");
//     }
//     setGameComponentDelegate?(delegate: IGameComponentDelegate): void {
//         throw new Error("Method not implemented.");
//     }
//     onTap?(e: PIXI.FederatedPointerEvent): void {
//         throw new Error("Method not implemented.");
//     }
//     onClose?(): void {
//         throw new Error("Method not implemented.");
//     }
   
    
// }