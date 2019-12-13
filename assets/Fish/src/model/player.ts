export default class player{
    private static instance:player = null;

    barrel:cc.Node;
    
    public static getIns():player{
        if(!this.instance){
            this.instance = new player();
        }
        return this.instance;
    }

    public init(barrel:cc.Node):void{
        this.barrel = barrel;
    }

}