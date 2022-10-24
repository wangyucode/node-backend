export default class Message {

    
    /**
     * type:
     *  1: room create 
     *  2: player join
     *  3: player exit
     */
    constructor(public type: number, public message: object) {}
}