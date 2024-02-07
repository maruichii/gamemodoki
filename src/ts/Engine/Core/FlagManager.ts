import RData from 'RData'; 

export class FlagManager {

    private static _instance: FlagManager;
    private _flags: Object;
    

    constructor(c? : Partial<FlagManager>) {
        if (!FlagManager._instance) {
            // TODO: セーブデータの読み込み
            FlagManager._instance = this;

            // フラグ初期化
            this._flags ={...RData.FetchFlags.All()};
        }
        else {
            return FlagManager._instance;
        }
    }

    public static get instance(): FlagManager {
        if (FlagManager._instance) {
            return FlagManager._instance
        }
        else {
            throw new Error(this.constructor.name + ':フラグマネージャー未初期化');
            return null;
        }
    }

    public set flags(value: Object) {
        this._flags = value;
    }

    public get flags(): Object {
        return this._flags;
    }


    public setFlag(flagName: string, value:boolean): void {
        if (this._flags[flagName] != undefined) {
            this._flags[flagName] = value;
        }
        else {
            this._flags[flagName] = value;
            // throw new Error(this.constructor.name + ':指定されたフラグは存在しません');
        }
    }

    // 一括設定
    public setFlags(flags: Map<string, boolean>): void {
        for (const [key, value] of flags) {
            this.setFlag(key, value);
        }
    }


    public getFlag(flagName: string): boolean {
        if (this._flags[flagName] != undefined) {
            return this._flags[flagName];
        }
        else {
            console.log('flag new set');
            this._flags[flagName] = false;
            return false;
            // throw new Error(this.constructor.name + ':指定されたフラグは存在しません');
        }
    }
}