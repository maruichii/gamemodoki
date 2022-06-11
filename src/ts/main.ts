/**
 * pixiでゲームUIを作ってみる
 */

import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import { Game } from './Engine/Core/Game';
import { EntryScene } from './Scene/EntryScene';


entry();

function entry() {

    // PixiJS設定
    // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;
    // 日本語テキストのベースライン調整

    PIXI.TextMetrics.BASELINE_SYMBOL += "あ｜";
    let game = new Game({width: 1440, height: 810, gameHtmlElmId: 'game'});
    let mw = { w: game.app.screen.width  * 0.95, h: game.app.screen.height  * 0.25 };

    // シーンを生成
    let scene1 = new EntryScene();
    game.addScene('scene1', scene1);
    game.setActiveScene('scene1');
    
    // ゲーム開始
    game.startGame();

    /**
     * BGM
     */
    // const bgm = PIXI.sound.Sound.from({
    //     url: './res/sound/n38.mp3',
    //     preload: true,
    // });
}