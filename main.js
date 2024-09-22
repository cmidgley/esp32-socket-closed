import { Socket, Listener } from 'socket';

let serverClientSocket = null;
const server = new Listener({ port: 9932 });
server.callback = function (srvMsg) {
	trace('<info>Server: ' + srvMsg + '\n');
    switch (srvMsg) {
        case Socket.connected:
            let socket = new Socket({ listener: this });
			trace('<info>Server: Client connected\n');

			socket.callback = function (message) {
				switch (message) {
                    case Socket.disconnected:
                        trace('<warn>Server: Client disconnected\n');
                        break;
                    case Socket.connected:
                        trace('<info>Server: Client connected\n');
						break;
                    case Socket.writable: {
                        trace('<info>Server: socket writable\n');
                        break;
                    }
                    case Socket.readable: {
                        trace('<info>Server: socket readable\n');
                        break;
                    }
                    case Socket.error:
                        trace('<error>Server: socket error\n');
                        break;
					default:
						trace('<error>Server: default case\n');
                }
            };
			serverClientSocket = socket;
			socket.write('Message: client connect received\n');

			break;
    }
};

const client = new Socket({ host: 'localhost', port: 9932 });
client.callback = function (message) {
	try {
		switch (message) {
			case Socket.connected:
				trace('<info>Client: connected\n');
				break;
			case Socket.writable:
				trace('<info>Client: Writable\n');
				break;
			case Socket.readable: {
				trace('<info>Client: Readable; force closing server socket\n');
				// if you do not read the pending data, the disconnect event never arrives.  Is this
				// a bug?
				trace(this.read(String)); 
				// force close the server-side socket.  
				serverClientSocket.close();
				break;
			}
			case Socket.disconnected:
				trace('<warn>Client: Client disconnected\n');
				serverClientSocket.write('Write on socket after it has closed\n');
				break;
			case Socket.error:
				trace('<error>Client socket error\n');
				break;
			default:
				trace('<error>Client: default case\n');
				break;
		}
	} catch (e) {
		trace('<error>Client: catch-all caught the invalid write\n');
	}
};
