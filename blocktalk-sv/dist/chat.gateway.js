"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let ChatGateway = class ChatGateway {
    constructor() {
        this.logger = new common_1.Logger('ChatGateway');
        this.rooms = {};
        this.socketsToRooms = new Map();
        this.sessions = {};
    }
    handleConnection(client, ...args) {
        this.logger.log(`Client connected: ${client.id}`);
        this.socketsToRooms.set(client.id, "temporaryRoom");
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const room = this.socketsToRooms.get(client.id);
        if (room && this.rooms[room]) {
            this.rooms[room].count--;
            if (this.rooms[room].count === 0) {
                delete this.rooms[room];
            }
        }
        this.socketsToRooms.delete(client.id);
    }
    handleLogin(client, payload) {
        if (payload.username !== 'admin' || payload.password !== 'password') {
            client.emit('error', { message: 'Invalid username or password' });
            return;
        }
        const sessionId = Math.random().toString(36).substr(2);
        this.sessions[sessionId] = payload;
        client.emit('session', { sessionId });
    }
    handleResumeSession(client, payload) {
        if (this.sessions[payload.sessionId]) {
            client.emit('session', { sessionId: payload.sessionId });
        }
        else {
            client.emit('error', { message: 'Session not found' });
        }
    }
    handleJoinRoom(client, room) {
        const oldRoom = this.socketsToRooms.get(client.id);
        if (oldRoom && this.rooms[oldRoom]) {
            this.rooms[oldRoom].count--;
            if (this.rooms[oldRoom].count === 0) {
                delete this.rooms[oldRoom];
            }
            this.broadcastUserCount(oldRoom);
        }
        if (!this.rooms[room]) {
            this.rooms[room] = { count: 1, messages: [] };
        }
        else {
            this.rooms[room].count++;
        }
        this.socketsToRooms.set(client.id, room);
        client.leave(oldRoom);
        client.join(room);
        client.emit('updateRoom', this.rooms[room].count);
        if (this.rooms[room].messages && this.rooms[room].messages.length > 0) {
            this.rooms[room].messages.forEach((message) => {
                client.emit('newMessage', { message: message });
            });
        }
        this.broadcastUserCount(room);
    }
    handleChatToRoom(client, payload) {
        const room = payload.room;
        const message = payload.message;
        if (this.rooms[room]) {
            this.rooms[room].messages.push(message);
            this.server.to(room).emit('newMessage', { message: message });
        }
        else {
            this.rooms[room] = { count: 1, messages: [message] };
            this.socketsToRooms.set(client.id, room);
            client.join(room);
            this.server.to(room).emit('newMessage', { message: message });
        }
    }
    broadcastUserCount(room) {
        if (this.server) {
            this.server.to(room).emit('updateUserCount', this.rooms[room].count);
        }
        else {
            this.logger.error('Server is not yet defined');
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLogin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('resumeSession'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleResumeSession", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chatToRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleChatToRoom", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: ['process.env.PORT', 'chrome-extension://kfomokbdjlombkhjmgjheceikfekfjkg'], credentials: true } })
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map