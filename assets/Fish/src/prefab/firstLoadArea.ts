
import status from "../model/gameStatus";
import player from "../model/player";
import { resolve } from "path";
const {ccclass, property} = cc._decorator;

@ccclass
export default class firstLoadArea extends cc.Component {

    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    onEnable(){
        this.step(1)
        .then(()=>this.nextStep())
        .then(()=>this.step(2))
        .then(()=>this.nextStep())
        .then(()=>this.step(3)
        .then(()=>this.nextStep())
        .then(()=>this.step(4)))
        .then(()=>this.step5())
        .then(()=>this.step6())
        .then(()=>this.step7())
        .then(()=>this.step8())
        .then(()=>this.step9())
        .then(()=>this.finish());
    }

    // update (dt) {}
    step(num:number){
        let name = "step" + num;
        let step = this.node.getChildByName(name);
        this.activeNode(step);
        return new Promise((resolve,reject)=>{
            setTimeout(()=>{
                this.hideNode(step);
                resolve();
            },2000);
        })
    }

    step5(){
        status.canCreateFish = true;
        let text = this.node.getChildByName("flashText");
        this.activeNode(text);
        text.getComponent("text").putText("请击杀5条普通鱼,精英鱼将会出现,如果普通鱼数量超过10游戏结束");
        return new Promise((resolve,reject)=>{
            let timer = setInterval(()=>{
                if(status.curBuff){
                    this.hideNode(text);
                    resolve();
                    clearInterval(timer);
                }
            },0)
        })
    }

    step6(){
        status.canCreateFish = false;
        let text = this.node.getChildByName("oneByOneText");
        let mask = this.node.getChildByName("mask");
        mask.active = true;
        let stopSign = "....."
        text.getComponent("text").putText(`出现了一只精英鱼，所有鱼的属性都得到了强化${stopSign}/仅作为新手引导,停止制造新的普通鱼${stopSign}/并特别提供100金币用于购买技能`);
        this.activeNode(text);
        return new Promise((resolve,reject)=>{
            setTimeout(() => {
                this.hideNode(text);
                resolve();
            }, 12000);
        })
    }

    step7(){
        player.addGold(100);
        let step = this.node.getChildByName("step7");
        let mask = this.node.getChildByName("mask");
        mask.getComponent(cc.Mask).enabled = true;
        this.activeNode(step);
        return new Promise((resolve,reject)=>{
            let timer = setInterval(()=>{
                if(status.shop){
                    this.node.getChildByName("mask").active = false;
                    this.hideNode(step);
                    resolve();
                    clearInterval(timer);
                }
            },0)
        })
    }

    step8(){
        let step = this.node.getChildByName("step8");
        let stopSign = "....."
        step.getChildByName("text").getComponent("text").putText(`同一种技能每买一次价格都会提高${stopSign}/重复购买技能会提升当前技能的等级${stopSign}/技能升级会随机升级属性${stopSign}/已经满级的技能不会出现在商店中`)
        this.activeNode(step);
        return new Promise((resolve,reject)=>{
            let timer = setInterval(()=>{
                if(!status.shop){
                    this.hideNode(step);
                    resolve();
                    clearInterval(timer);
                }
            },0)
        })
    }

    step9(){
        let text = this.node.getChildByName("flashText");
        debugger;
        this.activeNode(text);
        text.getComponent("text").putText("利用技能击败精英鱼吧");
        return new Promise((resolve,reject)=>{
            let timer = setInterval(()=>{
                if(!status.curBuff){
                    this.hideNode(text);
                    resolve();
                    clearInterval(timer);
                }
            })
        });
    }
    
    
    nextStep(){
        let text = this.node.getChildByName("flashText");
        this.activeNode(text);
        text.getComponent("text").putText("点击屏幕任意位置继续");
        return new Promise((resolve,reject)=>{
            this.node.once(cc.Node.EventType.TOUCH_END,()=>{
                this.hideNode(text);
                resolve();
            })
        })
    }

    finish(){
        cc.sys.localStorage.setItem("first",1);
        cc.director.emit("newhandEnd");
    }
    
    /**
     * @function 激活节点以及其子节点
     */
    activeNode(fatherNode:cc.Node){
        if(fatherNode.active === false){
            fatherNode.active = true;
        }
        let sonArray = fatherNode.children;
        let len = sonArray.length;
        if(len >= 1){
            for(let i=0;i<len;i++){
                if(sonArray[i].active === false){
                    sonArray[i].active = true;
                }
            }
        }
    }
    
    /**
     * @function 隐藏节点以及其子节点
     */
    hideNode(fatherNode:cc.Node){
        if(fatherNode.active === true){
            fatherNode.active = false;
        }
        let sonArray = fatherNode.children;
        let len = sonArray.length;
        if(len >= 1){
            for(let i=0;i<len;i++){
                if(sonArray[i].active === true){
                    sonArray[i].active = false;
                }
            }
        }
    }
}
