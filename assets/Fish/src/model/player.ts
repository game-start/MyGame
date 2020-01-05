export default class player{
    //private static instance:player = null;

    static barrel:cc.Node;
    static gold:number = 0;
    static goldMask:cc.Node = null;
    
    // public static getIns():player{
    //     if(!this.instance){
    //         this.instance = new player();
    //     }
    //     return this.instance;
    // }

    public static init(barrel:cc.Node,goldMask:cc.Node):void{
        this.barrel = barrel;
        this.gold = 0;
        this.goldMask = goldMask;
    }

    public static addGold(num:number,tag:number = 0){
        this.gold += num;
        let baseOffset = this.goldMask.children[0].height/10;
        this.goldMask.children[tag].runAction(cc.moveBy(0.5,0,-baseOffset*num));
    }

}