import * as PIXI from 'pixi.js';

/**
 * PIXI.Containerのインスタンスにtweenプロパティを生やす用
 */
export interface ITweenPIXIContainer extends PIXI.Container {
    tween?: any;
}

/**
 * PIXI.Graphicsのインスタンスにtweenプロパティを生やす用
 */
export interface ITweenPIXIGraphics extends PIXI.Graphics {
    tween?: any;
}


/**
 * PIXI.Spriteのインスタンスにtweenプロパティを生やす用
 */
export interface ITweenPIXISprite extends PIXI.Sprite {
    tween?: any;
}

/**
 * PIXI.Textのインスタンスにtweenプロパティを生やす用
 */
export interface ITweenPIXIText extends PIXI.Text {
    tween?: any;
}