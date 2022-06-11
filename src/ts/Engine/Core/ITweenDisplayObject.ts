import * as PIXI from 'pixi.js';
export interface ITweenPIXIGraphics extends PIXI.Graphics {
    tween?: any;
}
export interface ITweenPIXISprite extends PIXI.Sprite {
    tween?: any;
}