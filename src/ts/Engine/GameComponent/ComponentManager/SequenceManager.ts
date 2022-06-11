import { IComponentManager } from "../../Core/IComponentManager";
import { IGameComponent, ISteppableComponent, ISteppableComponentDelegate } from "../../Core/IGameComponent";

export class SequenceManager implements IComponentManager, ISteppableComponentDelegate {
    subComponentList: ISteppableComponent[];

    constructor(c?: Partial<SequenceManager>) {
        Object.assign(this, c);
        this.subComponentList = new Array<ISteppableComponent>();
    }
    

    public registerComponent(c: ISteppableComponent): void {
        c.setSteppableComponentDelegate(this);
        this.subComponentList.push(c);
    }

    public handleNext() {
        this.subComponentList.map((_) => _.stepNext());
    }
    
}