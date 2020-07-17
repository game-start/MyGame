import pools from "../model/pools";
export default class player{
    //private static instance:player = null;

    static barrel:Array<cc.Node> = [];
    static gold:number = 0;
    static goldMask:cc.Node = null;
    static bulletHurt:number = 1;
    static isPuncture:boolean = false;
    static isSpring:boolean = false;
    
    // public static getIns():player{
    //     if(!this.instance){
    //         this.instance = new player();
    //     }
    //     return this.instance;
    // }

    public static init(barrel:cc.Node,goldMask:cc.Node):void{
        this.barrel = [barrel];
        this.gold = 0;
        this.goldMask = goldMask;
    }

    public static addGold(num:number){
        this.gold += num;
        let baseOffset = this.goldMask.children[0].height/10;
        let numArray = this.getDigits(this.gold);
        let numListArray = this.goldMask.children;
        let numLen = numArray.length;
        let numListLen = numListArray.length;
        if(numListLen<numLen){
            for(let i = 1;i<=numLen-numListLen;i++){
                let numList = pools.numListPool.get();
                numList.parent = this.goldMask;
            }
        }else if(numListLen>numLen){
            for(let i = numListLen-1;i>=numLen;i--){
                this.remove(numListArray[i]);
            }
        }
        let tag = 0;
        for(let i = numLen-1;i>=0;i--){
            let num = numArray[i];
            debugger;
            let numList = this.goldMask.children[tag];
            numList.stopAllActions();
            numList.runAction(cc.sequence(cc.moveTo(0.5,0,-baseOffset*num),cc.callFunc(()=>numList.y=Math.round(numList.y))));
            tag++;
        }
        //this.goldMask.children[tag].runAction(cc.sequence(cc.moveBy(0.5,0,-baseOffset*num),cc.callFunc(()=>this.goldMask.children[tag].y=Math.round(this.goldMask.children[tag].y))));//涉及到了浮点数计算，精度可能丢失
    }

    private static remove(numList:cc.Node){
        numList.stopAllActions();
        numList.runAction(cc.sequence(cc.moveTo(0.5,0,0),cc.callFunc(()=>pools.numListPool.put(numList))));
    }
    
    /**
     * @function 获得数字的每位数
     */
    private static getDigits(num:number){
        let numString = num.toString();
        let numStringArray = [...numString];
        let numArray = numStringArray.map(Number);
        return numArray;
    }

    public static reduce(){
        
    }


}