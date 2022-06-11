import * as PIXI from 'pixi.js';
import { IGameComponent } from "../../Core/IGameComponent";

export class EmptyComponent implements IGameComponent {
    objectLabel: string = '';
    renderObject: PIXI.DisplayObject;

    constructor(c? : Partial<EmptyComponent>) {
        Object.assign(this, c);

        this.renderObject = new PIXI.Container();
    }

    render(): void {
        return ;
    }
    init(): Promise<void> {
        return ;
    }
    start(): Promise<void> {
        return ;
    }
    doUpdate(): Promise<void> {
        return ;
    }
    doFixedUpdate(): Promise<void> {
        return ;
    }
    destroy(): void {
        return ;
    }

}