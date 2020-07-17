

const {ccclass, property} = cc._decorator;

@ccclass
export default class arrow extends cc.Component {

    graphics:cc.Graphics = undefined;

    w:number = 0;
    h:number = 0;
    

    onLoad () {
        this.graphics = this.node.getComponent(cc.Graphics);
        this.getNodeSize();
    }

    start () {
        this.createArrow();
        this.move();
    }

    // update (dt) {}
    getNodeSize(){
        this.w = this.node.width;
        this.h = this.node.height;
    }

    createArrow(){
        let w = this.w;
        let h = this.h;
        this.graphics.moveTo(-w/3,-h/2);
        this.graphics.lineTo(-w/3,0.2*h);
        this.graphics.lineTo(-w/2,0.2*h);
        this.graphics.lineTo(0,h/2);
        this.graphics.lineTo(w/2,0.2*h);
        this.graphics.lineTo(w/3,0.2*h);
        this.graphics.lineTo(w/3,-h/2);
        this.graphics.lineTo(-w/3,-h/2);
        this.graphics.stroke();
        this.graphics.fill();
        // this.graphics.moveTo(w/6,0);
        // this.graphics.lineTo(w/6,0.7*h);
        // this.graphics.lineTo(0,0.7*h);
        // this.graphics.lineTo(w/2,h);
        // this.graphics.lineTo(w,0.7*h);
        // this.graphics.lineTo(5*w/6,0.7*h);
        // this.graphics.lineTo(5*w/6,0);
        // this.graphics.lineTo(w/6,0);
        // this.graphics.stroke();
        // this.graphics.fill();
    }

    move(){
        let h = this.h;
        let upAction = cc.moveBy(0.5,cc.v2(0,h/10));
        let downAction = cc.moveBy(0.5,cc.v2(0,-h/10));
        this.node.runAction(cc.repeatForever(cc.sequence(upAction,downAction)));
    }
}
