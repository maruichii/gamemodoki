import * as Util from '../Util/Util';
import * as PIXI from 'pixi.js'; 
import { Assets } from 'pixi.js';
import RSprite from 'RSprite';
import { Game } from '../Engine/Core/Game';
import { IRepository } from './IRepository';


export class TextureRepository implements IRepository<Record<string, any>> {
    
    private static _instance: TextureRepository;
    private _baseUri = RSprite.BASEURI;
    private _registeredIdList: Array<string>; 

    repogitory: PIXI.AssetsClass;    
    

    constructor(c? : Partial<TextureRepository>) {
        if (!TextureRepository._instance) {
            Object.assign(this, c);
            this._registeredIdList = new Array<string>();
            this.repogitory = Assets;

            TextureRepository._instance = this;
        }
        else {
            return TextureRepository._instance;
        }
    }

    public static get instance(): TextureRepository {
        if (TextureRepository._instance) {
            return TextureRepository._instance
        }
        else {
            return new TextureRepository();
        }
    }

    /**
     * 画像ファイルを読み込みキューに追加する
     * @param id 画像ファイルID(RSpriteでIDと実ファイル名を紐づけ)
     */
    public register(id: string): void {
        if (RSprite.SPRITESHEET[id] != undefined && RSprite.SPRITE[id] != undefined ) {
            throw new Error(this.constructor.name + ':指定された画像は画像リソースリストにありません');
        }

        if (!this._registeredIdList.includes(id)) {
            if (RSprite.SPRITESHEET[id] != undefined) {
                // スプライトシート
                this._registeredIdList.push(id);
                this.repogitory.add(id, this._baseUri + RSprite.SPRITE[id].target);
            }
            else if (RSprite.SPRITE[id] != undefined) {
                // 単体画像
                this._registeredIdList.push(id);
                this.repogitory.add(id, this._baseUri + RSprite.SPRITE[id].target);
            }
        }
        else {
            // console.log('テクスチャ登録済み');
        }
        // console.log(this._registeredIdList);
    }

    /**
     * 登録された画像ファイルを一括で読み込む
     * @returns 読み込んだテクスチャとそのキーの一覧
     */
    public async load(): Promise<Record<string, any>> {
        // console.log(this._registeredIdList);
        return this.repogitory.load(this._registeredIdList);

        // v5以前
        // return new Promise<Array<[string, PIXI.Texture]>>((resolve, reject) => {
            // 画像ファイルを読み込み
            // this.repogitory.load(() => {
            //     // 読み込み完了したらテクスチャを返す
            //     resolve(Object.keys(this.repogitory).map((t) => [t, this.repogitory.resources[t].texture]) );
            // });
        // });
    }

    public get(id:string, sheet: string = null): PIXI.Texture {
        if (sheet != null) {
            return PIXI.Assets.get(sheet).textures[id];     // スプライトシートのリソースからparse()して明示的に読み込むことで
 
        }
        else {
            return this.repogitory.get(id);
        }
        // if (this.repogitory.resources[id] != undefined) {
        //     return this.repogitory.resources[id].texture;
        // }
        // else {
        //     throw new Error(id + ' に該当するテクスチャが読み込まれていません');
        // }
    }


    public loadAll(idList: any[]): Promise<any[]> {
        throw new Error('Method not implemented.');
    }

    public unload(id:string):void {
        if (this._registeredIdList.includes(id)) {
            try {
                this.repogitory.unload(id);
            }
            catch(e) {
                throw new Error(this.constructor.name + ':' + e)
            }
            finally {
                const idx = this._registeredIdList.indexOf(id);
                this._registeredIdList.splice(idx, 1);
            }
        }
        else {
            throw new Error(this.constructor.name + ':指定された画像は画像リソースリストにありません');
        }
    }


    store(object: Array<[string, PIXI.Texture]>): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    storeAll(objList: Array<[string, PIXI.Texture]>[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}