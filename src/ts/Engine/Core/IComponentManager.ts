import { IGameComponent } from "./IGameComponent";

/**
 * ゲームコンポーネントを束ねて管理する何かしら
 */
export interface IComponentManager {
    subComponentList: Array<IGameComponent>;
    registerComponent(c: IGameComponent):void;
}  