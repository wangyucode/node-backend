import { Context } from "koa";
import Message from "../dealer/message";
import Player from "../dealer/player";
import Room from "../dealer/room";
import { logger } from "../log";
import { ADMIN_EMAIL, email } from "../mail";
import { getDataResult, getErrorResult } from "../utils";
import { getSession } from "./wx";

const emptyIds: number[] = [];
const activeRooms = new Map<number, Room>();
const players = new Map<string, Player>();

const MAX_ROOM_SIZE = 9999;
const ROOM_TTL_MINUTE = 30;

export function init() {
    for (let i = 0; i < MAX_ROOM_SIZE; i++) {
        emptyIds[i] = i + 1;
    }
}

export async function login(ctx: Context) {
    if (!ctx.query.code) ctx.throw(400, 'code required');
    const {openid} = await getSession(process.env.WX_APPID_CLIPBOARD, process.env.WX_SECRET_CLIPBOARD, ctx.query.code as string);
    if (openid) {
        let player = players.get(openid);
        if(!player){
            player = new Player(openid);
            players.set(openid, player);
        }
        ctx.body = getDataResult(player);
    } else {
        ctx.body = getErrorResult('登录失败');
    }
}

export async function create(ctx: Context) {
    if (!ctx.query.type) ctx.throw(400, 'type required');
    const type = Number.parseInt(ctx.query.type as string);
    if (Number.isNaN(type) || type < 0) ctx.throw(400, 'type not valid');
    clearRooms();

    const id = emptyIds.splice(Math.floor(Math.random() * emptyIds.length), 1)[0];
    const room = new Room(id);
    room.type = type;
    activeRooms.set(room.id, room);
    room.players.push(new Player(1));
    room.messages.push(new Message(1, { roomId: room.id }));
    room.messages.push(new Message(2, { playerId: 1 }));
    room.timestamp = new Date().getTime();
    ctx.body = room.id;

    if (emptyIds.length === 100 || emptyIds.length === 10) email(ADMIN_EMAIL, 'dealer: remains room not enough', emptyIds.length + "");
}

export async function join(ctx: Context) {
    if (!ctx.query.id) ctx.throw(400, 'id required');
    if (!ctx.query.type) ctx.throw(400, 'type required');
    const roomId = Number.parseInt(ctx.query.id as string);
    const type = Number.parseInt(ctx.query.type as string);
    const room = activeRooms.get(roomId);
    if (!room) ctx.throw(404, '房间未找到');
    if (room.type !== type) ctx.throw(400, '房间类型错误');

    const playerId = room.players.length + 1
    room.players.push(new Player(playerId));
    room.messages.push(new Message(2, { playerId: 1 }));
    room.timestamp = new Date().getTime();
    ctx.body = playerId;
}

export async function status(ctx: Context) {
    let totalPlayerCount = 0;
    for (const entry of activeRooms) {
        totalPlayerCount += entry[1].players.length;
    }

    ctx.body = getDataResult({
        room: activeRooms.size,
        player: totalPlayerCount
    });
}

export function clearRooms() {
    for (const entry of activeRooms) {
        if (new Date().getTime() - entry[1].timestamp > ROOM_TTL_MINUTE * 60 * 1000) {
            clearRoom(entry[1]);
            logger.info(`clear room ${entry[0]}`);
        }
    }
}

function clearRoom(room: Room) {
    activeRooms.delete(room.id);
    emptyIds.push(room.id);
    room = null;
}