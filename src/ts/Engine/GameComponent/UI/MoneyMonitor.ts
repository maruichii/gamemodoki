import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { PARAM_GROUP, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { ENV } from 'ts/Const';


/**
 * UIボタン基底クラス
 */
export class MoneryMonitor extends GameComponent {
    private _moneyMonitor: PIXI.Text;
    private _money: number;

    public renderObject: PIXI.Container;

    constructor(c?: Partial<MoneryMonitor>) {
        super();

        this.renderObject = new PIXI.Container();

        this._money = ParameterManager.instance.getParam(PARAM_GROUP.BASE, 'money');
        this._moneyMonitor = new PIXI.Text(
            '所持金：' + this.formatMoney(this._money),
            {...ENV.defaultTextStyle, ...{align: 'right', wordWrap: true, wordWrapWidth: 100000, fill: '#ffffff', strokeThickness: 0 }  } as PIXI.TextStyle
        );
        this._moneyMonitor.x = 0;
        this._moneyMonitor.anchor.x = 1.0;

        this.renderObject.addChild(this._moneyMonitor);

        ParameterManager.instance.paramChange$.subscribe({
            next: (change) => {
                if (change.paramName == 'money') {
                    this._money = change.paramValue;
                    this._moneyMonitor.text = '所持金：' + this.formatMoney(this._money)
                }
            }
        })
    }

    private formatMoney(money: number) : string {
        return money.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY',});
    }

    // public setMaxTurn(max: number): void {
    //     this._maxTurn = max;
    //     this._turnMonitor.text = ParameterManager.instance.getParam(PARAM_GROUP.PLAYER, 'ap') + ' / ' + max;
    // }
}