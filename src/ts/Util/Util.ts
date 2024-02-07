import * as PIXI from "pixi.js";
import { Game } from "../Engine/Core/Game";
import { Base, Heroine, ParameterManager, Player } from "ts/Engine/Core/ParameterManager";
import { FlagManager } from "ts/Engine/Core/FlagManager";
import { SystemData, SystemDataManager, SystemPreferences } from "ts/Engine/Core/SystemDataManager";
import { BUILD_MODE, LoveLevelExp, LoveLevelText } from "ts/Const";

export function sleep(msec:number):Promise<void> {
    return new Promise(resolve => setTimeout(resolve, msec));
}

// どこのクラスで吐いたかわからない
export function log(obj: any) {
    console.log(obj);
}


export enum RATIO_TO_PIX_TYPE {
    WIDTH  = 0,
    HEIGHT = 1,
}

export type SaveData = {
    player: Player,
    heroine: Heroine,
    base: Base,
    flags: Object,
    prefs: SystemPreferences,
    sysdata: SystemData
}


/**
 * データセーブ
 * @param id セーブデータ番号
 */
export async function SaveGame(id: string = '1'): Promise<void> {
    const paramManager = ParameterManager.instance;
    const flagManager = FlagManager.instance;
    const sysdataManager = SystemDataManager.instance;

    const data = {
        header: {
            day: paramManager.Base.day,
            money: paramManager.Base.money,
            love:  loveParamToLevel(paramManager.Heroine.love)
        },
        player: paramManager.Player,
        heroine: paramManager.Heroine,
        base: paramManager.Base,
        flags: flagManager.flags,
        prefs: sysdataManager.prefs,
        sysdata: sysdataManager.sysdata
    };

    try {
        if (BUILD_MODE == 'web') {
            window.localStorage.setItem('save_' + id, JSON.stringify(data));
        }
        else if (BUILD_MODE == 'electron') {
            const fs = require('fs');
            fs.writeFileSync('save/data_' + id +'.json', JSON.stringify(data));
        }
    }
    catch (e) {
        window.alert('セーブ失敗\nご利用の環境ではセーブ機能が正常に動作しない可能性があります');
    }
}



/**
 * セーブデータロード
 * @param id セーブデータ番号
 * @returns 遷移先シーン名
 */
export function LoadGame(id: string = '1'): string {
    let data: SaveData = null;

    /**
     * ファイル or ローカルストレージから読み込み
     */
    try {
        if (BUILD_MODE == 'web') {
            data = JSON.parse(localStorage.getItem('save_' + id) ) as SaveData;
        }
        else if (BUILD_MODE == 'electron') {
            const fs = require('fs');
            data = JSON.parse(fs.readFileSync('save/data_' + id +'.json')) as SaveData;
        }
    }
    catch(e) {
        window.alert('セーブデータが読み込めません');
        console.log(e);
        return '';
    }

    if (data == null) {
        window.alert('セーブデータがないみたいです');
        return '';
    }


    /**
     * ゲームオブジェクト復帰
     */
    try {
        ParameterManager.instance.Player = data.player;
        ParameterManager.instance.Heroine = data.heroine;
        ParameterManager.instance.Base = data.base;
        
        FlagManager.instance.flags = data.flags;

        SystemDataManager.instance.prefs = data.prefs;
        SystemDataManager.instance.sysdata = data.sysdata;
    }
    catch(e) {
        window.alert('セーブデータが読み込めません');
        console.log(e);
        return '';
    }

    return SystemDataManager.instance.sysdata.current_scene;
} 


/**
 * SystemData上からイベントデータをクリア
 */
export function ClearEventBuffer() {
    SystemDataManager.instance.sysdata.current_cursor = 0;
    SystemDataManager.instance.sysdata.current_sequence = [];
    SystemDataManager.instance.sysdata.current_sideeffect_index = 0;
    SystemDataManager.instance.sysdata.current_sideeffect_list = [];
}





export function loveParamToLevel(val: number): string {
    const isRescued = FlagManager.instance.flags['IS_RESCUED'];   // 救出済みフラグ
    const idx = isRescued? 1 : 0;   // 参照データインデックス
    let loveLevel:  number;

    const expTable = LoveLevelExp[idx];
    const textTable = LoveLevelText[idx];

    loveLevel =
        val < expTable[0] ?    0 :     // 5
        val < expTable[1] ?    1 :     // 20
        val < expTable[2] ?    2 :     // 40
        3; 

    return textTable[loveLevel];
}


export function ratioToPix(ratio: number, type: RATIO_TO_PIX_TYPE): number {
    const game = Game.instance;

    if (game == null) {
        throw new Error('Util.ratioToPix(): Gameが未初期化');
    }

    switch(type) {
        case RATIO_TO_PIX_TYPE.WIDTH:
            return game.width * ratio;
            break;

        case RATIO_TO_PIX_TYPE.HEIGHT:
            return game.height * ratio;
            break;

        default:
            throw new Error('Util.ratioToPix(): 変換タイプが指定されていないか不正')
            break;
    }
}


export function recursiveDestroyPixiObject(pixiObj: PIXI.DisplayObject) {
    if (pixiObj instanceof PIXI.Container) {
        pixiObj.children.map((c) => {
            recursiveDestroyPixiObject(c);
        })
    }
    pixiObj.destroy();
}



// 色が暗いかどうかを判定する関数
export function isDarkColor(color:string) {
    // 引数で受け取った色を16進数に変換
    const hexColor = color.charAt(0) === '#' ? color : `#${color}`;
    const numColor = parseInt(hexColor.slice(1), 16);

    // 色をRGBに変換
    const r = (numColor >> 16) & 255;
    const g = (numColor >> 8) & 255;
    const b = numColor & 255;

    // 輝度を計算 (YIQ輝度式を使用)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness < 128; // 128は輝度の中間点
}

// 色を明るくする関数
export function lightenColor(color:string, amount:number = 30) {
    // 引数で受け取った色を16進数に変換
    const hexColor = color.charAt(0) === '#' ? color : `#${color}`;
    const numColor = parseInt(hexColor.slice(1), 16);

    // 各色を分解
    const r = (numColor >> 16) & 255;
    const g = (numColor >> 8) & 255;
    const b = numColor & 255;

    // 輝度を計算 (YIQ輝度式を使用)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 調整された輝度を計算
    const adjustedBrightness = (brightness + amount) / brightness;

    // 新しいRGBを計算
    const newR = Math.min(Math.ceil(r * adjustedBrightness), 255);
    const newG = Math.min(Math.ceil(g * adjustedBrightness), 255);
    const newB = Math.min(Math.ceil(b * adjustedBrightness), 255);

    // 新しい色を16進数に変換し、CSSの色表記に変換
    const resultColor = `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;

    return resultColor;
}

// 色を暗くする関数
export function darkenColor(color:string, amount:number = 30) {
    // 引数で受け取った色を16進数に変換
    const hexColor = color.charAt(0) === '#' ? color : `#${color}`;
    const numColor = parseInt(hexColor.slice(1), 16);

    // 各色を分解
    const r = (numColor >> 16) & 255;
    const g = (numColor >> 8) & 255;
    const b = numColor & 255;

    // 輝度を計算 (YIQ輝度式を使用)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 調整された輝度を計算
    const adjustedBrightness = Math.max((brightness - amount) / brightness, 0);

    // 新しいRGBを計算
    const newR = Math.min(Math.ceil(r * adjustedBrightness), 255);
    const newG = Math.min(Math.ceil(g * adjustedBrightness), 255);
    const newB = Math.min(Math.ceil(b * adjustedBrightness), 255);

    // 新しい色を16進数に変換し、CSSの色表記に変換
    const resultColor = `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`;

    return resultColor;
}