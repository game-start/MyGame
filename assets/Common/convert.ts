export default class convert{
    public static worldToNode(position:cc.Vec2,node:cc.Node):cc.Vec2{
        let nodePosition:cc.Vec2 = null;
        nodePosition = node.convertToNodeSpaceAR(position);
        return nodePosition;
    }

    public static nodeToWorld(position:cc.Vec2,node:cc.Node):cc.Vec2{
        let worldPositon:cc.Vec2 = null;
        worldPositon = node.convertToWorldSpaceAR(position);
        return worldPositon;
    }

    public static nodeToNode(position:cc.Vec2,oldNode:cc.Node,newNode:cc.Node):cc.Vec2{
        let worldPosition = this.nodeToWorld(position,oldNode);
        let newPosition = this.worldToNode(worldPosition,newNode);
        return newPosition;
    }
}

