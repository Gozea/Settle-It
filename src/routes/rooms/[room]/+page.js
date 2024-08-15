import { error } from '@sveltejs/kit'
import { askJoinRoom, getRoomMembers, getRoomMaster } from '$lib/roommanager.js'

export async function load({ params }) {
    const myId = await askJoinRoom(params.room)
    const roomMembers = await getRoomMembers(params.room)
    const roomMaster = await getRoomMaster(params.room)
    const room = params.room
    return {myId, roomMembers, room}
}
