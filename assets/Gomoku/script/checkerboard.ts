// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

enum tupleScoreTable{
    nochess = 7,
    oneAi = 35,
    twoAi = 800,
    threeAi = 15000,
    fourAi = 800000,
    oneplayer = 15,
    twoplayer = 400,
    threeplayer = 1800,
    fourplayer = 100000, 
}

@ccclass
export default class checkerboard extends cc.Component {

    static Graphics:cc.Graphics = null;
    static canvasHeight:number = 0;
    static canvasWidth:number = 0;
    static boardHeight:number = 0;
    static boardWidth:number = 0;
    static color:string = "black";
    static downChess:Array<Array<number>> = new Array();
    static score:Array<Array<number>> = new Array();
    winArray:Array<Array<Array<boolean>>> = new Array();
    count:number = 0;
    blackWin:Array<number> = new Array();
    whiteWin:Array<number> = new Array();

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.screen();
        checkerboard.Graphics = this.node.getComponent(cc.Graphics);
        checkerboard.canvasHeight = this.node.parent.height;
        checkerboard.canvasWidth = this.node.parent.width;
        cc.log(checkerboard.canvasHeight);
        cc.log(checkerboard.canvasWidth);
        checkerboard.boardHeight = this.node.height;
        checkerboard.boardWidth = this.node.width;
        cc.log(checkerboard.boardHeight);
        cc.log(checkerboard.boardWidth);
        this.putColor(checkerboard.Graphics,checkerboard.canvasWidth);
        this.initboard(checkerboard.Graphics,checkerboard.boardHeight,checkerboard.boardWidth);
        this.initTwoArray(checkerboard.downChess,11,11);
        this.initTwoArray(checkerboard.score,11,11);
        this.initAllWins();
        cc.log(this.winArray);
    }

    start () {
        for(let i=0;i<this.count;i++){
            this.blackWin[i] = 0;
            this.whiteWin[i] = 0;
        }
    }

    onEnable(){
        this.node.on(cc.Node.EventType.TOUCH_START,(event)=>{
            cc.log(this.getLocation(event.getLocation()))
            this.downChess(checkerboard.Graphics,event.getLocation(),checkerboard.color);
        });
    }
    
    screen(){
        let winsize = cc.winSize;
        cc.log(winsize);
        if(winsize.width<=winsize.height){
            this.node.height = this.node.width = Math.ceil(winsize.width) - 70;
        }else{
            this.node.height = this.node.width = Math.ceil(winsize.height) - 70;
        }
    }

    initTwoArray(arr:Array<Array<number>>,x:number,y:number){//定义二维数组，并初始化值为0
        for(let i=0;i<x;i++){
            arr.push([]);
            for(let j=0;j<y;j++){
                arr[i][j] = 0;
            }
        }
    }

    private initboard(Graphics:cc.Graphics,boardHeight:number,boardWidth:number){//画网格
        for(let i=0;i<=10;i++){
            Graphics.moveTo(-boardWidth/2,boardHeight/2-(i*boardHeight/10));
            Graphics.lineTo(boardWidth/2,boardHeight/2-(i*boardHeight/10));
            Graphics.moveTo(-boardWidth/2+(i*boardWidth/10),boardHeight/2);
            Graphics.lineTo(-boardWidth/2+(i*boardWidth/10),-boardWidth/2);
            Graphics.strokeColor = cc.Color.BLACK;
            Graphics.stroke();
        };
    }

    private putColor(Graphics:cc.Graphics,canvasWidth:number){//背景色
        Graphics.rect(-canvasWidth/2,-canvasWidth/2,canvasWidth,canvasWidth);
        Graphics.fillColor = cc.color(226,231,45);
        Graphics.fill();
    }

    private getLocation(oldWorldLocation:cc.Vec2){//修正落子的位置
        let oldNodeLocation = this.node.convertToNodeSpaceAR(oldWorldLocation);
        let restX = oldNodeLocation.x%(checkerboard.boardWidth/10);//触摸点的x坐标除每个格子边长的余数
        let restY = oldNodeLocation.y%(checkerboard.boardHeight/10);//触摸点的y坐标除每个格子边长的余数
        let newNodeLocation = new cc.Vec2();
        newNodeLocation.x = this.correct(restX,oldNodeLocation.x);
        newNodeLocation.y = this.correct(restY,oldNodeLocation.y);
        return newNodeLocation;
    }

    private correct(rest:number,v:number){//得到正确的落子x,y坐标
        if(Math.abs(rest)<=checkerboard.boardWidth/20){//如果余数的绝对值小于等于每个格子的一半，就靠近中心点落子
            v -= rest;
        }
        else if(rest>0){//余数的绝对值大于每个格子的一半，且坐标为正
            v = v+checkerboard.boardWidth/10-rest;
        }
        else{//余数的绝对值大于每个格子的一半，且坐标为负
            v = v-rest-checkerboard.boardWidth/10;
        }
        return v;
    }

    private chess(Graphics:cc.Graphics,Location:cc.Vec2,Color:string){//绘制棋子
        let r = 25;
        if(Color === "black"){
            Graphics.fillColor = cc.Color.BLACK;
        }else if(Color === "white"){
            Graphics.fillColor = cc.Color.WHITE;
        }
        Graphics.circle(Location.x,Location.y,r);
        Graphics.fill();
    }

    private changeColor(Color:string){//落子后切换棋子颜色
        if(Color === "black"){
            checkerboard.color = "white"
        }else if(Color === "white"){
            checkerboard.color = "black"
        }
    }

    private changeChessArray(x:number,y:number,Color:string){//落子后记录颜色，黑：1，白：2，无子：0
        if(Color === "black"){
            checkerboard.downChess[x][y] = 1;
        }else if(Color === "white"){
            checkerboard.downChess[x][y] = 2;
        }
    }

    private changeNodeToArray(location:cc.Vec2){//将落子的坐标转换成在数组中的位置(记录该点颜色)
        let x = location.x/(checkerboard.boardWidth/10) + 5;
        let y = location.y/(checkerboard.boardHeight/10) + 5;
        return cc.v2(x,y);
    }

    private changeArrayToNode(location:cc.Vec2){//将落子在数组中的位置转换成在节点中的坐标(绘制棋子)
        let x = (location.x - 5)*(checkerboard.boardWidth/10);
        let y = (location.y - 5)*(checkerboard.boardHeight/10);
        return cc.v2(x,y);
    }

    private win(Type:string,x:number,y:number){//每在该赢法落一个子，计数加一，当计数为5时，获胜（一旦一方在该赢法落子，另一方无法通过该赢法获胜，直接置为99）
        for(let i=0;i<this.count;i++){
            if(this.winArray[x][y][i]){
                if(Type == "black"){
                    this.blackWin[i]++;
                    this.whiteWin[i] = 99;
                }else if(Type == "white"){
                    this.whiteWin[i]++;
                    this.blackWin[i] = 99;
                }
            }

            if(this.blackWin[i]==5){
                console.log("black win!");
                cc.game.restart();
            }else if(this.whiteWin[i]==5){
                console.log("white win!");
                cc.game.restart();
            }
        }
    }

    private downChess(Graphics:cc.Graphics,Location:cc.Vec2,Color:string){//下棋
        let newNodeLocation = this.getLocation(Location);
        cc.log(newNodeLocation);
        let arrLocation = this.changeNodeToArray(newNodeLocation);
        // let x = arrLocation.x;
        // let y = arrLocation.y;
        // if(checkerboard.downChess[x][y] === 0){
        //     this.changeChessArray(x,y,Color);
        //     this.chess(Graphics,newNodeLocation,Color);
        //     this.changeColor(Color);
        //     this.win(Color,x,y);
        //}
        this.addChess(arrLocation,newNodeLocation,Graphics,Color)
        this.putScore(checkerboard.color);
        let aiArrPosition = this.getBestPosition();
        let aiNodeLocation = this.changeArrayToNode(aiArrPosition);
        this.addChess(aiArrPosition,aiNodeLocation,Graphics,checkerboard.color);
    }

    private addChess(arrLocation:cc.Vec2,NodeLocation:cc.Vec2,Graphics:cc.Graphics,Color:string){
        let x = arrLocation.x;
        let y = arrLocation.y;
        if(checkerboard.downChess[x][y] === 0){
            this.changeChessArray(x,y,Color);
            this.chess(Graphics,NodeLocation,Color);
            this.changeColor(Color);
            this.win(Color,x,y);
            checkerboard.score[x][y] = 0;
        }
    }

    private initAllWins(){
        for(let i=0;i<=10;i++){//声明三维数组,统计每种赢法的5个落子
            this.winArray[i] = new Array();
            for(let j=0;j<=10;j++){
                this.winArray[i][j] = new Array();
            }
        }
        for(let i=0;i<=6;i++){//所有横向赢法
            for(let j=0;j<=10;j++){
                for(let k=0;k<=4;k++){
                    this.winArray[i+k][j][this.count] = true;
                }
                this.count++;
            }
        };
        for(let i=0;i<=10;i++){//所有纵向赢法
            for(let j=0;j<=6;j++){
                for(let k=0;k<=4;k++){
                    this.winArray[i][j+k][this.count] = true;
                }
                this.count++;
            }
        };
        for(let i=0;i<=6;i++){//对角线
            for(let j=0;j<=6;j++){
                for(let k=0;k<=4;k++){
                    this.winArray[i+k][j+k][this.count] = true;
                }
                this.count++;
            }
        };
        for(let i=4;i<=10;i++){//对角线
            for(let j=0;j<=6;j++){
                for(let k=0;k<=4;k++){
                    this.winArray[i-k][j+k][this.count] = true;
                }
                this.count++;
            }
        }
    }

    private putScore(color:string){//给所有的空位置评分
        for(let i=0;i<=10;i++){
            for(let j=0;j<=10;j++){
                if(!checkerboard.downChess[i][j]){//该点未落子
                    if(color === "white"){
                        this.Calculation(i,j,this.whiteWin,this.blackWin);
                    }
                    else if(color === "black"){
                        this.Calculation(i,j,this.blackWin,this.whiteWin);
                    }
                }
            }
        }
    }

    private Calculation(i:number,j:number,aiwin:Array<number>,playerwin:Array<number>){
        let score = 0;
        for(let k=0;k<this.count;k++){//遍历每种赢法
            if(this.winArray[i][j][k]){//为true，说明该赢法中有这个点，而且调用该方法前判断过该点未落子
                switch(aiwin[k]){//ai在该赢法已经落子数
                    case 1:
                        score += tupleScoreTable.oneAi;
                        break;
                    case 2:
                        score += tupleScoreTable.twoAi;
                        break;
                    case 3:
                        score += tupleScoreTable.threeAi;
                        break;
                    case 4:
                        score += tupleScoreTable.fourAi;
                    case 0:
                        score += tupleScoreTable.nochess;
                }
                switch(playerwin[k]){//玩家在该赢法已经落子数
                    case 1:
                        score += tupleScoreTable.oneplayer;
                        break;
                    case 2:
                        score += tupleScoreTable.twoplayer;
                        break;
                    case 3:
                        score += tupleScoreTable.threeplayer;
                        break;
                    case 4:
                        score += tupleScoreTable.fourplayer;
                        break;    
                }
            }
        }
        checkerboard.score[i][j] = score;
    }

    getBestPosition():cc.Vec2{
        let score =0;
        let position = new cc.Vec2();
        for(let i=0;i<11;i++){
            for(let j=0;j<11;j++){
                if(checkerboard.score[i][j]>=score){
                    score = checkerboard.score[i][j];
                    position = cc.v2(i,j);
                }
            }
        }
        //checkerboard.score[position.x][position.y] = 0;
        return position;
    }
    

    // update (dt) {}
}
