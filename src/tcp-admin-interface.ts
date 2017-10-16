// imports
import * as net from "net";

export class TCPAdminInterface {

    private server: any;
    private sockets: any[] = [];

    constructor(
        private host: string,
        private port: number,
    ) {
        this.server = net.createServer((socket: any) => this.onConnect(socket));
    }

    public start(): void {
        this.server.listen(this.port, this.host);
    }

    public async sendUpdateToAllSockets(name: string, value: number): Promise<void> {
        for (const socket of this.sockets) {
            try {
                socket.write(`${name}: ${value}\r\n`);
            } catch (error) {
                this.sockets.splice(this.sockets.indexOf(socket), 1);
            }
        }
    }

    private onConnect(socket: any): void {
        this.sockets.push(socket);
    }
}
