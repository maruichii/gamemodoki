import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { PARAM_GROUP, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { ENV, LoveLevelExp, LoveLevelText } from 'ts/Const';
import { FlagManager } from 'ts/Engine/Core/FlagManager';



/**
 * UIボタン基底クラス
 */
export class HeroineStatusMonitor extends GameComponent {
    public renderObject: PIXI.Container;

    private _window : PIXI.Graphics;

    private _subscription: Rx.Subscription;

    // 親愛度
    private _labelLoveHeader:   PIXI.Text;
    private _prgbarLoveLevel:   PIXIUI.ProgressBar;
    private _numLoveLovel:      PIXI.Text;
    private _textLoveLevel:     PIXI.Text;

    // かしこさ
    private _labelIntHeader:    PIXI.Text;
    private _prgbarIntLevel:    PIXIUI.ProgressBar;
    private _numIntLovel:       PIXI.Text;
    private _textIntLevel:      PIXI.Text;


    // 家事
    private _labelSkillHeader:  PIXI.Text;
    private _prgbarSkillLevel:  PIXIUI.ProgressBar;
    private _numSkillLovel:     PIXI.Text;
    private _texSkillLevel:     PIXI.Text;


    // エッチ度
    private _labelEroHeader:    PIXI.Text;
    private _prgbarEroLevel:    PIXIUI.ProgressBar;
    private _numEroLovel:       PIXI.Text;
    private _texEroLevel:       PIXI.Text;


    constructor(c?: Partial<HeroineStatusMonitor>) {
        super();

        this.renderObject = new PIXI.Container();
        this.renderObject.sortableChildren = true;

        // ウィンドウ
        this._window = new PIXI.Graphics()
        .lineStyle(3, '#8b8b8b')
        .beginFill('#ffffffe0')
        .drawRoundedRect(0,0, 250, 350, 10)
        .endFill()
        // this._window.alpha = 0.75;
        this._window.zIndex = -10;
        this.renderObject.addChild(this._window);


        /**
         * 親愛度
         */
        // 親愛度ヘッダー
        this._labelLoveHeader = new PIXI.Text(
            '親愛度 Lv',
            {...ENV.defaultTextStyle, ...{fontSize: 19, }} as PIXI.TextStyle
        );
        this._labelLoveHeader.x = 10;
        this._labelLoveHeader.y = 10;
        this.renderObject.addChild(this._labelLoveHeader);

        // 親愛度数値
        this._numLoveLovel = new PIXI.Text(
            '',
            {...ENV.defaultTextStyle, ...{fontSize: 25, align: 'left', wordWrap: true, wordWrapWidth: 100000}  } as PIXI.TextStyle
        );
        this._numLoveLovel.x = this._labelLoveHeader.x + this._labelLoveHeader.width + 5;
        this._numLoveLovel.y = 9;
        this.renderObject.addChild(this._numLoveLovel);

        // 親愛度レベルテキスト
        this._textLoveLevel = new PIXI.Text(
            '',
            {...ENV.defaultTextStyle, ...{align: 'left', wordWrap: true, wordWrapWidth: 100000}  } as PIXI.TextStyle
        );
        this._textLoveLevel.x = 10;
        this._textLoveLevel.y = 50;
        this.renderObject.addChild(this._textLoveLevel);


        // 親愛度レベル状況プログレスバー
        this._prgbarLoveLevel = this.buildProgresBar(ENV.progBarColor[1], ENV.progBarColor[0]);
        this.renderObject.addChild(this._prgbarLoveLevel);
        this._prgbarLoveLevel.pivot.x = this._prgbarLoveLevel.width;
        this._prgbarLoveLevel.x = this._window.width - 10;
        this._prgbarLoveLevel.y = 25;


        this.updateLoveMonitor();

        

        //  数値変化監視
        this._subscription = ParameterManager.instance.paramChange$.subscribe({
            next: (change) => {
                if (change.paramName == 'love') {
                    this.updateLoveMonitor();
                }
            }
        })

    }

    public async die(): Promise<void> {
        this._subscription.unsubscribe();
    }



    private updateLoveMonitor() {
        const love = ParameterManager.instance.getParam(PARAM_GROUP.HEROINE, 'love');   // 親愛度
        const isRescued = FlagManager.instance.getFlag('IS_RESCUED');                   // 救出済みフラグ
        const idx = isRescued? 1 : 0;   // 参照データインデックス
        let loveLevel:  number;

        const expTable = LoveLevelExp[idx];
        const textTable = LoveLevelText[idx];

        loveLevel =
            love < expTable[0] ?    0 :     // 5
            love < expTable[1] ?    1 :     // 20
            love < expTable[2] ?    2 :     // 40
            3; 

        // プログレスバー計算
        let progressValue = 0;
        if ( LoveLevelExp[idx][loveLevel] == 0 ) {
            progressValue = 100 - Math.abs(love);   // 下限を-100とする
        }
        else {
            let denom = LoveLevelExp[idx][loveLevel];   // 分母
            let num = love;                             // 分子
            if (loveLevel >= 1) {
                denom = LoveLevelExp[idx][loveLevel] - LoveLevelExp[idx][loveLevel - 1];
                num = num - LoveLevelExp[idx][loveLevel - 1];
            }
            progressValue = num / denom * 100;
        }

        this._numLoveLovel.text = loveLevel;
        this._textLoveLevel.text = textTable[loveLevel];

        this._prgbarLoveLevel.setFill(this.buildGraphics(ENV.progBarColor[loveLevel + 1]));
        this._prgbarLoveLevel.setBackground(this.buildGraphics(ENV.progBarColor[loveLevel]));
        this._prgbarLoveLevel.progress = progressValue;
    }




    
    private buildProgresBar(fillColor:string = '#ffffff', backgroundColor: string = '#000000'): PIXIUI.ProgressBar {
        const borderColor = '#dddddd';
        const width = 110;
        const height = ENV.defaultTextStyle.lineHeight * 0.35;
        const radius = ENV.defaultTextStyle.lineHeight * 0.125;
        const border = 2;
        
        const bg = new PIXI.Graphics()
        .beginFill(borderColor)
        .drawRoundedRect(0, 0, width, height, radius)
        .beginFill(backgroundColor)
        .drawRoundedRect(border, border, width - (border * 2), height - (border * 2), radius);

        const fill = new PIXI.Graphics()
        .beginFill(borderColor)
        .drawRoundedRect(0, 0, width, height, radius)
        .beginFill(fillColor)
        .drawRoundedRect(border, border, width - (border * 2), height - (border * 2), radius);

        const prgbar =  new PIXIUI.ProgressBar( {bg, fill} );
        return prgbar;
    }

    private buildGraphics(fill: string = "#ffffff"): PIXI.Graphics {
        const borderColor = '#dddddd';
        const width = 110;
        const height = ENV.defaultTextStyle.lineHeight * 0.35;
        const radius = ENV.defaultTextStyle.lineHeight * 0.125;
        const border = 2;

        const g = new PIXI.Graphics()
        .beginFill(borderColor)
        .drawRoundedRect(0, 0, width, height, radius)
        .beginFill(fill)
        .drawRoundedRect(border, border, width - (border * 2), height - (border * 2), radius);

        return g;
    }

}