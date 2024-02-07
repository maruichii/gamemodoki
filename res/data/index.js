const RES_DATA = {
    FetchFlags: {
        All: () => { return FLAGS }
    },
    FetchParams: {
        Player:  () => { return PLAYER},
        Heroine: () => { return HEROINE},
        Base:    () => { return BASE}
    },
    FetchSysData: {
        Prefs:  () => { return SYS_PREFS},
        Data:  () => { return SYS_DATA},
    }
}

const SYS_PREFS = {
    master_vol: 1.0,
    text_speed: 1.0
}

const SYS_DATA = {
    backlog: [],
    current_scene: 'SceneEntry',

    /**
     * NOTE:
     * 中断イベントの復帰は
     * イベント完了後処理の復帰が難しいので、
     * そもそもイベント途中でセーブさせないようにする。
     */
    current_sequence: [],
    current_cursor: 0,        
    current_sideeffect_index: 0,
    current_sideeffect_list: [],
}


const FLAGS = {
    IS_INTRODUCED           : false,
    IS_WARNED               : false,
    IS_RESCUED              : false,
    IS_FIRST_MORNING_ENTER  : false,
    IS_KNOW_NAMW            : false,
}


const PLAYER = {
    name: '○○○',
    ap:    5,
    max_ap: 5,
    vital: 100,
    ero: 0
}

const HEROINE = {
    love: 0,
    ero: -1
}

const BASE = {
    day: 1,
    time: 0,
    money: 100000,
    talk_count: 1,

    // 使わん
    energy: 100,
    energy_per: 0,
    food: 500,
    food_per: 0,
    level_tech: 0,
    level_explore: 0,
    level_farm: 0,
}