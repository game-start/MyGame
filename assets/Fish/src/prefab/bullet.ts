

const {ccclass, property} = cc._decorator;
import pools from "../model/pools";
import player from "../model/player"

@ccclass
export default class bullet extends cc.Component {

    dir:cc.Vec2;
    speed:number;

    isPuncture:boolean = false;
    isSpring:boolean = false;

    hurt:number = 1;//子弹的伤害值
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.hurt = player.bulletHurt;
        this.isPuncture = player.isPuncture;
        this.isSpring = player.isSpring;
    }

    start () {

    }

    update (dt) {
        this.node.position = this.node.position.add(this.dir.mul(this.speed));
    }

    public init(dir:cc.Vec2,speed:number){
        this.dir = dir;
        this.speed = 5;
    }

    // private ruin(){
    //     if(pools.bulletPool){
    //         pools.bulletPool.put(this.node);
    //     }else{
    //         this.node.destroy();
    //     }
    // }
    
    /**
     * @function 子弹反弹
     */
    bounce(){
        
    }

    onCollisionEnter(other:cc.BoxCollider,self:cc.BoxCollider){
        // if(!this.isPuncture||other.node.group === "border"){
        //     pools.bulletPool.put(self.node);
        // }else{
        //     this.hurt--;
        //     if(this.hurt === 0){
        //         pools.bulletPool.put(self.node);
        //     }
        // }
        if(other.node.group === "border"){
            if(this.isSpring){
                if(other.tag === 0||other.tag === 2){
                    this.node.rotation = 180 - this.node.rotation;
                    this.dir.y = -this.dir.y;
                }else if(other.tag === 1||other.tag === 3){
                    this.node.rotation = -this.node.rotation;
                    this.dir.x = -this.dir.x;
                }
            }else{
                pools.bulletPool.put(self.node);
            }
        }else if(other.node.group === "fish"){
            if(this.isPuncture){
                this.hurt--;
                if(this.hurt === 0){
                    pools.bulletPool.put(self.node);
                }
            }else{
                pools.bulletPool.put(self.node);
            }
        }
    }

    reuse(){
        this.hurt = player.bulletHurt;
        this.isPuncture = player.isPuncture;
        this.isSpring = player.isSpring;
        //this.dir = this.getDirection(this.node.rotation);
    }

    // getDirection(rotation:number):cc.Vec2{
    //     let radian = rotation*Math.PI/180;
    //     let x = Math.sin(radian),y = Math.cos(radian);
    //     let dir = new cc.Vec2(x,y);
    //     return dir;
    // }
}
