const RES_EVENT = {
    FetchEvent: {
        All: (id) => { return EVENT[id] }
    }
}

/**
 * シーケンス内の1スクリプトの種類
 */
const SCRIPT_TYPE = {
    NORMAL: 0,      // そのまま次へ
    BR_SELECT: 1,   // プレイヤーが分岐選択
    BR_VALUE: 2,    // 数値分岐
}

const TRANSITION_TYPE = {
    NONE: 0,
    FADE: 1,
    SLIDE: 2
}

/**
 * 数値分岐のオペレーター
 */
const BR_OP = {
    EQ: 0,     // =
    NE: 1,     // !=
    GE: 2,     // >=
    LE: 3,     // <=
    GT: 4,     // >
    LT: 5,     // <
    SW: 6      // SWITCH
}

/**
 * 数値分岐の参照ターゲット
 */
const REF_TYPE = {
    PARAM:  0,
    FLAG:   1
}

const PARAM_GROUP = {
    PLAYER:     0,
    HEROINE:    1,
    BASE:       2
}

const BR_LOGIC = {
    AND:  0,
    OR:   1
}


/**
 * サイドエフェクト関連
 */
const SIDE_EFFECT_TYPE = {
    PARAM:  0,
    FLAG:   1,
    SCENE:  2
}

const PARAM_EFFECT_TARGET = {
    PLAYER:  0,
    HEROINE: 1,
    BASE:    2,
}


const PARAM_OP = {
    ADD: 0,    // +
    SUB: 1,    // -
    MUL: 2,    // *
    DIV: 3,    // /
    ASG: 4,    // =
    STR: 5,    // 文字列
    POW: 6,    // 累乗
    MOD: 7,    // 剰余
}


const COMMON_PROPERTY = {
    VITAL:  'vital',
    ERO:    'ero',
    LOVE:   'love',
    ENERGY:     'energy',
    ENERGY_PER: 'energy_per',
    FOOD:       'food',
    LV_TECH:    'level_tech',
    LV_EXPLORE: 'level_explore',
    LV_FARM:    'level_farm',
    MONEY:      'money',
    DAY:        'day',
    AP:         'ap',
}

const EVENT = {

    0: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "こんにちは。",
                speaker: "テスト子",
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "center", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
            },

            {
                type: SCRIPT_TYPE.NORMAL,
                text: "キャラが出せてすごい！",
                speaker: "バニー",
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                    { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
            },
            {

                type: SCRIPT_TYPE.NORMAL,
                text: "これは地の文。\nｳﾜｱｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰｰ(めちゃくちゃ長い文章とかもなんだかそれなりに右端で折り返しできる)。\n禁則処理とかはわからない。",
                speaker: null,
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                    { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "どっちをしてほしい？",
                background: "base",
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                    { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
                options: [ "左右に動く", "跳ねる"],
                branchs: [
                   [
                        {
                            result: 0,
                            text: "左右に動くよ！",
                            speaker: "バニー",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.125, pixi: { x: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                },
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 1.5, pixi: { x: -700 }, ease: Linear.easeNone, repeat: 0 }
                                },
                            ],
                        },
                   ],
                   [
                        {
                            result: 1,
                            text: "跳ねるよ！",
                            speaker: "バニー",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.2, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                                },    
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.2, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                }
                            ],
                        },
                   ]
                ]
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "どうだった？",
                speaker: "テスト子",
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                    { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ヒロインの現在の好感度：{{0}}\n{{1}}のHP：{{2}}\nフラグFL_INIの状態:{{3}}",
                textParams: [
                    {type: REF_TYPE.PARAM, target: PARAM_GROUP.HEROINE, targetProperty: 'ero'},
                    {type: REF_TYPE.PARAM, target: PARAM_GROUP.PLAYER, targetProperty: 'name'},
                    {type: REF_TYPE.PARAM, target: PARAM_GROUP.PLAYER, targetProperty: 'vital'},
                    {type: REF_TYPE.FLAG, target: 'FL_INI'},
                ],
                speaker: "テスト子",
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                    { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
            },
            {
                // パラメーター分岐サンプル
                type: SCRIPT_TYPE.BR_VALUE,
                conditions: [
                    { operator:BR_OP.EQ, type: REF_TYPE.FLAG, target: 'FL_INI', logic: null, value: true},
                    { operator:BR_OP.GT, type: REF_TYPE.PARAM, target: PARAM_GROUP.HEROINE, targetProperty: 'ero', logic: BR_LOGIC.AND, value: 10}
                ],
                branchs: [
                    // false
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "ヒロインの好感度が足りないよ",
                            speaker: "テスト子",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    // animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                                },    
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    // animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                }
                            ]
                        },
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "好感度を上げてからまた来てね",
                            speaker: "テスト子",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    // animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                                },    
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    // animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                }
                            ],
                        },
                    ],
                    // true
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "ヒロインは十分好感度が高いみたい",
                            speaker: "テスト子",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                                },    
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.35, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                }
                            ],
                        },
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "やったね！",
                            speaker: "テスト子",
                            chara: [
                                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.5, pixi: { y: -15 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                                },    
                                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                                    animation: { duration: 0.5, pixi: { y: -15 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                                }
                            ],
                        },
                    ]
                ]
            },
            // {
            //     type: SCRIPT_TYPE.NORMAL,
            //     text: "表情を変えてみたり(未実装)",
            //     speaker: "テスト子",
            //     chara: [
            //         { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.SMILE, animation: null},
            //         { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.SURPRIZED, animation: null},
            //     ],
            // },
            // {
            //     type: SCRIPT_TYPE.NORMAL,
            //     text: "人物を増やしてみたり",
            //     speaker: "おばあちゃん",
            //     chara: [
            //         { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //         { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //         { id: "おばあちゃん", spriteId: "chara3", scale: 0.95, x: "center", y: 180, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //     ],
            // },
            // {
            //     type: SCRIPT_TYPE.NORMAL,
            //     text: "色々できるようになったぞ！",
            //     speaker: null,
            //     chara: [
            //         { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //         { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //         { id: "おばあちゃん", spriteId: "chara3", scale: 0.95, x: "center", y: 180, z: 0, face: FACE_ID.DEFAULT, 
            //             animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
            //         },
            //     ],
            // }
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.VITAL,
                        operator:  PARAM_OP.SUB,
                        value: 10,
                    }
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.ERO,
                        operator:  PARAM_OP.ADD,
                        value: 20
                    }
                },
            ]
        ]
    },
    1 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "会話シーン2",
                speaker: 'テスト子',
                chara: [
                    { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "center", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                        animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                    },
                ],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ほげほげ",
                speaker: null,
                chara: null,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ふがふが",
                speaker: null,
                chara: [
                    
                ],
            }
        ],
        sideEffect: [
        ]
    },


    /**
     * コモンメッセージ
     */
    // 1日終了
    10000001: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "そろそろ部屋に入ろう…",
                speaker: null,
                chara: [],
                background: undefined
            },
        ]
    },
    10000002: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "今日は疲れたな...",
                speaker: null,
                chara: [],
                background: undefined
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "そろそろ部屋に入ろう…",
                speaker: null,
                chara: [],
                background: undefined
            },
        ]
    },

    /**
     * 90xxxはストーリーxxxパート
     */

    /**
     * 1日目
     */
    90001001: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "\"―――築50年 1LDK 南向き 賃料:2万円/月\n※伝達事項有り\"",
                speaker: null,
                chara: [],
                background: {
                    alias: 'bg_estate',
                },
                bgm: {
                    alias: 'bgm_minminzemi',
                    options: {
                        loop: true,
                        volume: 0.09,
                    }
                },
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "貼り紙の物件？ああ、あそこ...空いてるには空いてますよ。",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "民営化した公団住宅の一部でね、住人が残ってるから建て替えができなかった区画なんだけど...",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "正直言ってかなり古いし、空き部屋だらけでちょっとした廃墟みたいなところですよ。",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "寝に帰るだけだからいい？まあお兄さんまだ若そうだし、独り身なら止めはしないけどね。",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "１つだけ厄介なことがあって...時々夜騒音を立てる住人さんがいるんですよね...\n今、周りの入居者さんはほとんどがお年寄りだからか気にならないみたいだけど、",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "新しく入った人はだいたい数ヶ月で出てっちゃうんだよね。賃料が安い理由の一つはそれですね。",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "....あ、問題の部屋とは別の棟の最上階が空いてますよ。\nそこならだいぶマシじゃないかなあ。",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "5階になるけど大丈夫？わかりました。じゃあサッと内見しに行きましょうか。\nあ、あと数年内に取り壊しになる可能性があるから、あとでその辺の同意書も―――――",
                speaker: "不動産屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "―――",
                speaker: "",
                chara: [],
                bgm: null,
                background: {
                    alias: 'bg_frontdoor',
                    transition: TRANSITION_TYPE.FADE,
                    screenColor: 0xffffff
                },
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "それじゃあ、作業の方これで完了になります。\n料金は支払済みで…あとこちらの確認書にサインお願いします。",
                speaker: "引っ越し屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "はい、確かに。ありがとうございました！それでは失礼します！",
                speaker: "引っ越し屋",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "...",
                speaker: null,
                chara: [],
                options: ["買い物に行く"],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            result: 0,
                            text: "......(階段を下る)",
                            speaker: null,
                            chara: [],
                            background: {
                                alias: 'bg_doorfront',
                                transition: TRANSITION_TYPE.FADE,
                                screenColor: 0xffffff
                            },
                            // bgm: {
                            //     alias: 'bgm_kaidan',
                            //     options: {
                            //         loop: true,
                            //     }
                            // },
                            se: {
                                alias: 'se_kaidan',
                                options: {
                                    volume: 0.1,
                                    speed: 1.25
                                }
                            }
                        },
                    ],
                ], 
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                result: 0,
                text: "日用品と食材を買い込んだ",
                speaker: null,
                chara: [],
                background: null,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                result: 0,
                text: ".........(5階分の階段を上る)",
                speaker: null,
                chara: [],
                background: null,
                se: {
                    alias: 'se_kaidan',
                    options: {
                        volume: 0.1,
                        speed: 1.0
                    }
                },
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                result: 0,
                text: "...",
                speaker: null,
                chara: [],
                background: null,
                options: ["ドアの前に誰かいる…？"],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "あ.......",
                            speaker: "？？？",
                            chara: [],
                            background: {
                                alias: 'still_frontdoor1',
                                transition: TRANSITION_TYPE.FADE,
                                screenColor: 0xffffff
                            },
                        },
                    ]
                ]
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                result: 0,
                text: "...",
                speaker: null,
                chara: [],
                options: ["……こんにちは"],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: ".........こんにちは...。",
                            speaker: "？？？",
                            chara: [],
                        },
                    ]
                ]
            },
        ],

        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.SCENE,
                    effect: {
                        target: 'SceneFrontDoor'
                    }
                },
            ]
        ]
    },

    // 1日目終了時
    90001002 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "―――――深夜0時",
                speaker: null,
                chara: [],
                background: {
                    alias: 'bg_room_night'
                },
            },           
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "....■■#○！....◇#！....＃！？...",
                speaker: "男の声",
                chara: [],
            },     
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "...#◆%■！....□◇◆◆#....＃■○□！！！...",
                speaker: "男の声",
                chara: [],
            },     
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "どこかの部屋から怒声が聞こえる......",
                speaker: null,
                chara: [],
            },     
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "――――――――",
                speaker: null,
                chara: [],
            },     
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.SCENE,
                    effect: {
                        target: 'SceneGenkan',
                    }
                }
            ],
        ]
    },



    /**
     * 91xxxは拠点xxxパート
     */
    91001001 : {
        sequence: [
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "あの...ここってどっちも空き部屋じゃ...",
                speaker: "少女",
                options: [ "502に今日越してきたんだ", "そこは自分の部屋だ\nどいてほしい"],
                chara: [
                    { id: "heroine_tachi_n", spriteId: "heroine_tachi_n", scale: 0.8, x: "center", y: 130, z: 0, face: FACE_ID.DEFAULT, animation: null},
                ],
                background: undefined,
                branchs: [
                    [
                        {
                            text: "あ...そうなんだ...",
                            speaker: "少女",
                            chara: [],
                            sideEffectIdx: 0,
                        },
                        {
                            text: "(...もうここも使えなくなっちゃうかな...)",
                            speaker: "少女",
                            chara: [],
                        }
                    ],
                    [
                        {
                            result: 1,
                            text: "...ごめんなさい...すぐどきます...",
                            speaker: "少女",
                            chara: [],
                            sideEffectIdx: 1,
                        },
                    ]
                ]
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    },
                    // isResultMsg: true,
                },
            ],
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 0,
                    },
                    // isResultMsg: true,
                },
            ],
        ]
    },
    91001002 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "何か話そうか...",
                speaker: null,
                chara: [],
                background: undefined,
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "…",
                speaker: null,
                options: [ "自己紹介する", "少女のことを聞く"],
                chara: [],
                background: undefined,
                branchs: [
                    // 選択肢1-1
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "502に越してきた...{{0}}さん...",
                            speaker: "少女",
                            chara: [],
                            textParams: [
                                {type: REF_TYPE.PARAM, target: PARAM_GROUP.PLAYER, targetProperty: 'name'},
                            ]
                        },
                        {
                            type: SCRIPT_TYPE.BR_SELECT,
                            text: "このアパートぼろぼろだし...5階なんて不便じゃない...？",
                            speaker: "少女",
                            chara: [],
                            options: [ "静かだし古臭い雰囲気も悪くない\n5階は眺めもいい", "君には関係ない\nそれより君は誰だ？"],
                            branchs: [
                                // 選択肢2-1
                                [
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "ちょっとわかるかも......",
                                        speaker: "少女",
                                        chara: [],
                                    },
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "あの...わたし、隣りの棟に住んでて...",
                                        speaker: "少女",
                                        chara: [],
                                        sideEffectIdx: 0,
                                    },
                                ],
                                // 選択肢2-1
                                [
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "ご..ごめんなさい....",
                                        speaker: "少女",
                                        chara: [],
                                    },
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "わ、わたしは...この団地に住んでて...",
                                        speaker: "少女",
                                        chara: [],
                                        sideEffectIdx: 1,
                                    },
                                ]
                            ]
                        }
                    ],
                    // 選択肢1-2
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "えっと...わたしは...この団地に住んでて...",
                            speaker: "少女",
                            chara: [],
                            sideEffectIdx: 2,
                        },
                    ]
                ]
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "...(あ...知らない人に色々話してだいじょうぶかな...)",
                speaker: "少女",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "......",
                speaker: "少女",
                chara: [],
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ASG,
                        value: 5,
                    },
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_KNOWN_ROOM',
                        value:  true,
                    },
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_INTRODUCED',
                        value:  true,
                    },
                },
            ],
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    },
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_INTRODUCED',
                        value:  true,
                    },
                },
            ],
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    },
                },
            ],
        ]
    },
    91001003 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "...あの...",
                speaker: "少女",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.BR_VALUE,
                conditions: [
                    { operator:BR_OP.EQ, type: REF_TYPE.FLAG, target: 'IS_KNOWN_ROOM', logic: null, value: true},
                ],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "わたし、三倉 早希(みくら さき)っていいます...",
                            speaker: "早希",
                            chara: [],
                        },
                    ],
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "わたし、隣りの棟に住んでて...",
                            speaker: "早希",
                            chara: [],
                        },
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "三倉 早希(みくら さき)っていいます...",
                            speaker: "早希",
                            chara: [],
                        }
                    ]
                ]
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "...かってに部屋の前をつかってごめんなさい...",
                speaker: "早希",
                chara: [],
                options: ['いたずらじゃないなら構わない', 'このことは管理会社に連絡する'],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "めいわくになるようなことはしないよ.....",
                            speaker: "早希",
                            chara: [],
                            sideEffectIdx: 0,
                        }
                    ],
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "っ...！それだけはゆるして...！",
                            speaker: "早希",
                            chara: [],
                        },
                        {
                            type: SCRIPT_TYPE.BR_SELECT,
                            text: "お父さんに知られたくないの......",
                            speaker: "早希",
                            chara: [],
                            options: ['見逃す', '見逃さない'],
                            branchs: [
                                [
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: ".....ありがとうございます",
                                        speaker: "早希",
                                        chara: [],
                                        sideEffectIdx: 1
                                    },
                                ],
                                [
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "...っ...",
                                        speaker: "早希",
                                        chara: [],
                                    },
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "わかった....\nすぐ帰ります...",
                                        speaker: "早希",
                                        chara: [],
                                        sideEffectIdx: 2
                                    },
                                ]
                            ]
                        },
                    ]
                ]
            },
        ],
        sideEffect: [
            [
                // 変動1
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    },
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_KNOW_NAME',
                        value:  true,
                    },
                },
            ],
            [
                // 変動2
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.SUB,
                        value: 1,
                    },
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_KNOW_NAME',
                        value:  true,
                    },
                },
            ],
            [
                // 変動3
                {
                    type: SIDE_EFFECT_TYPE.SCENE,
                    effect: {
                        target: 'SceneBad1'
                    }
                },
                {
                    type: SIDE_EFFECT_TYPE.FLAG,
                    effect: {
                        target: 'IS_KNOW_NAME',
                        value:  true,
                    },
                },
            ],
        ]
    },
    91001004: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "....わたし...家にいたくなくて...",
                speaker: "早希",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "学校終わったらいつもここで...夜になるの待ってるの.....",
                speaker: "早希",
                chara: [],
            },
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "さわいだりしないから、夜まで...ここにいさせてもらえませんか...",
                speaker: "早希",
                options: [ "いさせてあげる", "追い払う"],
                chara: [],
                branchs: [
                    [
                        {
                            result: 0,
                            text: "ほんと...？ありがとう...！",
                            speaker: "早希",
                            chara: [],
                            sideEffectIdx: 0,
                        },
                        {
                            type: SCRIPT_TYPE.BR_VALUE,
                            conditions: [
                                { operator:BR_OP.GE, type: REF_TYPE.PARAM, target: PARAM_GROUP.HEROINE, targetProperty: 'love', logic: null, value: 5},
                            ],
                            branchs: [
                                [
                                    // パラメーター変動を操作するための分岐
                                    {
                                        result: 0,
                                        text: "おじさんはやさしい人...？",
                                        speaker: "早希",
                                        chara: [],
                                        sideEffectIdx: 0,
                                    },
                                ],
                                [
                                    {
                                        result: 0,
                                        text: "おじさんはやさしい人...？",
                                        speaker: "早希",
                                        chara: [],
                                        sideEffectIdx: 1,
                                    },
                                ]
                            ]
                        }
                    ],
                    [
                        {
                            result: 1,
                            text: "...ごめんなさい...すぐ帰ります...",
                            speaker: "早希",
                            chara: [],
                            sideEffectIdx: 2,
                        },
                    ]
                ]
            }
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 3,
                    }
                },
            ],
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ASG,
                        value: 5,
                    }
                },
            ],
            [
                {
                    type: SIDE_EFFECT_TYPE.SCENE,
                    effect: {
                        target: 'SceneBad1'
                    }
                }
            ]
        ]
    },
    91001005 : {
        sequence: [
            {
                type: SCRIPT_TYPE.BR_SELECT,
                text: "明日からも、ここを使わせてもらっても...いい...？",
                speaker: "少女",
                chara: [],
                background: undefined,
                options: ['構わない'],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: "....よかった...",
                            speaker: "少女",
                            chara: [],
                            background: undefined,
                            sideEffectIdx: 0
                        },
                    ]
                ]
            },
            {
                type: SCRIPT_TYPE.BR_VALUE,
                conditions: [
                    { operator:BR_OP.EQ, type: REF_TYPE.FLAG, target: 'IS_INTRODUCED', logic: null, value: true},
                ],
                branchs: [
                    [
                        
                    ],
                    [
                        {
                            type: SCRIPT_TYPE.BR_SELECT,
                            text: "...",
                            speaker: null,
                            options: [ "自己紹介する"],
                            chara: [],
                            background: undefined,
                            branchs: [
                                [
                                    {
                                        type: SCRIPT_TYPE.NORMAL,
                                        text: "{{0}}さん......",
                                        speaker: "少女",
                                        chara: [],
                                        textParams: [
                                            {type: REF_TYPE.PARAM, target: PARAM_GROUP.PLAYER, targetProperty: 'name'},
                                        ]
                                    },
                                ]
                            ]
                        }
                    ]
                ]
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "あの、ほんとにありがとう......",
                speaker: "少女",
                chara: [],
                background: undefined,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ここに座ってるだけだから...\nわたしのことは...いないものと思ってほしい...です",
                speaker: "少女",
                chara: [],
                background: undefined,
            },
           
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 2,
                    }
                },
            ],
        ]
    },
    // おさわり
    91001100 : {
        sequence : [
            {
                type: SCRIPT_TYPE.BR_VALUE,
                conditions: [
                    { operator:BR_OP.EQ, type: REF_TYPE.FLAG, target: 'IS_KNOW_NAME', logic: null, value: false}
                ],
                branchs: [
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: ".......",
                            speaker: "少女",
                            chara: [],
                            background: undefined,
                        },
                    ],
                    [
                        {
                            type: SCRIPT_TYPE.NORMAL,
                            text: ".......",
                            speaker: "早希",
                            chara: [],
                            background: undefined,
                        },
                    ]
                ]
            },
            
            // {
            //     type: SCRIPT_TYPE.NORMAL,
            //     text: "(今、触られそうになった...？)",
            //     speaker: "少女",
            //     chara: [],
            //     background: undefined,
            // },
        ],
    },


    /**
     * 2日目
     */
    91002000: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "今日からまた仕事だ",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
        ]
    },
    91002001: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "おかえりなさい...",
                speaker: '早希',
                chara: [],
                background: undefined,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "平日はお仕事....ふーん....",
                speaker: '早希',
                chara: [],
                background: undefined,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "........お疲れ様...",
                speaker: '早希',
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    }
                },
            ]
        ]
    },
    91002002: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "お家...入らないの...？",
                speaker: '早希',
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.HEROINE,
                        property:  COMMON_PROPERTY.LOVE,
                        operator:  PARAM_OP.ADD,
                        value: 1,
                    }
                },
            ]
        ]
    },


    // おさわり
    91002100 : {
        sequence : [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "なに....？",
                speaker: "早希",
                chara: [],
                background: undefined,
            },
        ],
    },



    /**
     * 92xxxxxxはお仕事系
     */
    92001001: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "それなりに働いた！それなりに疲れた！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 10000,
                    },
                    afterMsg: "日当をもらった！(+￥10,000)"
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.AP,
                        operator:  PARAM_OP.SUB,
                        value: 1,
                    },
                },
            ]
        ]
    },
    92001002: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "それなりに働いた！いつもよりはかどった！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 15000,
                    },
                    afterMsg: "日当をもらった！(+￥15,000)"
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.AP,
                        operator:  PARAM_OP.SUB,
                        value: 1,
                    },
                },
            ]
        ]
    },


    92001003: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ムリして働いた！疲労感が襲う！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 30000,
                    },
                    afterMsg: "かなり多めに日当をもらった！(+￥30,000)"
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.AP,
                        operator:  PARAM_OP.SUB,
                        value: 4,
                    },
                },
            ]
        ]
    },
    92001004: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ムリして働いた！疲れてミスをしてしまった...",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 15000,
                    },
                    afterMsg: "でもがんばったので多めに日当をもらった！(+￥15,000)"
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.AP,
                        operator:  PARAM_OP.SUB,
                        value: 4,
                    },
                },
            ]
        ]
    },
    92001005: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "ムリして働いた！ゾーンに入った！！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 50000,
                    },
                    afterMsg: "すごくたくさん日当をもらった！(+￥50,000)"
                },
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.PLAYER,
                        property:  COMMON_PROPERTY.AP,
                        operator:  PARAM_OP.SUB,
                        value: 4,
                    },
                },
            ]
        ]
    },


    92001006: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "適当にサボった！ぬるい1日だった！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
            [
                {
                    type: SIDE_EFFECT_TYPE.PARAM,
                    effect: {
                        target:    PARAM_EFFECT_TARGET.BASE,
                        property:  COMMON_PROPERTY.MONEY,
                        operator:  PARAM_OP.ADD,
                        value: 5000,
                    },
                    afterMsg: "少なめの日当をもらった！(+￥5,000)"
                },
            ]
        ]
    },
    92001007: {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "適当にサボった！サボっているのがバレた！",
                speaker: null,
                chara: [],
                background: undefined,
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "日当をもらえなかった！",
                speaker: null,
                chara: [],
                background: undefined,
            },
        ],
        sideEffect: [
        ]
    },

  
    /**
     * 99xxxはエンディング
     */
    99001000 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "今できてるのはここまで！！！！",
                speaker: null,
                chara: []
            },
        ]
    },

    99001001 : {
        sequence: [
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "それ以来、少女を部屋の前で見かけることはなかった。",
                speaker: null,
                chara: []
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "数ヶ月後、街中にて\n中年の男と手をつなぎ、\nうつむきながら歩く少女とすれ違った。",
                speaker: null,
                chara: []
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "どこか見覚えがある気がして振り返るが、少女の姿はもう見えなかった…",
                speaker: null,
                chara: []
            },
            {
                type: SCRIPT_TYPE.NORMAL,
                text: "BADEND1 : 雑踏に消える少女",
                speaker: null,
                chara: []
            },
        ]
    }
}
