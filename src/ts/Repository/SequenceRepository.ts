import RText from  'RText';
import { IRepository } from './IRepository';

export type Sequence = Array<Script>;

export type Script =  {
    text? :string,
    speaker? :string,
    chara :Array<ScriptCharaConfig>
}

export type ScriptCharaConfig = {
    sprite? :string,
    x? :any,
    y? :any,
    face: number,
    animation: object
}

const FACE_ID = {
    DEFAULT: 0,
    SMILE: 1,
    ANGER: 2,
    SADNESS: 3,
    HAPPY: 4,
    SURPRIZED: 5
};

export class SequenceRepository implements IRepository<Sequence> {
    
    private static _instance: SequenceRepository;
    repogitory: any;

    constructor(c? : Partial<SequenceRepository>) {
        if (!SequenceRepository._instance) {
            Object.assign(this, c);
            this.repogitory = RText;
        }
        else {
            return SequenceRepository._instance;
        }
    }

    public static get instance(): SequenceRepository {
        if (SequenceRepository._instance) {
            return SequenceRepository._instance
        }
        else {
            return new SequenceRepository();
        }
    }

    public async load(id: number): Promise<Sequence> {
        return RText.FetchScript.All(id);
    }

    public async loadAll(idList: number[]): Promise<Array<Sequence>> {
        return idList.map((i) => RText.FetchScript.All(i)); 
    }
    public async store(object: Sequence): Promise<boolean> {
        throw new Error('Method not implemented.');
        return false;
    }
    public async storeAll(objList: Sequence[]): Promise<boolean> {
        throw new Error('Method not implemented.');
        return false;
    }
}