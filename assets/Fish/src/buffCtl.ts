
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({type:cc.JsonAsset})
    fishJson:cc.JsonAsset = null;

    fishArr:Array<object> = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.fishArr = this.fishJson.json;
    }

    start () {
        
    }

    // update (dt) {}
}
