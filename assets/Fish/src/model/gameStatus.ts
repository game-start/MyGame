export default class gameStatus{
    static width:number = 1280;
    static height:number = 720;
    static stage:number = 1;
    static fishNum:number = 0;
    static maxFishNum:number = 10;
    static killNum:number = 0;
    static maxKillNum:number = 5;
    static curBuff:number = 0;

    public static init(){
        this.stage = 1;
        this.fishNum = 0;
        this.maxFishNum = 10;
        this.killNum = 0;
        this.maxKillNum = 5;
        this.curBuff = 0;
    }
}