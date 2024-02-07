/**
 * pixiでゲームUIを作ってみる
 */

import '@babel/polyfill';
import * as PIXI from 'pixi.js';
import { Game } from './Engine/Core/Game';
import { SceneEntry } from './Scene/SceneEntry';
import { SceneSampleSequence } from './Scene/SceneSampleSequence';
import { SceneFrontDoor } from 'ts/Scene/SceneFrontDoor';
import { SceneOpening } from 'ts/Scene/SceneOpening';

import { DOCROOT, GAME_HEIGHT, GAME_WIDTH, STORYEVENT_BASEID } from 'ts/Const';
import { SceneGenkan } from 'ts/Scene/SceneGenkan';
import { SceneSimpleEvent } from 'ts/Scene/SceneSimpleEvent';
import { Scene } from 'ts/Engine/Core/Scene';

entry();

async function entry() {

    // PIXI.Assets.addBundle('fonts', {
    //     // 'Zen Kaku Gothic New': DOCROOT + 'res/font/ZenKakuGothicNew-Regular.ttf',
    //     'Zenkakugothicnew Medium': DOCROOT + 'res/font/ZenKakuGothicNew-Medium.ttf',
    //     // 'Zen Kaku Gothic New Bold': DOCROOT + 'res/font/ZenKakuGothicNew-Bold.ttf',
    // });

    // PIXI.Assets.add("Zenkaku-R", DOCROOT + 'res/font/ZenKakuGothicNew-Regular.ttf');
    // PIXI.Assets.add("Zenkaku-M", DOCROOT + 'res/font/ZenKakuGothicNew-Medium.ttf');
    // PIXI.Assets.add("Zenkaku-B", DOCROOT + 'res/font/ZenKakuGothicNew-Bold.ttf');
    // PIXI.Assets.add("Notosansjp-R", DOCROOT + 'res/font/NotoSansJP-Regular.ttf');
    PIXI.Assets.add("Notosansjp-M", DOCROOT + 'res/font/NotoSansJP-Medium.ttf');
    PIXI.Assets.add("Notosansjp-B", DOCROOT + 'res/font/NotoSansJP-Bold.ttf');
    // Wait until pixi fonts are loaded before resolving
    const fonts = await PIXI.Assets.load([
        // "Zenkaku-R",
        // "Zenkaku-M",
        // "Zenkaku-B",
        // "Notosansjp-R",
        "Notosansjp-M",
        "Notosansjp-B"
    ])
    console.log(fonts);

    // PixiJS設定
    // PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

    // 日本語テキストのベースライン調整
    PIXI.TextMetrics.BASELINE_SYMBOL += "あ｜";
    let game = new Game({width: GAME_WIDTH, height: GAME_HEIGHT, gameHtmlElmId: 'game'});
    let mw = { w: game.app.screen.width  * 0.95, h: game.app.screen.height  * 0.25 };

    // シーンを生成
    let scene: Scene;
    scene = new SceneEntry();
    // scene = new SceneOpening();
    // scene = new SceneFrontDoor();
    // scene = new SceneSimpleEvent({eventId: STORYEVENT_BASEID + 1000 + 2, destSceneName: 'SceneGenkan'});
    // scene = new SceneGenkan();
    game.addScene('scene1', scene);
    await game.setActiveScene('scene1');
    
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