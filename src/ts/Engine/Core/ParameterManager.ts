const { STEXT, CTEXT, ENV } = require('ts/Const');
import RData from 'RData'; 
import { Subject } from 'rxjs';
import { TURNMONITOR_TIMEINDEX } from 'ts/Engine/GameComponent/UI/TurnMonitor';

export enum PARAM_GROUP {
    PLAYER  = 0,
    HEROINE = 1,
    BASE    = 2,
}

export type Player = {
    name:   string,
    ap:     number,  // 行動力
    max_ap: number,  // 最大行動力
    vital:  number,
    ero:    number,

    // str: number,
    // int: number,
    // per; number,
    // agi: number,
};

export type Heroine = {
    love: number;
    ero: number;
}

export type Base = {
    day:    number,    // 経過日
    time:   number | TURNMONITOR_TIMEINDEX,    // 時間(朝昼夕夜) 
    money:  number,    // 所持金
    talk_count: number, // 会話カウント

    energy: number;
    energy_per:     number;
    food:           number;
    food_per:       number;
    level_tech:     number;
    level_explore:  number;
    level_farm:     number;
}

export const DEFAULT_PARAMS_PLAYER = {
    name: '主人公',
    ap:   5,
    vital: 100,
    ero: 0
}
export const DEFAULT_PARAMS_HEROINE = {
    love: 5,
    ero: 50
}
export const DEFAULT_PARAMS_BASE = {
    energy: 100,
    energy_per: 0,
    food: 500,
    food_per: 0,
    level_tech: 0,
    level_explore: 0,
    level_farm: 0,
}


export function createPlayer(name:string, ap:number, max_ap:number, vital: number, ero: number): Player {
    return {
        name,
        ap,
        max_ap,
        vital,
        ero
    }
}
export function createHeroine(love:number, ero: number): Heroine {
    return {
        love,
        ero
    }
}
export function createBase(day:number,time:number, money:number, talk_count: number,
                            energy: number, energy_per: number,
                            food: number, food_per: number, 
                            level_tech: number, level_explore: number, level_farm: number): Base {
    return {
        day,
        time,
        money,
        talk_count,
        energy,
        energy_per,
        food,
        food_per,
        level_tech,
        level_explore,
        level_farm
    }
}


/**
 * パラメータ
 */
export type Param = {
    target: PARAM_GROUP,
    property: string,
    operator: PARAM_OP,
    value: any 
}

export type ParamJustAsg = {
    property: string,
    value: any
}

export enum PARAM_OP {
    ADD,    // +
    SUB,    // -
    MUL,    // *
    DIV,    // /
    ASG,    // =
    STR,    // 文字列
    POW,    // 累乗
    MOD,    // 剰余
}

export type ParamChange = {
    paramName: string;
    paramValue: any;
}


/**
 * パラメータ変更管理
 */
export class ParameterManager {
    private static _instance: ParameterManager;
    private _player: Player;
    private _heroine: Heroine;
    private _base: Base;

    private _parameterChangeSubject: Subject<ParamChange> = new Subject<ParamChange>();
    public get paramChange$() {
        return this._parameterChangeSubject.asObservable();
    }


    constructor(c? : Partial<ParameterManager>) {
        
        if (!ParameterManager._instance) {
            // TODO: セーブデータの読み込み
            ParameterManager._instance = this;

            // this._player = {...DEFAULT_PARAMS_PLAYER as Player};
            // this._heroine = {...DEFAULT_PARAMS_HEROINE as Heroine};
            // this._base = {...DEFAULT_PARAMS_BASE as Base};

            // パラメータ初期化
            this._player = {...RData.FetchParams.Player() as Player};
            this._heroine = {...RData.FetchParams.Heroine() as Heroine};
            this._base = {...RData.FetchParams.Base() as Base};

        }
        else {
            return ParameterManager._instance;
        }
    }


    public static get instance(): ParameterManager {
        if (ParameterManager._instance) {
            return ParameterManager._instance
        }
        else {
            throw new Error(this.constructor.name + ':パラメーターマネージャー未初期化');
        }
    }

    /**
     * 指定されたパラメータをセットする
     * @returns 実行後メッセージ 
     */
    public setParam(p: Param, isRetMsg = false): string {
        let msg = '';
        let idxTarget = '';
        let sTarget = '';       // 表示する文字列
        let sProperty = '';     // 表示する文字列

        if (p.target != undefined || p.target != null) {
            // 変更ターゲットの文字列設定
            switch(p.target) {
                case PARAM_GROUP.PLAYER:
                    msg += this._player.name;
                    idxTarget = '_player';
                    sTarget = '主人公';
                    break;
                case PARAM_GROUP.HEROINE:
                    msg += CTEXT.W_HEROINE_NAME;
                    idxTarget = '_heroine';
                    sTarget = CTEXT.W_HEROINE_NAME;
                    break;
                case PARAM_GROUP.BASE:
                    msg += CTEXT.W_BASE;
                    idxTarget = '_base';
                    sTarget = CTEXT.W_BASE;
                    break;
                default:
                    throw new Error(this.constructor.name + ':ターゲット未指定:' + p.target);
                    break;
            }

            msg += ' の ';
        }
        else {
            throw new Error(this.constructor.name + ':ターゲットが存在しない:' + p.target);
        }

        if (p.property in this[idxTarget]) {
            // 変更プロパティの文字列設定
            sProperty = Object.keys(STEXT).indexOf(p.property.toUpperCase()) 
                ? STEXT[p.property.toUpperCase()]
                : p.property;
            msg +=  sProperty;
            msg += ' が ';

            // パラメーター変更実行
            const prevValue = this[idxTarget][p.property];  // 直前の値
            switch(p.operator) {
                case PARAM_OP.ADD:
                    if (Number.isNaN(p.value)) {
                        throw new Error(this.constructor.name + ':数値以外(ADD)')
                    }
                    this[idxTarget][p.property] += p.value;
                    break;

                case PARAM_OP.SUB:
                    if (Number.isNaN(p.value)) {
                        throw new Error(this.constructor.name + ':数値以外(SUB)')
                    }
                    this[idxTarget][p.property] -= p.value;
                    break;

                case PARAM_OP.MUL:
                    if (Number.isNaN(p.value)) {
                        throw new Error(this.constructor.name + ':数値以外(MUL)')
                    }
                    this[idxTarget][p.property] *= p.value;
                    break;

                case PARAM_OP.DIV:
                    if (Number.isNaN(p.value)) {
                        throw new Error(this.constructor.name + ':数値以外(DIV)')
                    }
                    this[idxTarget][p.property] /= p.value;
                    break;

                case PARAM_OP.ASG:
                    if (Number.isNaN(p.value)) {
                        throw new Error(this.constructor.name + ':数値以外(ASG)')
                    }
                    this[idxTarget][p.property] = p.value;
                    break;

                case PARAM_OP.STR:
                    this[idxTarget][p.property] = p.value;
                    break;

                default:
                    break;
            }

            if (p.operator != PARAM_OP.STR) {
                const diff = this[idxTarget][p.property] - prevValue;

                if (diff < 0) {
                    msg += diff.toString() + '下がった' + `(現在値${this[idxTarget][p.property]})`;
                }
                else {
                    msg += diff.toString() + '上がった' + `(現在値${this[idxTarget][p.property]})`;
                }
            }
            else {
                msg = null;   // 直接文字列代入の場合はメッセージなし
            }

            // パラメーター変更通知
            try {
                this._parameterChangeSubject.next({paramName: p.property, paramValue: this[idxTarget][p.property]});
            }
            catch(e) {
                console.log(e);
            }
        }
        else {
            throw new Error(this.constructor.name + ':指定されたパラメーターは存在しません:' + p.property + ' in ' + sTarget);    // TODO: p.targetはただの数値
        }

        if (!isRetMsg) {
            msg = null;
        }

        return msg;
    }

    public setParams(params: Array<Param>) {
        for (const p of params) {
            this.setParam(p);
        }
    }


    public set Player(player: Player) {
        this._player = player;
    }
    public set Heroine(heroine: Heroine) {
        this._heroine = heroine;
    }
    public set Base(base:Base) {
        this._base = base;
    }

    // 直GET
    public get Player(): Player {
        return this._player;
    }
    public get Heroine(): Heroine {
        return this._heroine;
    }
    public get Base(): Base {
        return this._base;
    }

    // 簡易代入
    public setPlayerParam(p: ParamJustAsg) {
        this.setParam({target: PARAM_GROUP.PLAYER, property: p.property, operator: PARAM_OP. ASG, value: p.value}, false);
    }
    public setHeroineParam(p: ParamJustAsg) {
        this.setParam({target: PARAM_GROUP.HEROINE, property: p.property, operator: PARAM_OP. ASG, value: p.value}, false);
    }
    public setBaseParam(p: ParamJustAsg) {
        this.setParam({target: PARAM_GROUP.BASE, property: p.property, operator: PARAM_OP. ASG, value: p.value}, false);
    }


    /** 
     * 指定したパラメータの値取得
    */
    public getParam(group:PARAM_GROUP, propertyName: string): any {
        switch(group) {
            case PARAM_GROUP.PLAYER:
                if (this._player[propertyName] != undefined) {
                    return this._player[propertyName];
                }
                else {
                    throw new Error(this.constructor.name + ':指定されたパラメーターは存在しません:' + propertyName + ' in プレイヤー');
                }
                break;

            case PARAM_GROUP.HEROINE:
                if (this._heroine[propertyName] != undefined) {
                    return this._heroine[propertyName];
                }
                else {
                    throw new Error(this.constructor.name + ':指定されたパラメーターは存在しません:' + propertyName + ' in ヒロイン');
                }
                break;

            case PARAM_GROUP.BASE:
                if (this._base[propertyName] != undefined) {
                    return this._base[propertyName];
                }
                else {
                    throw new Error(this.constructor.name + ':指定されたパラメーターは存在しません:' + propertyName + ' in 拠点');
                }
                break;

            default:
                throw new Error(this.constructor.name + ': パラメーターグループの指定が不正です');
                break;
        }
    }
}