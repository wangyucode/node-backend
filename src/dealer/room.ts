import Message from "./message";
import Player from "./player";

export default class Room {

    public type: number;  // type -> 0: 卧底; 1: 狼人; 2: 血染; 3: 骰子; 4: 抽签
    public players: Player[] = [];
    public messages: Message[] = [];
    public timestamp: number;

    constructor(public id: number){}
}