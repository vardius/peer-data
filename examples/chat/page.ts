import type { Signaling } from 'peer-data';
import { joinChat } from './chat.js';

/** Runs the chat page: the log, the form, and the peer count, over the given signaling. */
export function runChatPage(signaling: Signaling): void {
  const log = document.querySelector<HTMLUListElement>('#log');
  const status = document.querySelector<HTMLParagraphElement>('#status');
  const form = document.querySelector<HTMLFormElement>('#form');
  const input = document.querySelector<HTMLInputElement>('#text');
  if (!log || !status || !form || !input) throw new Error('chat page markup is missing');

  const name = `Guest ${String(Math.floor(Math.random() * 1000))}`;
  const show = (text: string): void => {
    const item = document.createElement('li');
    item.textContent = text;
    log.append(item);
    log.scrollTop = log.scrollHeight;
  };

  const chat = joinChat(signaling, name, {
    line: ({ from, text }) => {
      show(`${from}: ${text}`);
    },
    peers: (count) => {
      status.textContent = `You are ${name}, connected to ${String(count)} ${count === 1 ? 'peer' : 'peers'}.`;
    },
  });
  status.textContent = `You are ${name}. Waiting for someone to join.`;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (text === '') return;
    chat.say(text);
    show(`${name}: ${text}`);
    input.value = '';
  });
  window.addEventListener('pagehide', chat.leave);
  // A page restored from the back-forward cache has left the chat: join afresh.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) location.reload();
  });
}
