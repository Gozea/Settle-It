import { type ViteDevServer } from 'vite';
import { Server } from 'socket.io'

const rooms = new Map()

function roomExists(roomName: string, io): bool {
    return io.sockets.adapter.rooms.has(roomName)
}

function getNbPlayerRoom(roomName: string) {
    return rooms.get(roomName).get("members").size
}

function resetReady(roomName: string, io) {
    if (roomExists(roomName, io)) {
        rooms.get(roomName).get("members").forEach((vote, member) => {
            rooms.get(roomName).get("members").get(member).set("ready", 0)
            rooms.get(roomName).get("members").get(member).delete("choice")
        })
        io.sockets.to(roomName).emit("reset-ready")
    }
}

function resetChoices(roomName: string, io) {
    if (roomExists(roomName, io)) {
        rooms.get(roomName).get("members").forEach((vote, member) => {
            rooms.get(roomName).get("members").get(member).set("choice", null)
        })
    }
}

function newRoom(roomName: string, socket, io): string {
    if(!roomExists(roomName, io)) {
        socket.join(roomName)
        // room
        rooms.set(roomName, new Map())
        // room info and member
        rooms.get(roomName).set("info", new Map())
        rooms.get(roomName).set("members", new Map())
        // put member in room
        rooms.get(roomName).get("members").set(socket.id, new Map())
        rooms.get(roomName).get("members").get(socket.id).set("ready", 0)
        // put room infos (master, room type, params)
        rooms.get(roomName).get("info").set("master", socket.id)
        changeType(roomName, "coin", io)
        return "create-room-success"
    } else {
        return "create-room-failure"
    }
}

function joinRoom(roomName: string, socket, io): string {
    if(roomExists(roomName, io)) {
        socket.join(roomName)
        if (!rooms.get(roomName).get("members").has(socket.id)) {
            rooms.get(roomName).get("members").set(socket.id, new Map())
            rooms.get(roomName).get("members").get(socket.id).set("ready", 0)
            socket.broadcast.to(roomName).emit("new-member-join", socket.id)
        }
        return socket.id
    } else {
        return "join-room-failure"
    }
}

function changeType(roomName: string, game: string, io) {
    if (roomExists(roomName, io)) {
        switch(game) {
            case "coin" : 
                rooms.get(roomName).get("info").set("type", "coin")
                rooms.get(roomName).get("info").set("params", new Map())
                break
            case "straw":
                rooms.get(roomName).get("info").set("type", "straw")
                rooms.get(roomName).get("info").set("params", new Map())
                rooms.get(roomName).get("info").get("params").set("nb_loser", 1)
                break
            case "rps" :
                rooms.get(roomName).get("info").set("type", "rps")
                rooms.get(roomName).get("info").set("params", new Map())
                break
            default:
                break
        }
    }
}


function setMemberReady(roomName: string, socket, io): string {
    rooms.get(roomName).get("members").get(socket.id).set("ready", 1)
    io.sockets.to(roomName).emit("member-ready", socket.id)
    // check full agreement (all votes are 1)
    let allAgreement = true
    rooms.get(roomName).get("members").forEach((memberInfo, member) => {
        if (memberInfo.get("ready") == 0) allAgreement = false
    })
    gameReady(roomName, allAgreement, io)
    return "all-member-ready"
}

function gameReady(roomName: string, allAgreement: bool, io) {
    if (allAgreement == true) {
        const gameType = rooms.get(roomName).get("info").get("type")
        switch(gameType) {
            case "coin" :
                io.to(roomName).emit("all-member-ready", "coin", Math.floor(Math.random()*2))
                break
            case "straw":
                io.to(roomName).emit("all-member-ready", "straw", "")
                break
            case "rps":
                break
            default:
                break
        }
    }
}

function pickStraw(roomName: string, roomMember: string, straw: int, io) {
    rooms.get(roomName).get("members").get(roomMember).set("choice", straw)
    io.sockets.to(roomName).emit("straw-picked", roomMember, straw)
    let allPicked = true
    rooms.get(roomName).get("members").forEach((memberInfo, member) => {
        if(!memberInfo.has("choice")) allPicked = false
    })
    lastStraw(roomName, allPicked, io)
}

function lastStraw(roomName: string, allPicked: bool, io) {
    if(allPicked) {
        const loserPick = Math.floor(Math.random()*getNbPlayerRoom(roomName))
        let losers = []
        rooms.get(roomName).get("members").forEach((memberInfo, member) => {
            if (memberInfo.get("choice")==loserPick) losers.push(member)
        })
        console.log("loser : ", losers, " ", loserPick)
        io.sockets.to(roomName).emit("last-straw", losers, loserPick)
    }
}


export const webSocketServer = {
    name: 'webSocketServer',
    configureServer(server: ViteDevServer) {
        if (!server.httpServer) return
        const io = new Server(server.httpServer)
        io.on('connect', (socket) => {
            socket.on("ask-create-room", (roomName, callback) => {
                console.log(rooms)
                callback(newRoom(roomName, socket, io))
            })
            socket.on("ask-join-room", (roomName, callback) => {
                resetReady(roomName, io)
                console.log(rooms)
                callback(joinRoom(roomName, socket, io))
            })
            socket.on("get-room-members", (roomName, callback) => {
                callback(Array.from(io.sockets.adapter.rooms.get(roomName)))
            })
            socket.on("get-room-master", (roomName, callback) => {
                callback(rooms.get(roomName).get("info").get("master"))
            })
            socket.on("send-ready", (roomName, callback) => {
                console.log(rooms)
                console.log(roomName, " : ", rooms.get(roomName).get("members"))
                callback(setMemberReady(roomName, socket, io))
            })
            socket.on("send-game", (roomName, game, callback) => {
                changeType(roomName, game, io)
                resetReady(roomName, io)
                console.log(rooms)
                console.log(roomName, " : ", rooms.get(roomName))
                console.log("room parameters : ", rooms.get(roomName).get("info").get("params"))
                io.sockets.to(roomName).emit("game-change", game)
                callback("game-change")
            })
            socket.on("send-straw", (roomName, roomMember, strawPick, callback) => {
                pickStraw(roomName, roomMember, strawPick, io)
                console.log(rooms)
                console.log(roomName, " : ", rooms.get(roomName).get("members"))
                callback("straw-picked")
            })

            socket.on("disconnect", () => {
                let roomToDisconnect
                rooms.forEach((room, roomName) => {
                    room.get("members").forEach((vote, member) => {
                        if (member == socket.id) {
                            roomToDisconnect = roomName
                            const masterGone = (room.get("info").get("master") == socket.id)
                            room.get("members").delete(member)
                            resetReady(roomName, io)
                            if (room.get("members").size == 0) { 
                                rooms.delete(roomName)
                            } else {
                                if (masterGone) {
                                    const firstMember = [...rooms.get(roomName).get("members")][0][0]
                                    rooms.get(roomName).get("info").set("master", firstMember)
                                    io.sockets.to(roomName).emit("master-change", firstMember)
                                }
                            }
                        }
                    })
                }) 
                socket.broadcast.to(roomToDisconnect).emit("disconnected-user", socket.id)
                console.log(rooms)
            })

        })
    }
}


