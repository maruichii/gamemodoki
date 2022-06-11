import * as PIXI from 'pixi.js';
import { TextureRepository } from '../../Repository/TextureRepository';
import { IGameComponent, IGameComponentDelegate } from './IGameComponent';

export type ChildComponent = {
    order: number,
    component: IGameComponent
}

export class Scene implements IGameComponent {
    protected objectList: Array<ChildComponent>;
    protected textures?: Map<string, PIXI.Texture>;
    public objectLabel: string = '';
    public renderObject: PIXI.Container;

    constructor(c? : Partial<Scene>) {
        Object.assign(this, c);
        this.renderObject = new PIXI.Container();
        this.renderObject.sortableChildren = true;
        this.objectList = new Array<ChildComponent>();
    }

    public async init():Promise<void> {
        await TextureRepository.instance.load();
        await Promise.all(this.objectList.map((o) => o.component.init()));
    }

    public async start(): Promise<void> {
        await Promise.all(this.objectList.map((o) => o.component.start()));
    }

    render(): void {
        this.objectList.forEach( o => {
            o.component.render();
        });
    }
    destroy(): void {
        
    }
    async doUpdate(): Promise<void> {
        await Promise.all(this.objectList.map((o) => o.component.doUpdate()));
    }
    async doFixedUpdate(): Promise<void> {
        await Promise.all(this.objectList.map((o) => o.component.doFixedUpdate()));
    }

    public addObject(c : IGameComponent, order: number = 0):void {
        c.renderObject.zIndex = order;
        this.objectList.push({order: order, component: c});
        this.objectList.sort((_, __) => _.order < __.order ? 1 : -1)    // orderで降順に並び替え
        this.renderObject.addChild(c.renderObject);
    }
}