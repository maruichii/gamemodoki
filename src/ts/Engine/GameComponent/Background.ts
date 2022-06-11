import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { IGameComponent } from '../Core/IGameComponent';
import { ITweenPIXIGraphics } from '../Core/ITweenDisplayObject';

// register the plugin
gsap.registerPlugin(PixiPlugin);

/**
 * UIウィンドウ基底クラス
 * コンストラクタ引数 {
 *   width:     テキストウィンドウ幅
 *   height:    テキストウィンドウ高さ
 *   x:         テキストウィンドウ表示位置(親コンテナ基準)
 *   y:         テキストウィンドウ表示位置(親コンテナ基準)
 *   textStyle: テキストのスタイル(PIXI.TextStyle)
 * }
 */
// export class Background implements IGameObject {
//     private 
// }