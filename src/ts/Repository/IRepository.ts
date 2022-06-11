export interface IRepository<T> {
    // instance: IReopsitory<T>;
    // getInstance(): IReopsitory<T>;
    repogitory: any;
    load(id: any): Promise<T>;
    loadAll(idList: Array<any>): Promise<Array<any>>;
    store(object: T): Promise<boolean>;
    storeAll(objList: Array<T>): Promise<boolean>;
}