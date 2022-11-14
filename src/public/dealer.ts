import { randomUUID } from "crypto";
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
    let pid = null;
    if (ctx.query.code === 'wycode.cn') {
        pid = randomUUID();
    } else {
        pid = (await getSession(process.env.WX_APPID_DEALER, process.env.WX_SECRET_DEALER, ctx.query.code as string)).openid;
    }
    if (pid) {
        let player = players.get(pid);
        if (!player) {
            player = new Player(pid);
            players.set(pid, player);
        }
        ctx.body = getDataResult(player);
    } else {
        ctx.body = getErrorResult('登录失败');
    }
}

export async function create(ctx: Context) {
    if (!ctx.query.type) ctx.throw(400, 'type required');
    if (!ctx.query.pid) ctx.throw(400, 'pid required');
    const player = players.get(ctx.query.pid as string);
    if (!player) ctx.throw(401, 'not login');
    const type = Number.parseInt(ctx.query.type as string);
    if (Number.isNaN(type) || type < 0) ctx.throw(400, 'type not valid');
    clearRooms();

    const id = emptyIds.splice(Math.floor(Math.random() * emptyIds.length), 1)[0];
    const room = new Room(id);
    room.type = type;
    activeRooms.set(room.id, room);
    player.roomId = room.id;
    player.type = type;
    room.players.push(player);
    room.messages.push(new Message(1, { roomId: room.id }));
    room.messages.push(new Message(2, { playerId: player.id, seat: 1 }));
    room.timestamp = new Date().getTime();
    ctx.body = getDataResult(room.id);

    if (emptyIds.length === 100 || emptyIds.length === 10) email(ADMIN_EMAIL, 'dealer: remains room not enough', emptyIds.length + "");
}

export async function join(ctx: Context) {
    if (!ctx.query.id) ctx.throw(400, 'id required');
    if (!ctx.query.type) ctx.throw(400, 'type required');
    if (!ctx.query.pid) ctx.throw(400, 'pid required');
    const player = players.get(ctx.query.pid as string);
    const roomId = Number.parseInt(ctx.query.id as string);
    const type = Number.parseInt(ctx.query.type as string);
    const room = activeRooms.get(roomId);
    if (!room) ctx.throw(404, '房间未找到');
    if (room.type !== type) ctx.throw(400, '房间类型错误');
    if (!player) ctx.throw(401, '未登录');
    if (player.roomId > 0) ctx.throw(420, '你已经在房间中了');

    const seat = room.players.length + 1
    room.players.push(player);
    room.messages.push(new Message(2, { playerId: player.id, seat }));
    room.timestamp = new Date().getTime();
    ctx.body = getDataResult(room.id);
}

export async function exit(ctx: Context) {
    if (!ctx.query.rid) ctx.throw(400, 'rid required');
    if (!ctx.query.pid) ctx.throw(400, 'pid required');
    let player = players.get(ctx.query.pid as string);
    const roomId = Number.parseInt(ctx.query.rid as string);
    const room = activeRooms.get(roomId);
    if (!room) ctx.throw(404, '房间未开启');

    const index = room.players.findIndex(it => it.id === player.id);
    if (index === -1) ctx.throw(404, '已退出');

    room.players.splice(index, 1);
    room.messages.push(new Message(3, { playerId: player.id}))

    ctx.body = getDataResult(player);

    players.delete(player.id);
    player = null;

    if (room.players.length === 0) clearRoom(room);
}

export async function messages(ctx: Context) {
    if (!ctx.query.rid) ctx.throw(400, 'rid required');
    if (!ctx.query.index) ctx.throw(400, 'index required');
    const roomId = Number.parseInt(ctx.query.rid as string);
    const index = Number.parseInt(ctx.query.index as string);
    const room = activeRooms.get(roomId);
    if (!room) ctx.throw(404, '房间未开启');

    ctx.body = getDataResult(room.messages.slice(index));
}

export async function status(ctx: Context) {
    ctx.body = getDataResult({
        room: activeRooms.size,
        player: players.size
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
    room.players.forEach(player => {
        player.roomId = null;
        player.type = -1;
    });
    room.players = [];
    room.messages = [];
    room = null;
}