import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private logger;
    rooms: {
        [key: string]: {
            count: number;
            messages: string[];
        };
    };
    socketsToRooms: Map<any, any>;
    sessions: {
        [key: string]: {
            username: string;
            password: string;
        };
    };
    handleConnection(client: Socket, ...args: any[]): void;
    handleDisconnect(client: Socket): void;
    handleLogin(client: Socket, payload: {
        username: string;
        password: string;
    }): void;
    handleResumeSession(client: Socket, payload: {
        sessionId: string;
    }): void;
    handleJoinRoom(client: Socket, room: string): void;
    handleChatToRoom(client: Socket, payload: {
        room: string;
        message: string;
    }): void;
    broadcastUserCount(room: string): void;
}
