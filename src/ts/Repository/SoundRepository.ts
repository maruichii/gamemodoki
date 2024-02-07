import * as Util from '../Util/Util';
import * as PIXI from 'pixi.js'; 
import { Assets } from 'pixi.js';
import RSound from 'RSound';
import { Game } from '../Engine/Core/Game';
import { IRepository } from './IRepository';
import { sound } from '@pixi/sound';


export class SoundRepository implements IRepository<Record<string, any>> {
    
    private static _instance: SoundRepository;
    private _baseUri = RSound.BASEURI;
    private _registeredIdList: Array<string>; 

    repogitory: PIXI.AssetsClass;    
    

    constructor(c? : Partial<SoundRepository>) {
        if (!SoundRepository._instance) {
            Object.assign(this, c);
            this._registeredIdList = new Array<string>();
            this.repogitory = Assets;

            SoundRepository._instance = this;
        }
        else {
            return SoundRepository._instance;
        }
    }

    public static get instance(): SoundRepository {
        if (SoundRepository._instance) {
            return SoundRepository._instance
        }
        else {
            return new SoundRepository();
        }
    }

    /**
     * 音源ファイルを読み込みキューに追加する
     * @param id 画像ファイルID(RSoundでIDと実ファイル名を紐づけ)
     */
    public register(id: string): void {
        if (RSound.BGM[id] != undefined && RSound.SE[id] != undefined ) {
            throw new Error(this.constructor.name + ':指定された音源はサウンドリソースリストにありません');
        }

        if (!this._registeredIdList.includes(id)) {
            if (RSound.BGM[id] != undefined) {
                // BGM
                this._registeredIdList.push(id);
                this.repogitory.add(id, this._baseUri + RSound.BGM[id].target);
            }
            else if (RSound.SE[id] != undefined) {
                // SE
                this._registeredIdList.push(id);
                this.repogitory.add(id, this._baseUri + RSound.SE[id].target);
            }
        }
        else {
            console.log('サウンドリソース登録済み');
        }
        console.log(this._registeredIdList);
    }

    /**
     * 登録された画像ファイルを一括で読み込む
     * @returns 読み込んだテクスチャとそのキーの一覧
     */
    public async load(): Promise<Record<string, any>> {
        console.log(this._registeredIdList);
        return this.repogitory.load(this._registeredIdList);
    }

    public get(id:string): PIXI.Texture {
        return this.repogitory.get(id);
    }


    loadAll(idList: any[]): Promise<any[]> {
        throw new Error('Method not implemented.');
    }


    public async unload(id:string): Promise<void> {
        if (this._registeredIdList.includes(id) && sound.exists(id)) {
            try {
                sound.remove(id);
                await this.repogitory.unload(id);
            }
            catch(e) {
                // throw new Error(this.constructor.name + ':' + e);
                console.log(this.constructor.name + ':' + e);
            }
            finally {
                const idx = this._registeredIdList.indexOf(id);
                if (idx >= 0) {
                    this._registeredIdList.splice(idx, 1);
                }
            }
        }
        else {
            console.log(this.constructor.name + ':指定された音源はロードされていません');
        }
    }


    store(object: Array<[string, PIXI.Texture]>): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    storeAll(objList: Array<[string, PIXI.Texture]>[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}