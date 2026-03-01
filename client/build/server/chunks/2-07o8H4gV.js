import { z } from 'zod';
import './utils-CnqwCm3b.js';
import './client-Wqcy-_Io.js';
import { s as superValidate, z as zod, g as getOrCreatePlayer, n as name_needs_at_least_1_character } from './helper-Ct97EdLs.js';
import { k as fail, r as redirect } from './app-CVlUDIrM.js';
import crypto from 'crypto';
import { g as getLocale, t as trackMessageCall } from './runtime-Da7SMkyw.js';
import './index-DOTLEX8b.js';

let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const POOL_SIZE_MULTIPLIER = 128;
let pool, poolOffset;
let fillPool = bytes => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    crypto.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    crypto.randomFillSync(pool);
    poolOffset = 0;
  }
  poolOffset += bytes;
};
let nanoid = (size = 21) => {
  fillPool((size |= 0));
  let id = '';
  for (let i = poolOffset - size; i < poolOffset; i++) {
    id += urlAlphabet[pool[i] & 63];
  }
  return id
};

const en_code_needs_to_be_6_characters = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Code needs to be 6 characters long.`;
  }
);
const de_code_needs_to_be_6_characters = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Der Code muss 6 Zeichen lang sein.`;
  }
);
const code_needs_to_be_6_characters = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("code_needs_to_be_6_characters", locale);
  if (locale === "en") return en_code_needs_to_be_6_characters();
  return de_code_needs_to_be_6_characters();
};
const en_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Game`;
  }
);
const de_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel`;
  }
);
const game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("game", locale);
  if (locale === "en") return en_game();
  return de_game();
};
const joinGameSchema = z.object({
  username: z.string().min(1, name_needs_at_least_1_character()).max(30),
  code: z.string().length(6, /* @__PURE__ */ code_needs_to_be_6_characters())
});
const createGameSchema = z.object({
  username: z.string().min(1, name_needs_at_least_1_character()).max(30)
});
const joinActiveGameSchema = z.object({
  username: z.string().min(1, name_needs_at_least_1_character()).max(30),
  code: z.string().length(6, /* @__PURE__ */ code_needs_to_be_6_characters())
});
const load = async ({ locals, cookies }) => {
  let playerUsername = "";
  let currentGame = null;
  const playerId = cookies.get("player_id");
  if (playerId) {
    try {
      const player = await locals.pb.collection("players").getFirstListItem(`id="${playerId}"`);
      playerUsername = player.username;
      if (player.current_game) {
        try {
          currentGame = await locals.pb.collection("games").getFirstListItem(`id = "${player.current_game}"`);
        } catch (gameError) {
          console.warn(
            `Could not find active game ${player.current_game} for player ${player.id}. Clearing it.`
          );
          await locals.pb.collection("players").update(player.id, { current_game: null });
        }
      }
    } catch (_) {
      console.warn("Player id is invalid or player not found.");
      cookies.delete("player_id", { path: "/" });
    }
  }
  const validationOptions = { errors: false };
  const joinForm = await superValidate(
    { username: playerUsername },
    zod(joinGameSchema),
    validationOptions
  );
  const createForm = await superValidate(
    { username: playerUsername },
    zod(createGameSchema),
    validationOptions
  );
  const joinActiveForm = await superValidate(
    { username: playerUsername },
    zod(joinActiveGameSchema),
    validationOptions
  );
  const games = await locals.pb.collection("games").getFullList({
    sort: "-created",
    filter: 'status = "lobby" && private = false'
  });
  return { joinForm, createForm, joinActiveForm, games, currentGame };
};
const actions = {
  join: async ({ request, locals, cookies }) => {
    const form = await superValidate(request, zod(joinGameSchema));
    if (!form.valid) {
      return fail(400, { form });
    }
    const player = await getOrCreatePlayer(locals, cookies, form.data.username);
    let game2;
    try {
      game2 = await locals.pb.collection("games").getFirstListItem(`code="${form.data.code}"`);
    } catch (err) {
      console.error(err);
      return fail(404, { form });
    }
    await cleanupPlayerOtherGames(locals, player.id, game2.id);
    if (!game2.players?.includes(player.id)) {
      try {
        await locals.pb.collection("games").update(game2.id, { "players+": player.id });
      } catch (e) {
        console.error("Failed to add player to game", e);
        return fail(500, { form });
      }
    }
    await locals.pb.collection("players").update(player.id, {
      current_game: game2.id
    });
    throw redirect(303, `/${game2.code}`);
  },
  create: async ({ request, locals, cookies }) => {
    const form = await superValidate(request, zod(createGameSchema));
    if (!form.valid) return fail(400, { form });
    const player = await getOrCreatePlayer(locals, cookies, form.data.username);
    let newGame;
    try {
      newGame = await locals.pb.collection("games").create({
        name: `${form.data.username}'s ${/* @__PURE__ */ game()}`,
        players: [player.id],
        code: nanoid(6).replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
        admin: player.id,
        currentRound: 0,
        graceDistance: 10,
        fallOfRate: 400,
        density: 50,
        maxRounds: 3,
        timeLimit: 180,
        status: "lobby",
        maxPoints: 5e3,
        private: true
      });
      await cleanupPlayerOtherGames(locals, player.id, newGame.id);
      await locals.pb.collection("players").update(player.id, {
        current_game: newGame.id
      });
    } catch (err) {
      console.error(err);
      return fail(500, { form });
    }
    throw redirect(303, `/${newGame.code}`);
  },
  joinActive: async ({ request, locals, cookies }) => {
    const form = await superValidate(request, zod(joinActiveGameSchema));
    if (!form.valid) return fail(400, { form });
    const player = await getOrCreatePlayer(locals, cookies, form.data.username);
    let game2;
    try {
      game2 = await locals.pb.collection("games").getFirstListItem(`code="${form.data.code}"`);
    } catch (err) {
      console.error(err);
      return fail(404, { form });
    }
    await cleanupPlayerOtherGames(locals, player.id, game2.id);
    if (!game2.players?.includes(player.id)) {
      try {
        await locals.pb.collection("games").update(game2.id, { "players+": player.id });
      } catch {
        const newPlayers = [...game2.players || [], player.id];
        await locals.pb.collection("games").update(game2.id, { players: newPlayers });
      }
    }
    await locals.pb.collection("players").update(player.id, {
      current_game: game2.id
    });
    throw redirect(303, `/${game2.code}`);
  }
};
async function cleanupPlayerOtherGames(locals, playerId, keepGameId) {
  try {
    const otherGames = await locals.pb.collection("games").getFullList({
      filter: `players ?~ "${playerId}" && id != "${keepGameId}"`
    });
    for (const g of otherGames) {
      const newPlayers = (g.players || []).filter((id) => id !== playerId);
      const newReady = (g.ready_players || []).filter((id) => id !== playerId);
      if (g.admin === playerId) {
        if (newPlayers.length > 0) {
          const newAdminId = newPlayers[Math.floor(Math.random() * newPlayers.length)];
          await locals.pb.collection("games").update(g.id, {
            players: newPlayers,
            ready_players: newReady,
            admin: newAdminId
          });
        } else {
          try {
            await locals.pb.collection("games").delete(g.id);
          } catch {
          }
        }
      } else {
        await locals.pb.collection("games").update(g.id, {
          players: newPlayers,
          ready_players: newReady
        });
      }
    }
    const oldGuesses = await locals.pb.collection("guesses").getFullList({
      filter: `player="${playerId}" && game != "${keepGameId}"`
    });
    for (const gu of oldGuesses) {
      try {
        await locals.pb.collection("guesses").delete(gu.id);
      } catch {
      }
    }
    try {
      const oldMessages = await locals.pb.collection("messages").getFullList({
        filter: `player="${playerId}" && game != "${keepGameId}"`
      });
      for (const msg of oldMessages) {
        try {
          await locals.pb.collection("messages").delete(msg.id);
        } catch {
        }
      }
    } catch {
    }
  } catch (e) {
    console.warn("[cleanupPlayerOtherGames] failed", e);
  }
}

var _page_server_ts = /*#__PURE__*/Object.freeze({
  __proto__: null,
  actions: actions,
  load: load
});

const index = 2;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-BtlQx-fT.js')).default;
const server_id = "src/routes/+page.server.ts";
const imports = ["_app/immutable/nodes/2.unrMXyCA.js","_app/immutable/chunks/3l5szf1F.js","_app/immutable/chunks/D1rX8njY.js","_app/immutable/chunks/KO1hsnFR.js","_app/immutable/chunks/B5tPeL39.js","_app/immutable/chunks/UuI-7IYh.js","_app/immutable/chunks/Dp2bBzRa.js","_app/immutable/chunks/D3dmPIq3.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, _page_server_ts as server, server_id, stylesheets };
//# sourceMappingURL=2-07o8H4gV.js.map
