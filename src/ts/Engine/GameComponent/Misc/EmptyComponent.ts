import * as PIXI from 'pixi.js';
import { GameComponentState, IGameComponent, IGameComponentDelegate } from "../../Core/IGameComponent";

export class EmptyComponent implements IGameComponent {
    objectLabel: string = '';
    renderObject: PIXI.DisplayObject;

    constructor(c? : Partial<EmptyComponent>) {
        Object.assign(this, c);

        this.renderObject = new PIXI.Container();
    }
    rawX: number;
    rawY: number;
    x: number;
    y: number;
    xOffset: number;
    yOffset: number;
    updateX() {
        throw new Error('Method not implemented.');
    }
    updateY() {
        throw new Error('Method not implemented.');
    }
    gameComponentDelegate?: IGameComponentDelegate;
    state: GameComponentState;
    afterUpdate(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    die(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    suspend(): void {
        throw new Error('Method not implemented.');
    }
    resume(): void {
        throw new Error('Method not implemented.');
    }
    setGameComponentDelegate?(delegate: IGameComponentDelegate): void {
        throw new Error('Method not implemented.');
    }
    onTap?(e: PIXI.FederatedPointerEvent): void {
        throw new Error('Method not implemented.');
    }
    onClose?(): void {
        throw new Error('Method not implemented.');
    }

    renderComponent(): void {
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
}