import * as PIXI from 'pixi.js';
import { Game } from '../Core/Game';
import { ISideEffectDispacher } from '../Core/IEffectDispacher';
import { Param, ParameterManager } from '../Core/ParameterManager';

export class PlayerEffectDispatcher implements ISideEffectDispacher {
    game: Game;
    parameterManager: ParameterManager;

    constructor(c? : Partial<PlayerEffectDispatcher>) {
        Object.assign(this, c);

        this.parameterManager = new ParameterManager();
    }


    dispatch(params: Array<Param>, functionName: string): void {
        this.parameterManager.setParams(params);
    }

}