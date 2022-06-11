import * as PIXI from 'pixi.js'; 
import RSprite from 'RSprite';
import { Game } from '../Engine/Core/Game';
import { IRepository } from './IRepository';


export class TextureRepository implements IRepository<Array<[string, PIXI.Texture]>> {
    
    private static _instance: TextureRepository;
    private baseUri = RSprite.BASEURI;
    repogitory: PIXI.Loader;
    

    constructor(c? : Partial<TextureRepository>) {
        if (!TextureRepository._instance) {
            Object.assign(this, c);
            this.repogitory = Game.instance.app.loader;
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
        if (RSprite.SPRITE[id] != undefined) {
            this.repogitory.add(id, this.baseUri + RSprite.SPRITE[id].target);
        }
    }

    /**
     * 登録された画像ファイルを一括で読み込む
     * @returns 読み込んだテクスチャとそのキーの一覧
     */
    public async load(): Promise<Array<[string, PIXI.Texture]>> {
        return new Promise<Array<[string, PIXI.Texture]>>((resolve, reject) => {
            // 画像ファイルを読み込み
            this.repogitory.load(() => {
                // 読み込み完了したらテクスチャを返す
                resolve(Object.keys(this.repogitory.resources).map((t) => [t, this.repogitory.resources[t].texture]) );
            });
        });
    }

    public get(id:string): PIXI.Texture {
        if (this.repogitory.resources[id] != undefined) {
            return this.repogitory.resources[id].texture;
        }
        else {
            throw new Error(id + ' に該当するテクスチャが読み込まれていません');
        }
    }


    loadAll(idList: any[]): Promise<any[]> {
        throw new Error('Method not implemented.');
    }


    store(object: Array<[string, PIXI.Texture]>): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    storeAll(objList: Array<[string, PIXI.Texture]>[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

}