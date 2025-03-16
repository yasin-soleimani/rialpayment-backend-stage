import { WebSocketGateway, WebSocketServer, SubscribeMessage, WsResponse } from '@vision/websockets';
import { Client, Server } from 'socket.io';
import { Observable, from } from 'rxjs';

@WebSocketGateway(5555)
export class SocketGatewayService {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('pos')
  createRoom(client: Client, data: string): Observable<any> {
    console.log(client.id, 'client');
    return from(data);
  }

  @SubscribeMessage('xxx')
  async Emt(client: Client, data: string) {
    console.log(data, 'data');
  }
}
