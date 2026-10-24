import { io } from 'socket.io-client';
import { SocketChannel } from 'peer-data';
import { runChatPage } from '../chat/page.js';

// vite-plugin.ts runs the signaling server on the examples' dev server, on the same port, so io() reaches it.
runChatPage(new SocketChannel(io()));
