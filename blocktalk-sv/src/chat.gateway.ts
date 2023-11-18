import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect, WsResponse, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: ['process.env.PORT', 'chrome-extension://kfomokbdjlombkhjmgjheceikfekfjkg'], credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway'); // Logger nesnesi eklendi

  rooms: { [key: string]: { count: number, messages: string[] } } = {};
  socketsToRooms = new Map();

  // A structure to store the sessions
  sessions: { [key: string]: { username: string, password: string } } = {};

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`); // Log eklendi
    this.socketsToRooms.set(client.id, "temporaryRoom");
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`); // Log eklendi
    const room = this.socketsToRooms.get(client.id);
    if (room && this.rooms[room]) {
      this.rooms[room].count--;
      if (this.rooms[room].count === 0) {
        delete this.rooms[room];
      }
    }
    this.socketsToRooms.delete(client.id);
  }

  @SubscribeMessage('login')
  handleLogin(client: Socket, payload: { username: string, password: string }): void {
    // Basic username and password check
    if (payload.username !== 'admin' || payload.password !== 'password') {
      client.emit('error', { message: 'Invalid username or password' });
      return;
    }
    
  
    // Continue with session creation
    const sessionId = Math.random().toString(36).substr(2);
    this.sessions[sessionId] = payload;
    client.emit('session', { sessionId });
  }

  @SubscribeMessage('resumeSession')
  handleResumeSession(client: Socket, payload: { sessionId: string }): void {
    if (this.sessions[payload.sessionId]) {
      client.emit('session', { sessionId: payload.sessionId });
    } else {
      client.emit('error', { message: 'Session not found' });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string): void {
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
    } else {
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
  
  @SubscribeMessage('chatToRoom')
  handleChatToRoom(client: Socket, payload: { room: string, message: string }): void {
    const room = payload.room;
    const message = payload.message;
  
    // Oda varsa mesajı o odaya gönder
    if (this.rooms[room]) {
      this.rooms[room].messages.push(message);
      this.server.to(room).emit('newMessage', { message: message });
    } else {
      // Oda yoksa yeni bir oda oluştur ve mesajı gönder
      this.rooms[room] = { count: 1, messages: [message] };
      this.socketsToRooms.set(client.id, room);
      client.join(room);
      this.server.to(room).emit('newMessage', { message: message });
    }
  }
  
  
  broadcastUserCount(room: string): void {
    if(this.server) {
      this.server.to(room).emit('updateUserCount', this.rooms[room].count);
    } else {
      this.logger.error('Server is not yet defined'); // Debug log
    }
  }
}
