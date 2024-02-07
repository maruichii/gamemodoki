import RData from 'RData'; 
import { Sequence, SideEffectBunch } from 'ts/Repository/EventRepository';

export type SystemPreferences = {
    master_vol  : number,
    text_speed  : number,
}

export type SystemData = {
    current_scene:    string,
    current_sequence: Sequence,
    current_cursor:   number,
    current_sideeffect_index: number,
    current_sideeffect_list: Array<SideEffectBunch>
    backlog: Array<Backlog>,
}

export type Backlog = {
    speaker? :  string,
    text:       string
}

export class SystemDataManager {

    private static _instance: SystemDataManager;
    private _prefs:   SystemPreferences;
    private _sysdata: SystemData;
    

    constructor(c? : Partial<SystemDataManager>) {
        if (!SystemDataManager._instance) {
            // TODO: セーブデータの読み込み
            SystemDataManager._instance = this;

            // データ初期化
            this._prefs ={...RData.FetchSysData.Prefs()};
            this._sysdata ={...RData.FetchSysData.Data()};
        }
        else {
            return SystemDataManager._instance;
        }
    }

    public static get instance(): SystemDataManager {
        if (SystemDataManager._instance) {
            return SystemDataManager._instance
        }
        else {
            throw new Error(this.constructor.name + ':システムデータマネージャー未初期化');
            return null;
        }
    }

    public set prefs(value: SystemPreferences) {
        this._prefs = value;
    }
    public get prefs(): Object {
        return this._prefs;
    }

    public set sysdata(value: SystemData) {
        this._sysdata = value;;
    }
    public get sysdata(): SystemData {
        return this._sysdata;
    }

    public pushBacklog(log: Backlog) {
        this._sysdata.backlog.push(log);
        if (this._sysdata.backlog.length > 100) {
            // 100件超えたら先頭要素削除
            this._sysdata.backlog.shift();
        }
    }

}