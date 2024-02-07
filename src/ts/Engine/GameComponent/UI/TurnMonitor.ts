import * as Util from '../../../Util/Util';
import * as Rx from 'rxjs';
import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { GameComponent, GameComponentState, IContentComponent, IGameComponentDelegate } from "../../Core/IGameComponent";
import { Game } from '../../Core/Game';
import { TextureRepository } from 'ts/Repository/TextureRepository';
import { PARAM_GROUP, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { ENV } from 'ts/Const';


export enum TURNMONITOR_TIMEINDEX {
    MORNING,
    NOON,
    SUNSET,
    EVENING
}

export const TURNMONITOR_TIMEWORD = ['朝', '昼', '夕', '夜']


/**
 * UIボタン基底クラス
 */
export class TurnMonitor extends GameComponent {
    private _dayMonitor:   PIXI.Text;
    private _turnMonitor:  PIXI.Text;
    
    private _time: string;
    private _day:  number;
    private _maxAp:number =  ParameterManager.instance.getParam(PARAM_GROUP.PLAYER, 'max_ap');

    public renderObject: PIXI.Container;

    private _subscription: Rx.Subscription;

    constructor(c?: Partial<TurnMonitor>) {
        super();

        this.renderObject = new PIXI.Container();

        // 日数
        this._day = ParameterManager.instance.getParam(PARAM_GROUP.BASE, 'day');
        this._dayMonitor = new PIXI.Text(
            this._day + '日目',
            {...ENV.defaultTextStyle, ...{align: 'left', wordWrap: true, wordWrapWidth: 100000, fill: '#ffffff', strokeThickness: 0 }  } as PIXI.TextStyle
        );
        this._dayMonitor.x = 0;

        // 時間
        const timeIdx = ParameterManager.instance.getParam(PARAM_GROUP.BASE, 'time');
        this._time = TURNMONITOR_TIMEWORD[timeIdx];
        this._dayMonitor.text += '　' + this._time;


        // 行動力
        this._turnMonitor = new PIXI.Text(
            '行動力：' + ParameterManager.instance.getParam(PARAM_GROUP.PLAYER, 'ap') + ' / ' + this._maxAp,
            {...ENV.defaultTextStyle, ...{ align: 'left', wordWrap: true, wordWrapWidth: 100000, fill: '#ffffff', strokeThickness: 0 }  } as PIXI.TextStyle
        );
        this._turnMonitor.x = this._dayMonitor.width + (Number)(ENV.defaultTextStyle.fontSize) * 1.5;

        this.renderObject.addChild(this._dayMonitor);
        this.renderObject.addChild(this._turnMonitor);


        // 数値変更監視
        this._subscription = ParameterManager.instance.paramChange$.subscribe({
            next: (change) => {
                if (change.paramName == 'day') {
                    this._day = change.paramValue;
                    this._dayMonitor.text = this._day + '日目　' + this._dayMonitor.text;
                }
                else if (change.paramName == 'ap') {
                    if (change.paramValue <= this._maxAp) {
                        this._turnMonitor.text = '行動力：' + change.paramValue + ' / ' + this._maxAp;
                        this._turnMonitor.x = this._dayMonitor.width + (Number)(ENV.defaultTextStyle.fontSize) * 1.5;
                    }
                    else {
                        console.log('ターン超過');
                    }
                }
                else if (change.paramName == 'time') {
                    
                    const timeIdx = ParameterManager.instance.getParam(PARAM_GROUP.BASE, 'time');
                    this._time = TURNMONITOR_TIMEWORD[timeIdx];
                    this._dayMonitor.text = this._day + '日目　' + this._dayMonitor.text;
                }
                
            }
        })
    }

    get maxTurn(): number {
        return this._maxAp;
    }

    // public setMaxTurn(max: number): void {
    //     this._maxTurn = max;
    //     this._turnMonitor.text = ParameterManager.instance.getParam(PARAM_GROUP.PLAYER, 'ap') + ' / ' + max;
    // }

    public async die(): Promise<void> {
        this._subscription.unsubscribe();
    }
}