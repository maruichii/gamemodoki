/**
 * ステータス関連テキスト
 */
import { TextStyle } from 'pixi.js';

export const BUILD_MODE:string = 'web';

export const DOCROOT = './'

export const COMEVENT_BASEID = 10000000;

export const STORYEVENT_BASEID = 90000000;
export const BASEEVENT_BASEID = 91000000;
export const WORKEVENT_BASEID = 92000000;
export const BADEND_BASEID = 99001001;

export const GAME_WIDTH = 1400;
export const GAME_HEIGHT = 900;

export const LAYER_BG = -100;
export const LAYER_SCENE_FAR_UI  = 1000;        // イベントで隠れるシーンUI
export const LAYER_EVENT_UI      = 10000;       // イベント系 キャラ、セリフウィンドウ
export const LAYER_EVENT_OPTIONS = 11000;       // イベント選択肢
export const LAYER_SCENE_NEAR_UI = 100000;      // イベントで隠れないシーンUI
export const LAYER_SYSTEM        = 1000000;     // 一番前に表示するシステム系UI

export const STEXT = {
    LV:               'レベル',
    AP:               '行動力',
    VITAL:            '体力',
    LOVE:             '親愛度',
    ERO:              'えっち度',
    BASE:             '拠点',
    EXPLORE:          '探索レベル',
    FARM:             '生産レベル',
    TECH:             '開発レベル'
}


/**
 * テキスト
 */
export const CTEXT = {
    W_HEROINE_NAME:     '少女',
    W_LV:               'レベル',
    W_VITAL:            '体力',
    W_LOVE:             '親愛度',
    W_ERO:              'えっち度',
    W_BASE:             '拠点',
    W_EXPLORE:          '探索',
    W_FARM:             '農場',

    S_ITEMGET:      'を手に入れた',
    S_ITEMLOST:     'を失った',
    S_STATUSUP:     'が{{0}}上がった',
    S_STATUSDOWN:   'が{{0}}上がった',

    S_SAVECONFIRM:  'セーブしますか？',
    S_LOADCONFIRM:  '保存したゲームを読み込みます',
}


export const ENV = {
    defaultTextStyle: {
        fontFamily : 'Notosansjp Medium',
        // fontWeight: 'normal',
        lineHeight: 42,
        fontSize: 28,
        fill: '#333333',
        stroke: '#ffffff',
        strokeThickness: 4,
        wordWrap: true,
        breakWords: true
    } as TextStyle,

    defaultButtonStyle : {
        isOnce: false,
        width: GAME_WIDTH * 0.1,
        height: GAME_HEIGHT * 0.1,
        top: 0,
        left: 0,
        backgroundColor: '#ffffff',
        lineColor: '#ffffff',
        lineThickness: 5,
        radius: 18,
        text: '',
        circle: false,
        textStyle: {
            fontFamily : 'Notosansjp Medium',
            // fontWeight: 'normal',
            lineHeight: 42,
            fontSize: 28,
            fill: '#333333',
            stroke: '#ffffff00',
            strokeThickness: 0,
            wordWrap: true,
            breakWords: true
        } as TextStyle
    },
    
    progBarColor: {
        0: "#545a5e",
        1: "#c2eafa",
        2: "#ff950b",
        3: "#fd6044",
    }
}

export const HeroineLimit = {
    loveMin: -100,
    loveMax: 100,
}


export const LoveLevelText = [
    [
        '知らない人',
        '団地の人',
        '話相手のおじさん',
        '優しいおじさん',
    ],
    [
        'きらい…',
        'いい人…?',
        '恩人',
        '大好き',
    ]
];

export const LoveLevelExp = [
    [
        5,
        20,
        40,
        40
    ],
    [
        0,
        10,
        40,
        80
    ]
]