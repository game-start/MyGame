export default class gameStatus{
    static width:number = 1280;
    static height:number = 720;
    static stage:number = 1;
    static fishNum:number = 0;
    static maxFishNum:number = 10;

    public static init(){
        this.stage = 1;
        this.fishNum = 0;
        this.maxFishNum = 10;
    }
}