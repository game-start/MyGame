export default class commonPool{
    private pool:cc.NodePool = null;
    private curPrefab:cc.Prefab = null;

    private maxNumber:number;

    constructor(number:number,type:cc.Prefab){
        this.pool = new cc.NodePool();
        this.curPrefab = type;
        this.maxNumber = number + 20;
        this.init(number,type);
    }

    private init(number:number,type:cc.Prefab){
        for(let i=0;i<number;i++){
            let item:cc.Node = cc.instantiate(type);
            this.pool.put(item)
        }
    }

    public get(){
        if(this.pool.size()>0){
            let item:cc.Node = this.pool.get();
            cc.log("1")
            return item;
        }else{
            let item:cc.Node = cc.instantiate(this.curPrefab);
            cc.log("2");
            return item;
        }
    }

    public put(item:cc.Node){
        if(this.pool.size()<this.maxNumber){//内存和性能做下取舍
            this.pool.put(item);
        }else{
            item.destroy();
        }
    }

}