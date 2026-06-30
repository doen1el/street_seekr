import { P as push, _ as escape_html, $ as attr, T as pop, a0 as ensure_array_like, W as attr_class, X as sanitize_props, Y as spread_props, Z as slot } from './index-BSfLjvNP.js';
import './utils-Cbcz-EQS.js';
import { p as page } from './index2-1nuKl3iD.js';
import { g as game, A as Avatar } from './Avatar-Dfq-7yzV.js';
import { I as Icon } from './Icon-joSgIOqI.js';

function Check($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.539.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [["path", { "d": "M20 6 9 17l-5-5" }]];
  Icon($$payload, spread_props([
    { name: "check" },
    $$sanitized_props,
    {
      /**
       * @component @name Check
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgNiA5IDE3bC01LTUiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/check
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Chevrons_right_left($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.539.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "m20 17-5-5 5-5" }],
    ["path", { "d": "m4 17 5-5-5-5" }]
  ];
  Icon($$payload, spread_props([
    { name: "chevrons-right-left" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronsRightLeft
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjAgMTctNS01IDUtNSIgLz4KICA8cGF0aCBkPSJtNCAxNyA1LTUtNS01IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevrons-right-left
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Lobby($$payload, $$props) {
  push();
  const room = game.state.room;
  const players = room.players;
  const me = players.find((p) => p.id === game.state.playerId);
  const isHost = !!me?.isHost;
  const allReady = players.length > 0 && players.every((p) => p.ready);
  let areaText = "";
  let resolvingArea = false;
  let chatText = "";
  const each_array = ensure_array_like([
    ["maxRounds", "Rounds"],
    ["timeLimit", "Time / round (s)"],
    ["maxPoints", "Max points"],
    ["graceDistance", "Grace (km)"],
    ["fallOfRate", "Falloff (km)"]
  ]);
  const each_array_1 = ensure_array_like(players);
  const each_array_2 = ensure_array_like(game.state.chat);
  $$payload.out.push(`<div class="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_320px]"><div class="flex flex-col gap-4"><div class="card bg-base-100 shadow-xl"><div class="card-body gap-3"><h2 class="card-title">Settings</h2> <div class="grid grid-cols-2 gap-3 sm:grid-cols-3"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [field, label] = each_array[$$index];
    $$payload.out.push(`<label class="form-control"><span class="label-text text-xs">${escape_html(label)}</span> <input class="input input-sm input-bordered w-full" type="number"${attr("disabled", !isHost, true)}${attr("value", room.settings[field])}/></label>`);
  }
  $$payload.out.push(`<!--]--></div></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body gap-3"><h2 class="card-title">Area</h2> <p class="text-sm opacity-70">${escape_html(room.settings.polygon ? `Restricted to: ${(room.settings.locationStrings ?? []).join(", ") || "custom area"}` : "Global — anywhere with coverage.")}</p> `);
  if (isHost) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="join w-full"><input class="input join-item input-sm input-bordered w-full" placeholder="e.g. Paris, Lyon"${attr("value", areaText)}/> <button class="btn join-item btn-sm btn-primary"${attr("disabled", resolvingArea, true)}>${escape_html("Apply")}</button> <button class="btn join-item btn-sm"${attr("disabled", resolvingArea, true)}>Global</button></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body gap-2"><h2 class="card-title">Players (${escape_html(players.length)})</h2> <ul class="flex flex-col divide-y divide-base-200"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let p = each_array_1[$$index_1];
    $$payload.out.push(`<li class="flex items-center gap-3 py-2">`);
    Avatar($$payload, { name: p.name, style: p.avatar, size: 36 });
    $$payload.out.push(`<!----> <span${attr_class("font-medium", void 0, { "opacity-50": !p.connected })}>${escape_html(p.name)}</span> `);
    if (p.isHost) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="badge badge-sm badge-primary">host</span>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (!p.connected) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="badge badge-ghost badge-sm">offline</span>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <span class="ml-auto flex items-center gap-2">`);
    if (p.isHost || p.ready) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="badge badge-success badge-sm">ready</span>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<span class="badge badge-ghost badge-sm">not ready</span>`);
    }
    $$payload.out.push(`<!--]--> `);
    if (isHost && !p.isHost) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button class="btn btn-ghost btn-xs">kick</button>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></span></li>`);
  }
  $$payload.out.push(`<!--]--></ul></div></div></div> <div class="flex flex-col gap-4"><div class="card flex-1 bg-base-100 shadow-xl"><div class="card-body gap-2"><h2 class="card-title text-base">Chat</h2> <div class="flex h-48 flex-col gap-1 overflow-y-auto text-sm lg:h-72">`);
  if (each_array_2.length !== 0) {
    $$payload.out.push("<!--[-->");
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let c = each_array_2[$$index_2];
      $$payload.out.push(`<div><span class="font-semibold">${escape_html(c.name)}:</span> ${escape_html(c.text)}</div>`);
    }
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="opacity-50">No messages yet.</div>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="join"><input class="input join-item input-sm input-bordered w-full" placeholder="Say something…"${attr("value", chatText)}/> <button class="btn join-item btn-sm">Send</button></div></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body gap-2">`);
  if (isHost) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button class="btn btn-primary"${attr("disabled", !allReady, true)}>Start game</button> `);
    if (!allReady) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="text-center text-xs opacity-60">Waiting for players to ready up.</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<button${attr_class("btn", void 0, { "btn-success": me?.ready })}>${escape_html(me?.ready ? "Ready ✓ (tap to unready)" : "I'm ready")}</button>`);
  }
  $$payload.out.push(`<!--]--> <button class="btn btn-ghost btn-sm">Leave room</button></div></div></div></div>`);
  pop();
}
function GameView($$payload, $$props) {
  push();
  const round = game.state.round;
  const pano = round.pano;
  const endpoint = pano.viewerBaseUrl.endsWith("/api") ? pano.viewerBaseUrl : `${pano.viewerBaseUrl}/api`;
  const players = game.state.room?.players ?? [];
  players.filter((p) => p.hasGuessed).length;
  let mapBig = false;
  let now = Date.now();
  let offset = 0;
  const remaining = Math.max(0, Math.ceil((round.roundEndsAt - (now + offset)) / 1e3));
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  $$payload.out.push(`<div class="fixed inset-0 overflow-hidden"><!---->`);
  {
    $$payload.out.push(`<pnx-photo-viewer${attr("endpoint", endpoint)}${attr("picture", pano.id)}${attr("sequence", pano.collectionId)} nav="seq" focus="pic" widgets="false" style="display:block;width:100%;height:100%"></pnx-photo-viewer>`);
  }
  $$payload.out.push(`<!----> <div class="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-base-200/80 p-3 shadow-lg backdrop-blur-sm"><div class="flex flex-col items-center"><div class="text-xs font-semibold uppercase opacity-70">Round</div> <div class="font-mono text-xl font-bold">${escape_html(round.round)}/${escape_html(round.maxRounds)}</div></div> <div class="h-10 w-px bg-base-content/20"></div> <div class="flex flex-col items-center"><div class="text-xs font-semibold uppercase opacity-70">Time</div> <div${attr_class("font-mono text-xl font-bold", void 0, { "text-error": remaining <= 10 })}>${escape_html(mm)}:${escape_html(ss)}</div></div></div> <div${attr_class("absolute top-4 right-4 z-10 flex flex-col rounded-lg bg-base-200/80 shadow-2xl transition-all duration-300", void 0, {
    "w-[300px]": !mapBig,
    "h-[220px]": !mapBig,
    "w-[55vw]": mapBig,
    "h-[60vh]": mapBig
  })}><div class="relative h-0 flex-grow"><div class="h-full w-full rounded-t-lg"></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <div class="flex items-center justify-between rounded-b-lg p-2"><button class="btn btn-square btn-ghost btn-sm" title="Resize">`);
  Chevrons_right_left($$payload, { class: "size-4" });
  $$payload.out.push(`<!----></button> <button class="btn btn-sm btn-primary"${attr("disabled", true, true)}>`);
  Check($$payload, { class: "size-4" });
  $$payload.out.push(`<!----> Guess</button></div></div></div>`);
  pop();
}
function RoundSummary($$payload, $$props) {
  push();
  const result = game.state.roundResult;
  const me = game.state.room?.players.find((p) => p.id === game.state.playerId);
  const isHost = !!me?.isHost;
  const ranked = [...result.players].sort((a, b) => b.totalPoints - a.totalPoints);
  new Map(result.players.map((p) => [p.id, p]));
  let now = Date.now();
  const countdown = Math.max(0, Math.ceil((result.nextRoundAt - now) / 1e3));
  const each_array = ensure_array_like(ranked);
  $$payload.out.push(`<div class="mx-auto grid w-full max-w-5xl gap-4 p-4 lg:grid-cols-[1fr_320px]"><div class="card overflow-hidden bg-base-100 shadow-xl"><div class="h-[340px] w-full lg:h-[480px]"></div></div> <div class="flex flex-col gap-4"><div class="card bg-base-100 shadow-xl"><div class="card-body gap-2"><h2 class="card-title">Round ${escape_html(result.round)} results</h2> <ul class="flex flex-col divide-y divide-base-200"><!--[-->`);
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let p = each_array[i];
    $$payload.out.push(`<li class="flex items-center gap-2 py-2"><span class="w-5 text-center font-mono opacity-60">${escape_html(i + 1)}</span> `);
    Avatar($$payload, { name: p.name, style: p.avatar, size: 32 });
    $$payload.out.push(`<!----> <span class="font-medium">${escape_html(p.name)}</span> <span class="ml-auto text-right"><span class="badge badge-sm badge-success">+${escape_html(p.lastRoundPoints)}</span> <span class="ml-1 font-mono font-bold">${escape_html(p.totalPoints)}</span></span></li>`);
  }
  $$payload.out.push(`<!--]--></ul></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body gap-2">`);
  if (isHost) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button class="btn btn-primary">${escape_html(result.isLast ? "Final results" : "Next round")}</button>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<p class="text-center text-sm opacity-70">${escape_html(result.isLast ? "Final results" : "Next round")} in ${escape_html(countdown)}s…</p>`);
  }
  $$payload.out.push(`<!--]--></div></div></div></div>`);
  pop();
}
function GameOver($$payload, $$props) {
  push();
  const over = game.state.gameOver;
  const ranked = [...over.players].sort((a, b) => b.totalPoints - a.totalPoints);
  const each_array = ensure_array_like(ranked);
  $$payload.out.push(`<div class="fixed inset-0 z-50 grid place-items-center bg-base-300/70 p-4 backdrop-blur-sm"><div class="card w-full max-w-md bg-base-100 shadow-2xl"><div class="card-body items-center gap-3 text-center"><h2 class="text-2xl font-bold">Game over</h2> <p class="text-lg">`);
  if (over.isTie) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`It's a tie!`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (over.winnerName) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`🏆 <span class="font-bold">${escape_html(over.winnerName)}</span> wins!`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`No winner this time.`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></p> <ul class="w-full"><!--[-->`);
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let p = each_array[i];
    $$payload.out.push(`<li class="flex items-center gap-3 border-b border-base-200 py-2 last:border-0"><span class="w-5 text-center font-mono opacity-60">${escape_html(i + 1)}</span> `);
    Avatar($$payload, { name: p.name, style: p.avatar, size: 32 });
    $$payload.out.push(`<!----> <span class="font-medium">${escape_html(p.name)}</span> <span class="ml-auto font-mono font-bold">${escape_html(p.totalPoints)}</span></li>`);
  }
  $$payload.out.push(`<!--]--></ul> <button class="btn mt-2 btn-primary">Back to lobby</button></div></div></div>`);
  pop();
}
function _page($$payload, $$props) {
  push();
  (page.params.code ?? "").toUpperCase();
  const room = game.state.room;
  const gen = room?.generation ?? game.state.generation;
  if (game.state.gameOver) {
    $$payload.out.push("<!--[-->");
    GameOver($$payload);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (game.reconnecting) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="alert alert-warning fixed top-2 left-1/2 z-50 w-auto -translate-x-1/2 py-1 text-sm shadow">Reconnecting…</div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (!room) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="grid min-h-screen place-items-center bg-base-200"><span class="loading loading-lg loading-spinner"></span></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (room.status === "generating") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="grid min-h-screen place-items-center bg-base-200"><div class="card bg-base-100 p-8 text-center shadow-xl"><h2 class="text-xl font-bold">Building the challenge…</h2> <p class="mt-2 opacity-70">Found ${escape_html(gen?.found ?? 0)} / ${escape_html(gen?.target ?? room.maxRounds)} locations</p> <progress class="progress progress-primary mt-4 w-64"${attr("value", gen?.found ?? 0)}${attr("max", gen?.target ?? room.maxRounds)}></progress></div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (room.status === "playing" && game.state.round) {
        $$payload.out.push("<!--[-->");
        GameView($$payload);
      } else {
        $$payload.out.push("<!--[!-->");
        if (room.status === "summary" && game.state.roundResult) {
          $$payload.out.push("<!--[-->");
          RoundSummary($$payload);
        } else {
          $$payload.out.push("<!--[!-->");
          Lobby($$payload);
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--> `);
  if (game.state.error && room) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="toast toast-end z-50"><div class="alert alert-error"><span>${escape_html(game.state.error)}</span> <button class="btn btn-ghost btn-xs">✕</button></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-CQD6hrmA.js.map
