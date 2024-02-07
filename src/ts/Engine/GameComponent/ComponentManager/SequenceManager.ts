import * as Util from '../../../Util/Util';
import * as PIXI from 'pixi.js';
import * as Rx from 'rxjs';
// import { take } from 'rxjs/operators'
import { SCRIPT_TYPE, Sequence ,BR_COND, REF_TYPE, BR_OP, BR_LOGIC } from "../../../Repository/EventRepository";
import { IComponentManager } from "../../Core/IComponentManager";
import { GameComponentState, IGameComponent, ISequenceActor, ISteppableComponent, ISteppableComponentDelegate, SteppableComponentBranchEvent } from "../../Core/IGameComponent";
import { UIButton } from '../UI/UIButton';
import { Scene } from '../../Core/Scene';
import { FlagManager } from 'ts/Engine/Core/FlagManager';
import { PARAM_GROUP, ParameterManager } from 'ts/Engine/Core/ParameterManager';
import { ENV, GAME_HEIGHT, GAME_WIDTH, LAYER_EVENT_OPTIONS, LAYER_EVENT_UI } from 'ts/Const';
import { GameSound } from 'ts/Engine/GameComponent/GameSound';
import { SystemDataManager } from 'ts/Engine/Core/SystemDataManager';
// import { IObserver, IObservable } from "../../Core/IObserver";


export enum SequenceState {
    init,
    ready,
    suspended,
    die
}

export type StepNextOption = {
    sound?: boolean
}


/**
 * シーケンス(キャラ+テキスト のひとかたまり)の表示と制御を行う
 */
export class SequenceManager implements IComponentManager, ISteppableComponentDelegate {
    public subComponentList: (ISteppableComponent & ISequenceActor)[];
    public isWaitNext: boolean = true;
   
    private _scene: Scene;     // HACK: テスト用。消す。
    private _sequence: Sequence;
    private _sideEffectIdx: number = 0;

    private _cur : number;
    private _state: SequenceState;

    private _completeSubject = new Rx.Subject<number>();    // 完了時、対応する副作用のIDを返す
    
    get observable(): Rx.Observable<number> {
        return this._completeSubject.asObservable();
    }    

    constructor(c?: Partial<SequenceManager>) {
        Object.assign(this, c);
        this.subComponentList = new Array<ISteppableComponent & ISequenceActor>();
        this._state = SequenceState.init;
    }


    public async die(): Promise<void> {
        await this.subComponentList.map(async (c) => {
            c.state = GameComponentState.die;
        });
        this._scene = null;
        this.subComponentList = [];
    }


    /**
     * 完了通知用Subjectをリセットする
     * !-- それまで購読していたObserverは完了を検知できなくなる --!
     */
    public resetObservable(): Rx.Observable<number> {
        this._completeSubject = new Rx.Subject<number>();
        return this._completeSubject.asObservable();
    }

    public registerComponent(c: ISteppableComponent & ISequenceActor): void {
        c.setSteppableComponentDelegate(this);
        this.subComponentList.push(c);
    }

    public async setSequence(s: Sequence, cursor:number = 0): Promise<void> {
        this._state = SequenceState.suspended;
        this._sequence = s;
        SystemDataManager.instance.sysdata.current_sequence = s;
        await Promise.all(this.subComponentList.map((_:ISequenceActor) => _.setSequence(s)));
        this._cur = cursor;
        this._state = SequenceState.ready;
    }

    public setSideEffectIndex(val: number) {
        this._sideEffectIdx = val;
    }

    public setScene(s: Scene): void {
        this._scene = s;
    }

    /**
     * シーケンスの途中にシーケンスを挿入
     * @param s   追加シーケンス
     * @param pos 挿入位置
     */
    public async insertSequence(s: Sequence, insertPos: number = 0) {
        const originalSequence = [...this._sequence];

        const newSequence = [
            // ...originalSequence.slice(0, insertPos),
            ...s,
            ...originalSequence.slice(insertPos)
        ];
        await this.setSequence(newSequence);
        // this._cur = insertPos;
    }

    /**
     * 明示的なスタート
     */
    public async start(): Promise<void> {
        await this.handleNext();
    }

    /**
     * 次のスクリプトへ
     */
    public async handleNext(options: StepNextOption = {sound: false}): Promise<void> {
        // 現在のステップが完了してなければ完了させる
        if (this._cur !== 0 &&  !this.subComponentList.every((_) => _.isWaitNext)) {
            for(const _ of this.subComponentList) {
                if (!_.isWaitNext) {
                    _.flushCurrent();
                }
            }
            return;
        }

        
        if (this._state !== SequenceState.ready) {
            console.log('sequence not ready');
            return;
        }

        // シーケンスの最後なら終了処理
        if (this._sequence[this._cur] === undefined) {
            await this.handleEnd();
            return Promise.resolve();
        }

        if (options.sound === true ) {
            const se = await GameSound.build('se_tap');
            se.play();
        }

        // 次のステップを処理
        console.log('次の文章');
        if (this._sequence[this._cur].sideEffectIdx != null) {
            SystemDataManager.instance.sysdata.current_sideeffect_index = this._sequence[this._cur].sideEffectIdx;
            this._sideEffectIdx = this._sequence[this._cur].sideEffectIdx;
        }
        await Promise.all(this.subComponentList.map(
            async (_) => {
                _.stepNext()
            })
        );

        /** 選択肢分岐処理  **/
        if (this._sequence[this._cur].type == SCRIPT_TYPE.BR_SELECT) {
            await this.handleSelectBranch();
        }

        /** 数値分岐処理  **/
        if (this._sequence[this._cur].type == SCRIPT_TYPE.BR_VALUE) {
            await this.handleValueBranch();
            return;     // 数値分岐はカーソルインクリメントしない
        }

        SystemDataManager.instance.sysdata.current_cursor = this._cur;
        this._cur++;
    }

    /**
     *  選択肢分岐処理
     **/
    public async handleSelectBranch(): Promise<void> {
        // 選択肢クリックまでシーケンスを進ませない
        this._state = SequenceState.suspended;

        // console.log('選択肢タイプの分岐');
        const options: Array<string> = this._sequence[this._cur].options;
        const branchs: Array<Sequence> = this._sequence[this._cur].branchs;

        if (options == null) {
            throw new Error(this.constructor.name + ':選択肢が設定されていません');
        }

        if (branchs == null) {
            throw new Error(this.constructor.name + ':分岐後シーケンスが設定されていません');
        }

        const destroyAll$ = new Rx.Subject<void>();     // すべてのボタンの購読を終了するためのSubject
        let selectedIndex: number;


        // 選択肢の数分のストリームをマージ
        const observalbes = options.map( (option:string, index:number) => {
            // ボタン表示処理
            let button = new UIButton( index, {
                isOnce: true,
                width: GAME_WIDTH* 0.5,
                height: GAME_HEIGHT * 0.15,
                center: true,
                top: GAME_HEIGHT * (0.2 + index * 0.2),
                backgroundColor: '#2b3035',
                text: option,
                textStyle: {...ENV.defaultTextStyle, ...{fill: '#fff', strokeThickness: 0}} as PIXI.TextStyle
            });
            this._scene.addObject(button, '選択肢ボタン' + index , index + LAYER_EVENT_OPTIONS);

            // ストリームを返す
            return button.observable;
        });

        // console.log(observalbes);

        const mergedButtonRace$ = Rx.race(...observalbes);

        mergedButtonRace$.subscribe({
            next: buttonIndex => {
                selectedIndex = buttonIndex;
                // console.log(`選ばれたのは:${selectedIndex}`);
            },
            error: err => { throw new Error(this.constructor.name + ':' + err) },
            complete: async () => {
                // ボタン削除
                options.map( (option:string, index:number) => {
                    this._scene.removeObjectByLabel('選択肢ボタン' + index);
                });

                // シーケンスの一時停止を解除して次へ
                await this.insertSequence(branchs[selectedIndex], this._cur);
                this._state = SequenceState.ready;
                this.handleNext();
            }
        })
    }


    /**
     *  数値分岐処理
     **/
    public async handleValueBranch(e?: SteppableComponentBranchEvent): Promise<void> {
        // 選択肢クリックまでシーケンスを進ませない
        this._state = SequenceState.suspended;

        // console.log('数値タイプの分岐');

        const conditions: Array<BR_COND> = this._sequence[this._cur].conditions;
        const branchs: Array<Sequence> = this._sequence[this._cur].branchs;
    
        if (conditions == null || conditions.length <= 0) {
            throw new Error(this.constructor.name + ':評価値が設定されていません');
        }

        if (branchs == null) {
            throw new Error(this.constructor.name + ':分岐後シーケンスが設定されていません');
        }

        // 判定処理
        let result = true;  // 初期値はtrue 後に続くAND,OR判定に絡む

        for (const condition of conditions) {
            const { operator, type, target, targetProperty, value, logic } = condition;

            let operand;
            if (type === REF_TYPE.FLAG) {
                operand = FlagManager.instance.getFlag(target as string);
            } 
            else if (type === REF_TYPE.PARAM) {
                operand = ParameterManager.instance.getParam(target as PARAM_GROUP, targetProperty);
            } 
            else {
                // 他の型に対する処理を追加する
            }

            let conditionResult;
            switch (operator) {
                case BR_OP.EQ:
                    conditionResult = operand === value;
                    break;
                case BR_OP.NE:
                    conditionResult = operand !== value;
                    break;
                case BR_OP.GE:
                    conditionResult = operand >= value;
                    break;
                case BR_OP.LE:
                    conditionResult = operand <= value;
                    break;
                case BR_OP.GT:
                    conditionResult = operand > value;
                    break;
                case BR_OP.LT:
                    conditionResult = operand < value;
                    break;
                default:
                    // 他の演算子に対する処理を追加する
                    break;
            }

            // 論理演算
            if (logic === undefined || logic === null || logic === BR_LOGIC.AND) {
                result = result && conditionResult;
            } else if (logic === BR_LOGIC.OR) {
                result = result || conditionResult;
            }
        }


        // 結果による分岐
        if (result) {
            await this.insertSequence(branchs[0], this._cur + 1);
        }
        else {
            await this.insertSequence(branchs[1], this._cur + 1);
        }
        this._state = SequenceState.ready;
        this.handleNext();
    }


    public async handleEnd(): Promise<void> {
        this._completeSubject.next(this._sideEffectIdx);
        this._completeSubject.complete();
    }
    
}