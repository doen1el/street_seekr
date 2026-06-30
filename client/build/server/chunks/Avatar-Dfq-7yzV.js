import { $ as attr, a7 as attr_style, a8 as stringify } from './index-BSfLjvNP.js';

const ClientMsg = (
  /** @type {const} */
  {
    CREATE: "create",
    JOIN: "join",
    LEAVE: "leave",
    SETTINGS: "settings",
    READY: "ready",
    START: "start",
    GUESS: "guess",
    NEXT: "next",
    // host advances from the round summary
    SAY: "say",
    KICK: "kick",
    CHECK_ROOM: "check_room",
    GET_LEADERBOARD: "get_leaderboard",
    GET_STATS: "get_stats"
  }
);
const ServerMsg = (
  /** @type {const} */
  {
    CREATED: "created",
    ROOM_STATE: "room_state",
    GENERATION_PROGRESS: "generation_progress",
    ROUND_START: "round_start",
    ROUND_END: "round_end",
    // round summary: reveals locations + per-player guesses
    GAME_OVER: "game_over",
    GUESS_RESULT: "guess_result",
    CHAT: "chat",
    CHAT_HISTORY: "chat_history",
    ROOM_EXISTS: "room_exists",
    LEADERBOARD: "leaderboard",
    STATS: "stats",
    ERROR: "error"
  }
);
function initialState() {
  return {
    room: null,
    playerId: null,
    generation: null,
    round: null,
    roundResult: null,
    gameOver: null,
    chat: [],
    guessAccepted: false,
    roomCheck: null,
    leaderboard: [],
    stats: null,
    error: null
  };
}
let chatSeq = 0;
function clearedGame() {
  return {
    generation: null,
    round: null,
    roundResult: null,
    gameOver: null,
    chat: [],
    guessAccepted: false
  };
}
function chatEntry(raw) {
  return {
    id: ++chatSeq,
    kind: raw.kind,
    name: raw.name,
    text: raw.text,
    playerId: raw.playerId
  };
}
function applyServerMessage(state, msg, now = Date.now()) {
  switch (msg?.type) {
    case ServerMsg.CREATED:
      return { ...state, playerId: msg.playerId, error: null, ...clearedGame() };
    case ServerMsg.ROOM_STATE: {
      const room = msg.room ?? null;
      const next = { ...state, room };
      if (room?.status === "lobby") {
        next.round = null;
        next.roundResult = null;
        next.generation = null;
        next.gameOver = null;
        next.guessAccepted = false;
      } else if (room?.status === "playing") {
        next.gameOver = null;
      } else if (room?.status === "generating") {
        next.generation = room.generation ?? state.generation;
      }
      return next;
    }
    case ServerMsg.GENERATION_PROGRESS:
      return { ...state, generation: { found: msg.found, target: msg.target } };
    case ServerMsg.ROUND_START:
      return {
        ...state,
        generation: null,
        roundResult: null,
        gameOver: null,
        guessAccepted: false,
        round: {
          round: msg.round,
          maxRounds: msg.maxRounds,
          roundEndsAt: msg.roundEndsAt,
          serverNow: msg.serverNow ?? now,
          timeLimit: msg.timeLimit,
          pano: msg.pano
        }
      };
    case ServerMsg.ROUND_END:
      return {
        ...state,
        roundResult: {
          round: msg.round,
          location: msg.location,
          pano: msg.pano,
          guesses: msg.guesses ?? [],
          players: msg.players ?? [],
          nextInMs: msg.nextInMs ?? 0,
          nextRoundAt: now + (msg.nextInMs ?? 0),
          isLast: !!msg.isLast
        }
      };
    case ServerMsg.GAME_OVER:
      return {
        ...state,
        round: null,
        roundResult: null,
        gameOver: { winnerName: msg.winnerName ?? null, isTie: !!msg.isTie, players: msg.players ?? [] }
      };
    case ServerMsg.GUESS_RESULT:
      return { ...state, guessAccepted: !!msg.accepted };
    case ServerMsg.CHAT:
      return { ...state, chat: [...state.chat.slice(-49), chatEntry(msg)] };
    case ServerMsg.CHAT_HISTORY:
      return { ...state, chat: (msg.entries ?? []).map(chatEntry) };
    case ServerMsg.ROOM_EXISTS:
      return { ...state, roomCheck: { code: msg.code, exists: !!msg.exists } };
    case ServerMsg.LEADERBOARD:
      return { ...state, leaderboard: msg.players ?? [] };
    case ServerMsg.STATS:
      return { ...state, stats: msg.stats ?? null };
    case ServerMsg.ERROR:
      return { ...state, error: typeof msg.message === "string" ? msg.message : "Unknown error" };
    default:
      return state;
  }
}
const MAX_BACKOFF_MS = 1e4;
function remember(code) {
  return;
}
class GameSocket {
  state = initialState();
  connected = false;
  /** True while a dropped connection is being retried. */
  reconnecting = false;
  #ws = null;
  #openPromise = null;
  #pendingAck = null;
  /** Session to transparently rejoin after an unexpected drop. */
  #resume = null;
  #shouldReconnect = false;
  #attempts = 0;
  #reconnectTimer = null;
  connect() {
    return Promise.resolve();
  }
  #scheduleReconnect() {
    if (this.#reconnectTimer) return;
    this.reconnecting = true;
    const delay = Math.min(500 * 2 ** this.#attempts, MAX_BACKOFF_MS);
    this.#attempts++;
    this.#reconnectTimer = setTimeout(
      () => {
        this.#reconnectTimer = null;
        this.#ws = null;
        this.#openPromise = null;
        this.connect().catch(() => {
        });
      },
      delay
    );
  }
  #onMessage(ev) {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    if (msg.type === ServerMsg.CREATED) {
      remember(msg.code);
      this.#pendingAck?.resolve(msg.code);
      this.#pendingAck = null;
    } else if (msg.type === ServerMsg.ERROR && this.#pendingAck) {
      this.#pendingAck.reject(new Error(typeof msg.message === "string" ? msg.message : "Error"));
      this.#pendingAck = null;
    }
    if (msg.type === ServerMsg.ERROR && msg.code === "kicked") {
      this.#shouldReconnect = false;
      this.#resume = null;
      if (this.#reconnectTimer) {
        clearTimeout(this.#reconnectTimer);
        this.#reconnectTimer = null;
      }
      this.state = { ...initialState(), error: "You were removed from the room." };
      return;
    }
    this.state = applyServerMessage(this.state, msg, Date.now());
  }
  #send(data) {
    this.#ws?.send(JSON.stringify(data));
  }
  async create(profile, solo = false) {
    await this.connect();
    this.#resume = null;
    return new Promise((resolve, reject) => {
      this.#pendingAck = {
        resolve: (code) => {
          this.#resume = { code, profile };
          resolve(code);
        },
        reject
      };
      this.#send({ type: ClientMsg.CREATE, profile, solo });
    });
  }
  async join(code, profile) {
    await this.connect();
    this.#resume = { code, profile };
    return new Promise((resolve, reject) => {
      this.#pendingAck = { resolve, reject };
      this.#send({ type: ClientMsg.JOIN, code, profile });
    });
  }
  setSettings(settings) {
    this.#send({ type: ClientMsg.SETTINGS, ...settings });
  }
  setReady(ready) {
    this.#send({ type: ClientMsg.READY, ready });
  }
  start() {
    this.#send({ type: ClientMsg.START });
  }
  guess(location2) {
    this.#send({ type: ClientMsg.GUESS, location: location2 });
  }
  next() {
    this.#send({ type: ClientMsg.NEXT });
  }
  say(text) {
    this.#send({ type: ClientMsg.SAY, text });
  }
  kick(playerId) {
    this.#send({ type: ClientMsg.KICK, playerId });
  }
  async checkRoom(code) {
    await this.connect();
    this.#send({ type: ClientMsg.CHECK_ROOM, code });
  }
  async requestLeaderboard() {
    await this.connect();
    this.#send({ type: ClientMsg.GET_LEADERBOARD });
  }
  async requestStats(clientId) {
    await this.connect();
    this.#send({ type: ClientMsg.GET_STATS, clientId });
  }
  dismissError() {
    this.state = { ...this.state, error: null };
  }
  dismissGameOver() {
    this.state = { ...this.state, gameOver: null };
  }
  /** Leaves the room for good (no reconnect). */
  leave() {
    this.#shouldReconnect = false;
    this.#resume = null;
    if (this.#reconnectTimer) {
      clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }
    this.#send({ type: ClientMsg.LEAVE });
    this.state = initialState();
  }
}
const game = new GameSocket();
function Avatar($$payload, $$props) {
  let { name, style, size = 40 } = $$props;
  let url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(name || "?")}`;
  $$payload.out.push(`<img${attr("src", url)}${attr("alt", name)}${attr("width", size)}${attr("height", size)}${attr_style(`width:${stringify(size)}px;height:${stringify(size)}px`)} class="rounded-full bg-base-100"/>`);
}

export { Avatar as A, game as g };
//# sourceMappingURL=Avatar-Dfq-7yzV.js.map
