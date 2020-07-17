interface goods{
    number:number,
    price:number,
    exist:boolean
}

interface skill{
    number:number,
    lv:number,
    cdChange:number,
    timesChange:number
}

export default class gameStatus{
    static width:number = 1280;
    static height:number = 720;
    static stage:number = 1;
    static fishNum:number = 0;
    static maxFishNum:number = 10;
    static killNum:number = 0;
    static maxKillNum:number = 5;
    static curBuff:number = 0;
    static curGoods:Array<goods> = [];
    static curSkills:Array<skill> = [];
    static MaxLv:number = 5;
    static SoldierInfo:object = {hp:1,speed:1};
    static Tips:cc.Node = undefined;
    static createFishTimer = 2.5;
    static canCreateFish = true;
    static shop = false;
    
    /**
     * @function 初始化游戏各种数据和状态
     */
    public static init(){
        this.stage = 1;
        this.fishNum = 0;
        this.maxFishNum = 10;
        this.killNum = 0;
        this.maxKillNum = 5;
        this.curBuff = 0;
        this.curGoods = [];
        this.curSkills = [];
        this.MaxLv = 5;
        this.SoldierInfo = {hp:1,speed:1};
        this.Tips = undefined;
        this.createFishTimer = 2.5;
        this.canCreateFish = true;
        this.shop = false;
    }
}