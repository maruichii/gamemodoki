import * as PIXI from 'pixi.js';
import {Game} from './Game';


// イベント実行に伴う副作用の実行
export interface ISideEffectDispacher {
    game: Game;
    dispatch(param: any, functionName: string);
}