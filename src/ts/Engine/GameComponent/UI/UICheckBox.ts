import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';
const clonedeep = require('lodash/cloneDeep');


/**
 * UIチェックボックス基底クラス
 */
export class UICheckBox extends GameComponent implements IContentComponent {

    public  _delegate: IGameComponentDelegate;  // 使わない 

    public value: number;
    private _clickSubject: Rx.Subject<number>;

    private _checkbox: PIXIUI.CheckBox;
    public checked: boolean = false;
    public checkedSpriteAlias: string = 'radio_on';
    public unCheckedSpriteAlias: string = 'radio_off';


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

    public backgroundColor: string = '#ffffff';
    public lineColor:       string = '#ffffff';
    public lineThickness:   number = 5;
    public radius:          number = 10;

    public renderObject: PIXIUI.CheckBox;
    public radioGroup: PIXIUI.RadioGroup

    public set alpha(value:number) {

    }
    
    constructor (c? : Partial<UICheckBox>) {
        super();
        Object.assign(this, c);

        TextureRepository.instance.register(this.checkedSpriteAlias);
        TextureRepository.instance.register(this.unCheckedSpriteAlias);

        this.value = c.value != undefined ?  c.value : 0;
        this._clickSubject = new Rx.Subject<number>();
        this.state = GameComponentState.ready;
    } 
    
    // 使わない
    public setDelegate(d: IGameComponentDelegate): void { 
         
    }

    public async init():Promise<void> {
        await this.initElement();

        this.renderObject.addEventListener('pointertap', async (e) => {
            // console.log('タップされたね');
            if (this.state == GameComponentState.ready) {
                this._clickSubject.next(this.value);
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
        await TextureRepository.instance.load();
        this._checkbox = new PIXIUI.CheckBox({
            text: this.text,
            checked: this.checked,
            style: {
                unchecked: 'radio_off',
                checked: 'radio_on',
                text: this.textStyle,
            }
        });
        this.renderObject = this._checkbox;

        
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
}























export type RadioButtonOption = {
    label: string,
    sub?: string,
}


/**
 * UIラジオボタングループ基底クラス
 */
export class UIRadioGroup extends GameComponent implements IContentComponent {

    public  _delegate: IGameComponentDelegate;  // 使わない 

    private _clickSubject: Rx.Subject<number>;
    
    public renderObject: PIXI.Container = new PIXI.Container();
    private _radioGroupBase: PIXI.Graphics | PIXI.Sprite;
    private _radioGroup: PIXIUI.RadioGroup = null;
    public options: Array<RadioButtonOption> = [];
    private _items: Array<PIXIUI.CheckBox> = [];
    private _elementMargin: number = 10;
    public checkedSpriteAlias: string = 'radio_on';
    public unCheckedSpriteAlias: string = 'radio_off';


    public isOnce: boolean = false;
    
    public width: number;
    public height: number = 0;
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
    public lineThickness:   number = 5;
    public radius:          number = 10;

    
    constructor (options: Array<RadioButtonOption>, c? : Partial<UIRadioGroup>) {
        super();
        Object.assign(this, c);
        this._clickSubject = new Rx.Subject<number>();
        this.state = GameComponentState.ready;

        TextureRepository.instance.register(this.checkedSpriteAlias);
        TextureRepository.instance.register(this.unCheckedSpriteAlias);

        this.options = options;
    } 
    
    // 使わない
    public setDelegate(d: IGameComponentDelegate): void { 
         
    }

    public get radioGroup() :PIXIUI.RadioGroup {
        return this._radioGroup;
    }

    public async init():Promise<void> {
        await this.initElement();

        // イベント設定
        this._radioGroup.onChange.connect((selectedItemId:number, selectedVal: string) => {
            
        })
    }

    get observable(): Rx.Observable<number> {
        return this._clickSubject.asObservable();
    }

    public destroy() {

    }

    public async initElement(): Promise<void> {
        await TextureRepository.instance.load();
        this.renderObject.sortableChildren = true;

        const checkedContainer = new PIXI.Container();
        const uncheckedContainer = new PIXI.Container();
        const checkedSprite = PIXI.Sprite.from(TextureRepository.instance.get(this.checkedSpriteAlias));
        const unCheckedSprite = PIXI.Sprite.from(TextureRepository.instance.get(this.unCheckedSpriteAlias));
        checkedContainer.addChild(checkedSprite);
        uncheckedContainer.addChild(unCheckedSprite);


        const buttonHeight = checkedSprite.getBounds().height;
        this._elementMargin = buttonHeight * 0.75;



        /**
         * radioGroup設定
         */
        for( const option of this.options) {
            const optionBox = new PIXIUI.CheckBox({
                text: option.label,
                checked: true,
                style: {
                    unchecked: clonedeep(uncheckedContainer) as PIXI.Container,
                    checked: clonedeep(checkedContainer) as PIXI.Container,
                    text: {...this.textStyle, ...{wordWrap: true, wordWrapWidth: 100000} } as PIXI.TextStyle,
                }
            })
            this._items.push(optionBox);
        }
        const radioGroup = new PIXIUI.RadioGroup({
            items: this._items,
            type: 'vertical',
            elementsMargin: this._elementMargin
        });
        radioGroup.x = (Number)(this.textStyle.fontSize) * 1.0;
        radioGroup.y = (Number)(this.textStyle.fontSize) * 1.5;
        radioGroup.zIndex = 100;
        this._radioGroup = radioGroup;

        


        // 補足ラベル追加
        Array.prototype.forEach.call(this.options, (option: RadioButtonOption, idx: number) => {
            const appendix = new PIXI.Text(
                option.sub, 
                { ...this.textStyle, ...{fontSize: (Number)(this.textStyle.fontSize) * 0.75, wordWrap: true, wordWrapWidth: 100000} }
            );
            appendix.anchor.x = 1.0;
            appendix.anchor.y = 1.0;
            appendix.x = this.width - (Number)(this.textStyle.fontSize) * 2.0;
            appendix.y = this._radioGroup.items[idx].y + buttonHeight * 1.1;      // HACK!!!! RadioGroupの protected itemsを publicに
            this._radioGroup.addChild(appendix);  
            console.log(appendix.x);
        })

        this.renderObject.addChild(radioGroup);
    

        /**
         * 枠
         */
        let radioGroupBase: PIXI.Sprite | PIXI.Graphics = new PIXI.Graphics();   
        
        // 高さ = 上下パディング + (ボタンサイズ + 要素マージン) * 要素数 - 要素マージン
        this.height = (Number)(this.textStyle.fontSize) * 3.5 +  (buttonHeight + this._elementMargin) * this._items.length - this._elementMargin;

        // TODO: とりあえず四角を表示(画像指定できるようにしたい)
        if (this.backgroundSrc == null) {
            radioGroupBase = new PIXI.Graphics()
            .lineStyle(this.lineThickness, this.lineColor)
            .beginFill(this.backgroundColor)
            .drawRoundedRect(0,0, this.width, this.height, this.radius)
            .endFill()
        }
        // 画像指定があれば9スライスで表示
        else {
            TextureRepository.instance.register(this.backgroundSrc);
            await TextureRepository.instance.load();
            radioGroupBase = PIXI.Sprite.from(TextureRepository.instance.get(this.backgroundSrc));
            this.renderObject.addChild(radioGroupBase);
            this._radioGroupBase = radioGroupBase;
        }

        radioGroupBase.alpha = 0.9;
        radioGroupBase.pivot.x = 0;
        radioGroupBase.pivot.y = 0;
        radioGroupBase.zIndex = 0;
        this.renderObject.addChild(radioGroupBase);
        this._radioGroupBase = radioGroupBase;
     
        
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

    }
}