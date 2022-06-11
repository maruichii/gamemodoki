const RES_TEXT = {
    FetchText: {
        All: (id) => { return SCRIPT[id] },
        Text: (id) => { return SCRIPT[id].map((s) => s.text) },
        Speaker: (id) => { return SCRIPT[id].map((s) => s.text) },
        Chara: (id) => { return SCRIPT[id].map((s) => s.chara) },
        TextSpeaker: (id) => { return SCRIPT[id].map((s) => ({ text:s.text, speaker:s.speaker })) }
    },
    FetchScript: {
        All: (id) => { return SCRIPT[id] },
        Text: (id) => { return SCRIPT[id].map((s) => s.text) },
        Speaker: (id) => { return SCRIPT[id].map((s) => s.text) },
        Chara: (id) => { return SCRIPT[id].map((s) => s.chara) },
        TextSpeaker: (id) => { return SCRIPT[id].map((s) => ({ text:s.text, speaker:s.speaker })) }
    },
}

const TEXT = {
    
}

const FACE_ID = {
    DEFAULT: 0,
    SMILE: 1,
    ANGER: 2,
    SADNESS: 3,
    HAPPY: 4,
    SURPRIZED: 5
};


const SCRIPT = {
    0: [
        {
            text: "こんにちは。",
            speaker: "テスト子",
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
            ],
        },
        {
            text: "キャラが出せてすごい！",
            speaker: "バニー",
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
            ],
        },
        {
            text: "これは地の文。",
            speaker: null,
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
            ],
        },
        {
            text: "左右に動いてみたり",
            speaker: "長い名前のキャラクター",
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.125, pixi: { x: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true }
                },
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 1.5, pixi: { x: -700 }, ease: Linear.easeNone, repeat: 0 }
                },
            ],
        },
        {
            text: "跳ねてみたり",
            speaker: "バニー",
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
            text: "表情を変えてみたり(未実装)",
            speaker: "テスト子",
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.SMILE, animation: null},
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.SURPRIZED, animation: null},
            ],
        },
        {
            text: "人物を増やしてみたり",
            speaker: "おばあちゃん",
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
                { id: "おばあちゃん", spriteId: "chara3", scale: 0.95, x: "center", y: 180, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.15, pixi: { y: -10 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
            ],
        },
        {
            text: "できるようになったぞ！",
            speaker: null,
            chara: [
                { id: "テスト子", spriteId: "chara1", scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
                { id: "バニー", spriteId: "chara2", scale: 1.0, x: "right", y: 100, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
                { id: "おばあちゃん", spriteId: "chara3", scale: 0.95, x: "center", y: 180, z: 0, face: FACE_ID.DEFAULT, 
                    animation: { duration: 0.45, pixi: { y: -20 }, ease: Linear.easeNone, repeat: -1, yoyo: true } 
                },
            ],
        }
    ],
    1 : [
        {
            text: "会話シーン2",
            speaker: 1,
            chara: [
                { spriteId: 1, scale: 1.0, x: "left", y: 100, z: 0, face: FACE_ID.DEFAULT, animation: null},
            ],

        },
        {
            text: "ほげほげ",
            speaker: null,
        }
    ],
}
