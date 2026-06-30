import { P as push, $ as attr, _ as escape_html, T as pop, a0 as ensure_array_like } from './index-BSfLjvNP.js';
import './utils-Cbcz-EQS.js';
import { p as page } from './index2-1nuKl3iD.js';
import { A as Avatar, g as game } from './Avatar-Dfq-7yzV.js';

const AVATAR_STYLES = [
  "fun-emoji",
  "adventurer",
  "bottts",
  "croodles",
  "thumbs",
  "micah",
  "notionists",
  "lorelei",
  "open-peeps",
  "pixel-art"
];
const DEFAULT_AVATAR = AVATAR_STYLES[0];
function isAvatarStyle(value) {
  return typeof value === "string" && AVATAR_STYLES.includes(value);
}
const KEY = "streetseekr:profile";
function newClientId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  }
}
class ProfileStore {
  name = "";
  avatar = DEFAULT_AVATAR;
  clientId = "";
  constructor() {
  }
  #load() {
    try {
      const raw = localStorage.getItem(KEY);
      const p = raw ? JSON.parse(raw) : null;
      this.name = typeof p?.name === "string" ? p.name : "";
      this.avatar = isAvatarStyle(p?.avatar) ? p.avatar : DEFAULT_AVATAR;
      this.clientId = typeof p?.clientId === "string" && p.clientId ? p.clientId : newClientId();
    } catch {
      this.clientId = newClientId();
    }
    this.#save();
  }
  #save() {
    return;
  }
  /** Updates the profile and persists it. */
  set(name, avatar) {
    this.name = name;
    if (avatar && isAvatarStyle(avatar)) this.avatar = avatar;
    this.#save();
  }
  /** Cycles to the next available avatar style. */
  nextAvatar() {
    const i = AVATAR_STYLES.indexOf(this.avatar);
    this.avatar = AVATAR_STYLES[(i + 1) % AVATAR_STYLES.length];
    this.#save();
  }
  /** Plain snapshot to send to the server. */
  get value() {
    return {
      name: this.name,
      avatar: this.avatar,
      clientId: this.clientId
    };
  }
}
const profile = new ProfileStore();
function Leaderboard($$payload, $$props) {
  push();
  const board = game.state.leaderboard;
  if (board.length) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(board);
    $$payload.out.push(`<div class="card w-full max-w-md bg-base-100 shadow-xl"><div class="card-body gap-2"><h2 class="card-title text-base">Leaderboard</h2> <ul class="flex flex-col divide-y divide-base-200"><!--[-->`);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let p = each_array[i];
      $$payload.out.push(`<li class="flex items-center gap-3 py-2"><span class="w-5 text-center font-mono opacity-60">${escape_html(i + 1)}</span> `);
      Avatar($$payload, { name: p.name, style: p.avatar, size: 28 });
      $$payload.out.push(`<!----> <span class="font-medium">${escape_html(p.name)}</span> <span class="ml-auto text-right text-sm"><span class="font-bold">${escape_html(p.gamesWon)}</span> wins <span class="opacity-60">· ${escape_html(p.totalScore)} pts</span></span></li>`);
    }
    $$payload.out.push(`<!--]--></ul></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function _page($$payload, $$props) {
  push();
  let name = profile.name;
  let code = (page.url.searchParams.get("join") ?? "").toUpperCase();
  let busy = false;
  const canPlay = name.trim().length > 0;
  $$payload.out.push(`<div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-base-200 p-4"><h1 class="text-3xl font-bold">StreetSeekr</h1> <div class="card w-full max-w-md bg-base-100 shadow-xl"><div class="card-body gap-4"><div class="flex items-center gap-4"><button class="shrink-0" title="Change avatar">`);
  Avatar($$payload, { name: name || "you", style: profile.avatar, size: 64 });
  $$payload.out.push(`<!----></button> <label class="form-control w-full"><span class="label-text">Your name</span> <input class="input input-bordered w-full" maxlength="20" placeholder="Pick a name"${attr("value", name)}/></label></div> <button class="btn btn-primary"${attr("disabled", !canPlay || busy, true)}>Create a room</button> <div class="divider text-xs">or join</div> <div class="join w-full"><input class="input join-item input-bordered w-full uppercase" maxlength="8" placeholder="ROOM CODE"${attr("value", code)}/> <button class="btn join-item btn-secondary"${attr("disabled", !canPlay || !code.trim() || busy, true)}>Join</button></div> `);
  if (game.state.error) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="alert alert-error py-2 text-sm">${escape_html(game.state.error)}</div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> `);
  Leaderboard($$payload);
  $$payload.out.push(`<!----></div>`);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DjcGvksz.js.map
