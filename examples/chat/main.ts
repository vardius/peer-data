import { BroadcastChannelSignaling } from 'peer-data';
import { runChatPage } from './page.js';

runChatPage(new BroadcastChannelSignaling('peer-data-chat'));
