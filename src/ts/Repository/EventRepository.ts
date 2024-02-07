import REvent from 'REvent';
import { IRepository } from './IRepository';
import { PARAM_GROUP, PARAM_OP, Param } from '../Engine/Core/ParameterManager';
import { Scene } from '../Engine/Core/Scene';
import { SoundConfig } from 'ts/Engine/GameComponent/GameSound';


export type Event = {
    sequence?:    Sequence,              // 表示
    sideEffect?:  Array<SideEffectBunch> // 副作用
}


/**
 * シーケンス・スクリプト関連
 */
export type Sequence = Array<Script>;

export type Script = {
    type:       SCRIPT_TYPE,
    text?:      string,
    textParams?: Array<TextParam>,  // 文字列中にゲーム内パラメータを表示する場合

    speaker?:    string,
    chara:       Array<ScriptCharaConfig>,

    background?: BackgroundConfig,
    

    bgm?:        SoundConfig,
    se?:         SoundConfig,
 
    options?:    Array<string>,      // 選択肢分岐 
    conditions?: Array<BR_COND>,     // 数値分岐
    branchs?:    Array<Sequence>,    // 分岐後シーケンス

    sideEffectIdx? :   number,       // 副作用インデックス
}


export type TextParam = {
    type: REF_TYPE,
    target: PARAM_GROUP | string,
    propertyName: string
}

export type ScriptText = {
    text: string,
    textParams?: Array<TextParam>,
    speaker?: string
}


/**
 * シーケンス内の1スクリプトの種類
 */
export enum SCRIPT_TYPE {
    NORMAL      = 0,    // そのまま次へ
    BR_SELECT   = 1,    // プレイヤーが分岐選択
    BR_VALUE    = 2,    // 数値分岐
}

export type BackgroundConfig = {
    alias?:       string,
    transition?:  TRANSITION_TYPE
    screenColor?: number
}

export enum TRANSITION_TYPE {
    NONE  = 0,
    FADE  = 1,
    SLIDE = 2
}

export type BR_COND = {
    operator: BR_OP,
    logic: BR_LOGIC,
    type: REF_TYPE,
    target: PARAM_GROUP | string,
    targetProperty?: string,
    value?: any
}

export type ScriptCharaConfig = {
    sprite? :string,
    x? :any,
    y? :any,
    face: number,
    animation: object
}

export enum FACE_ID {
    DEFAULT,
    SMILE,
    ANGER,
    SADNESS,
    HAPPY,
    SURPRIZED
};

/**
 * 数値分岐のオペレーター
 */
export enum BR_OP {
    EQ = 0,     // =
    NE = 1,     // !=
    GE = 2,     // >=
    LE = 3,     // <=
    GT = 4,     // >
    LT = 5,     // <
    SW = 6      // SWITCH
}

export enum BR_LOGIC {
    AND =  0,
    OR  =  1
}

export enum REF_TYPE {
    PARAM = 0,
    FLAG  = 1
}


/**
 * イベント副作用関連
 */

export type SideEffectBunch = Array<SideEffect>

export type SideEffect = {
    type:   SIDE_EFFECT_TYPE,
    effect: Param | FlagEffect | SceneEffect,
    isResultMsg?: boolean,
    afterMsg?: string
}

export enum SIDE_EFFECT_TYPE {
    PARAM,
    FLAG,
    SCENE
}

// export type Param = {
//     target: string,
//     property: string,
//     operator: PARAM_OP,
//     value: any
// }

export enum PARAM_EFFECT_TARGET {
    PLAYER,
    HEROINE,
    BASE
}

export type FlagEffect = {
    target: string,
    value: boolean
}


/**
 * シーン遷移 or UIの再構築 
 * @property target: 遷移先シーン or 元シーンに渡す数値
 */
export type SceneEffect = {
    type: SCENE_EFFECT_TYPE,
    target: string
}   

export enum SCENE_EFFECT_TYPE {
    MOVESCENE,
    CHANGEUI
}



export class EventRepository implements IRepository<Event> {
    
    private static _instance: EventRepository;
    repogitory: any;

    constructor(c? : Partial<EventRepository>) {
        if (!EventRepository._instance) {
            Object.assign(this, c);
            this.repogitory = REvent;
        }
        else {
            return EventRepository._instance;
        }
    }

    public static get instance(): EventRepository {
        if (EventRepository._instance) {
            return EventRepository._instance
        }
        else {
            return new EventRepository();
        }
    }

    public async load(id: number): Promise<Event> {
        const event = await REvent.FetchEvent.All(id);
        return Object.assign({}, event);
    }

    public async loadAll(idList: number[]): Promise<Array<Event>> {
        return idList.map((i) => REvent.FetchEvent.All(i)); 
    }
    public async store(object: Event): Promise<boolean> {
        throw new Error('Method not implemented.');
        return false;
    }
    public async storeAll(objList: Event[]): Promise<boolean> {
        throw new Error('Method not implemented.');
        return false;
    }
}