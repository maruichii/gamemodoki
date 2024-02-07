import * as PIXI from 'pixi.js';
import { GameComponent, GameComponentState, IGameComponent, IGameComponentDelegate } from "../../Core/IGameComponent";


export class SimplePixiObject extends GameComponent implements IGameComponent {
    objectLabel: string = '';
    renderObject: PIXI.DisplayObject = new PIXI.Container();
    gameComponentDelegate?: IGameComponentDelegate;
    state: GameComponentState;

    constructor(c? : Partial<SimplePixiObject>) {
        super();
        Object.assign(this, c);
    }
}