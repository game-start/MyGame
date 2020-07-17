import { callbackify } from "util";

const Type = cc.Enum({
    "是":1,
    "否":0
})


const {ccclass, property} = cc._decorator;

@ccclass
export default class text extends cc.Component {

    

    @property({tooltip:"是否闪烁",type:Type})
    Flash = 0;

    @property({tooltip:"是否打字",type:Type})
    OneByOne = 0;
    // onLoad () {}

    start () {
        
    }

    onEnable(){
        let text = this.node.getComponent(cc.Label).string;
        if(this.OneByOne){
            this.putTextOneByOne(text);
        }
        if(this.Flash){
            this.putFlashText();
        }
    }

    // update (dt) {}
    onDisable(){
        this.resetText();
    }

    putText(text:string){
        this.node.getComponent(cc.Label).string = text;
    }

    putTextOneByOne(text:string){
        let textArray = text.split("");
        let i = 0;
        let len = textArray.length;
        let Label = this.node.getComponent(cc.Label);
        Label.string = "";
        let callback = function(){
            if(textArray[i] === "."){
                
            }else if(textArray[i] === "/"){
                Label.string = "";
            }else{
                Label.string += textArray[i];
            }
            // if(textArray[i] === "/"){
            //     Label.string = "";
            // }else{
            //     Label.string += textArray[i];
            // }
            i++;
        }
        this.schedule(callback,0.15,len-1);
    }

    putFlashText(){
        //this.node.getComponent(cc.Label).string = text;
        this.node.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.5,50),cc.fadeTo(0.5,255))));
    }

    resetText(){
        this.node.stopAllActions();
        //this.node.getComponent(cc.Label).string = "";
        this.node.opacity = 255;
    }


}
