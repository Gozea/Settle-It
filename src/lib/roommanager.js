import { io } from 'socket.io-client'
import { writable } from 'svelte/store'

const socket = io()
export const joinTrigger = writable()
export const memberReadyTrigger = writable()
export const resetReadyTrigger = writable()
export const leaveTrigger = writable()
export const masterTrigger = writable()
export const typeTrigger = writable("coin")
export const gameTrigger = writable()
export const gameInfoTrigger = writable()
export const gameResultTrigger = writable()


// listeners
socket.on("new-member-join", (memberId) => {
    joinTrigger.set(memberId)
})

socket.on("disconnected-user", (memberId) => {
    leaveTrigger.set(memberId)
})

socket.on("member-ready", (memberId) => {
    memberReadyTrigger.set(memberId)
    memberReadyTrigger.set(null)
})

socket.on("reset-ready", () => {
    resetReadyTrigger.set(0)
    resetReadyTrigger.set(null)
})

socket.on("all-member-ready", (game, info) => {
    switch(game) {
        case "coin":
            gameTrigger.set("coin")
            if (info == 0) gameInfoTrigger.set("head")
            else gameInfoTrigger.set("tail")
            break
        case "straw":
            gameTrigger.set("straw")
            break
        default:
            break
    }
})

socket.on("master-change", (master) => {
    masterTrigger.set(master)
})

socket.on("game-change", (game) => {
    typeTrigger.set(game)
    gameTrigger.set(null)
    gameInfoTrigger.set(null)
    gameResultTrigger.set(null)
})

socket.on("straw-picked", (member, straw) => {
    gameInfoTrigger.set([member, straw])
})

socket.on("last-straw", (losers, loserPicks) => {
    gameResultTrigger.set([losers, loserPicks])
})

// emitters
export async function askJoinRoom(roomName){
    return new Promise((resolve, reject) => {
        socket.emit("ask-join-room", roomName, (response) => {
            if (response) {
                resolve(response)
            } else {
                reject(new Error("No response"))
            }
        }) 
    }) 
}

export async function askCreateRoom(roomName){
    return new Promise((resolve, reject) => {
        socket.emit("ask-create-room", roomName, (response) => {
            if (response) {
                resolve(response)
            } else {
                reject(new Error("No response"))
            }
        })
    }) 
}

export async function getRoomMembers(roomName) {
    return new Promise((resolve, reject) => {
        socket.emit("get-room-members", roomName, (response) => {
            if(response) {
                resolve(response)
            } else {
                reject(new Error("No response"))
            }
        })
    })
}

export async function getRoomMaster(roomName) {
    return new Promise((resolve, reject) => {
        socket.emit("get-room-master", roomName, (response) => {
            if (response) {
                masterTrigger.set(response)
                resolve(response)
            } else {
                reject(new Error("No response"))
            }
        })
    })
}

export async function sendReady(roomName) {
    return new Promise((resolve, reject) => {
        socket.emit("send-ready", roomName, (response) => {
            if (response) resolve(response)
            else reject(new Error("No response"))
        })
    })
}

export async function sendType(roomName, game) {
    return new Promise((resolve, reject) => {
        socket.emit("send-game", roomName, game, (response) => {
            if (response) resolve(response)
            else reject(new Error("No response"))
        })
    })
}

export async function sendStraw(roomName, roomMember, strawPick) {
    return new Promise((resolve, reject) => {
        socket.emit("send-straw", roomName, roomMember, strawPick, (response) => {
            if (response) return resolve(response)
            else reject(new Error("No response"))
        })
    })
}
