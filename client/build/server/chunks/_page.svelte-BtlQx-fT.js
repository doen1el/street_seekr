import { x as push, P as escape_html, T as attr, U as stringify, V as bind_props, z as pop, W as store_get, X as store_mutate, K as attr_class, Y as unsubscribe_stores, Z as fallback, _ as ensure_array_like } from './index-DOTLEX8b.js';
import { g as getLocale, t as trackMessageCall } from './runtime-Da7SMkyw.js';
import { p as pb, a as players, b as actions, j as join, c as code } from './pocketbase-CzzajoGR.js';
import { a as superForm, c as createEventDispatcher } from './helper-Ct97EdLs.js';
import './app-CVlUDIrM.js';
import { a as applyAction } from './client-Wqcy-_Io.js';
import 'pocketbase';
import './shared-server-T6x2t2MG.js';
import './utils-CnqwCm3b.js';
import 'zod';

const en_active_games = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Active Games`;
  }
);
const de_active_games = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Aktive Spiele`;
  }
);
const active_games = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("active_games", locale);
  if (locale === "en") return en_active_games();
  return de_active_games();
};
const en_name = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Name`;
  }
);
const de_name = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Name`;
  }
);
const name = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("name", locale);
  if (locale === "en") return en_name();
  return de_name();
};
const en_join_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Join Game`;
  }
);
const de_join_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel beitreten`;
  }
);
const join_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("join_game", locale);
  if (locale === "en") return en_join_game();
  return de_join_game();
};
const en_create_new_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Create New Game`;
  }
);
const de_create_new_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Neues Spiel erstellen`;
  }
);
const create_new_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("create_new_game", locale);
  if (locale === "en") return en_create_new_game();
  return de_create_new_game();
};
const en_you_are_still_in_a_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `You are still in a game.`;
  }
);
const de_you_are_still_in_a_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Du bist noch in einem Spiel.`;
  }
);
const you_are_still_in_a_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("you_are_still_in_a_game", locale);
  if (locale === "en") return en_you_are_still_in_a_game();
  return de_you_are_still_in_a_game();
};
const en_you_are_still_in_a_game_description = (
  /** @type {(inputs: { name: NonNullable<unknown> }) => string} */
  (i) => {
    return `You can rejoin your game ${i.name}`;
  }
);
const de_you_are_still_in_a_game_description = (
  /** @type {(inputs: { name: NonNullable<unknown> }) => string} */
  (i) => {
    return `Du kannst deinem Spiel ${i.name} wieder beitreten`;
  }
);
const you_are_still_in_a_game_description = /* @__NO_SIDE_EFFECTS__ */ (inputs, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("you_are_still_in_a_game_description", locale);
  if (locale === "en") return en_you_are_still_in_a_game_description(inputs);
  return de_you_are_still_in_a_game_description(inputs);
};
const en_or = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `OR`;
  }
);
const de_or = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `ODER`;
  }
);
const or = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("or", locale);
  if (locale === "en") return en_or();
  return de_or();
};
const en_status = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Status`;
  }
);
const de_status = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Status`;
  }
);
const status = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("status", locale);
  if (locale === "en") return en_status();
  return de_status();
};
function ActiveGames($$payload, $$props) {
  push();
  let effectiveUsername;
  let data = $$props["data"];
  let username = fallback($$props["username"], "");
  let joinActiveErrors = fallback($$props["joinActiveErrors"], null);
  effectiveUsername = username || data?.joinForm && data.joinForm.username || data?.createForm && data.createForm.username || "";
  if (data.games.length !== 0) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(data.games);
    $$payload.out.push(`<div class="w-full max-w-4xl"><h2 class="mb-4 text-center text-3xl font-bold">${escape_html(/* @__PURE__ */ active_games())}</h2> `);
    if (joinActiveErrors?.username) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="alert alert-error mb-4 text-sm"><span>${escape_html(joinActiveErrors.username)}</span></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (joinActiveErrors?.code) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="alert alert-error mb-4 text-sm"><span>${escape_html(joinActiveErrors.code)}</span></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="overflow-x-auto"><table class="table w-full table-zebra shadow-md"><thead><tr><th>${escape_html(/* @__PURE__ */ name())}</th><th>${escape_html(/* @__PURE__ */ status())}</th><th>${escape_html(players())}</th><th class="text-right">${escape_html(actions())}</th></tr></thead><tbody><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let game = each_array[$$index];
      $$payload.out.push(`<tr><td><div class="font-bold">${escape_html(game.name)}</div></td><td>${escape_html(game.status)}</td><td>${escape_html(game.players.length)}</td><td class="text-right"><form method="POST" action="?/joinActive" class="inline-flex items-center gap-2"><input type="hidden" name="code"${attr("value", game.code)}/> <input type="hidden" name="username"${attr("value", effectiveUsername)}/> <button type="submit" class="btn btn-sm btn-primary"${attr("disabled", !effectiveUsername, true)}>${escape_html(join())}</button></form></td></tr>`);
    }
    $$payload.out.push(`<!--]--></tbody></table></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { data, username, joinActiveErrors });
  pop();
}
function JoinCreateCard($$payload, $$props) {
  push();
  var $$store_subs;
  let data = $$props["data"];
  const dispatch = createEventDispatcher();
  let joining = false;
  let creating = false;
  let showJoinSpinner = false;
  let showCreateSpinner = false;
  let joinSpinnerTimer = null;
  let createSpinnerTimer = null;
  let joinCodeStatus = "idle";
  let joinCodeTimer = null;
  let lastToken = "";
  let isUsernameEmpty = true;
  const { form: joinForm, errors: joinErrors } = superForm(data.joinForm, {
    id: "join",
    validators: false,
    dataType: "json",
    onSubmit: () => {
      joining = true;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      joinSpinnerTimer = setTimeout(() => showJoinSpinner = true, 1e3);
    },
    onResult: ({ result }) => {
      joining = false;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      showJoinSpinner = false;
      applyAction();
    },
    onError: () => {
      joining = false;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      showJoinSpinner = false;
    }
  });
  const {
    form: createForm,
    errors: createErrors
  } = superForm(data.createForm, {
    id: "create",
    validators: false,
    dataType: "json",
    onSubmit: () => {
      creating = true;
      if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
      createSpinnerTimer = setTimeout(() => showCreateSpinner = true, 1e3);
    },
    onResult: ({ result }) => {
      creating = false;
      if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
      showCreateSpinner = false;
      applyAction();
    },
    onError: () => {
      creating = false;
      if (createSpinnerTimer) clearTimeout(createSpinnerTimer);
      showCreateSpinner = false;
    }
  });
  isUsernameEmpty = !(store_get($$store_subs ??= {}, "$createForm", createForm)?.username && store_get($$store_subs ??= {}, "$createForm", createForm).username.toString().trim().length > 0);
  {
    const raw = (store_get($$store_subs ??= {}, "$joinForm", joinForm).code ?? "").toString();
    const code2 = raw.trim().toUpperCase();
    if (raw !== code2) {
      store_mutate($$store_subs ??= {}, "$joinForm", joinForm, store_get($$store_subs ??= {}, "$joinForm", joinForm).code = code2);
    }
    if (code2.length === 6) {
      if (joinCodeTimer) clearTimeout(joinCodeTimer);
      joinCodeStatus = "checking";
      const token = lastToken = code2;
      joinCodeTimer = setTimeout(
        async () => {
          try {
            await pb.collection("games").getFirstListItem(`code="${code2}"`);
            if (lastToken !== token) return;
            joinCodeStatus = "valid";
          } catch {
            if (lastToken !== token) return;
            joinCodeStatus = "invalid";
          }
        },
        250
      );
    } else {
      if (joinCodeTimer) clearTimeout(joinCodeTimer);
      joinCodeStatus = "idle";
    }
  }
  store_mutate($$store_subs ??= {}, "$joinForm", joinForm, store_get($$store_subs ??= {}, "$joinForm", joinForm).username = store_get($$store_subs ??= {}, "$createForm", createForm).username);
  dispatch("usernameChange", store_get($$store_subs ??= {}, "$createForm", createForm).username);
  $$payload.out.push(`<div class="card w-full max-w-2xl bg-base-100 shadow-xl"><div class="card-body items-center"><div class="form-control w-full max-w-xs"><input id="username" type="text" name="username"${attr("placeholder", /* @__PURE__ */ name())}${attr_class("input-bordered input input-lg w-full max-w-xs", void 0, {
    "input-error": store_get($$store_subs ??= {}, "$createErrors", createErrors).username || store_get($$store_subs ??= {}, "$joinErrors", joinErrors).username
  })}${attr("value", store_get($$store_subs ??= {}, "$createForm", createForm).username)}/> <div class="mt-1 h-5"><span${attr_class("text-xs text-error", void 0, {
    "invisible": !store_get($$store_subs ??= {}, "$createErrors", createErrors).username && !store_get($$store_subs ??= {}, "$joinErrors", joinErrors).username
  })}>${escape_html(store_get($$store_subs ??= {}, "$createErrors", createErrors).username || store_get($$store_subs ??= {}, "$joinErrors", joinErrors).username || " ")}</span></div></div> <div class="mt-4 flex w-full flex-col gap-4 lg:flex-row lg:gap-8"><form method="POST" action="?/join" class="flex flex-1 flex-col gap-4"><input type="hidden" name="username"${attr("value", store_get($$store_subs ??= {}, "$joinForm", joinForm).username)}/> <div class="form-control w-full"><input id="join-code" type="text" name="code"${attr("placeholder", code())}${attr_class(`input-bordered input input-lg w-full tracking-widest uppercase ${stringify(joinCodeStatus === "valid" ? " input-success" : "")}`, void 0, {
    "input-error": store_get($$store_subs ??= {}, "$joinErrors", joinErrors).code || joinCodeStatus === "invalid"
  })}${attr("value", store_get($$store_subs ??= {}, "$joinForm", joinForm).code)} maxlength="6" autocapitalize="characters" autocomplete="off" spellcheck="false"/></div> <button type="submit" class="btn relative w-full btn-lg btn-primary"${attr("disabled", joining || creating || store_get($$store_subs ??= {}, "$joinForm", joinForm).code?.trim().length !== 6 || joinCodeStatus !== "valid" || isUsernameEmpty, true)}${attr("aria-busy", joining)}><span${attr_class("", void 0, { "invisible": joining })}>${escape_html(/* @__PURE__ */ join_game())}</span> `);
  if (showJoinSpinner) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="absolute inset-0 grid place-items-center"><span class="loading loading-sm loading-spinner"></span></span>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></form> <div class="divider lg:divider-horizontal">${escape_html(/* @__PURE__ */ or())}</div> <form method="POST" action="?/create" class="flex flex-1 flex-col justify-center"><input type="hidden" name="username"${attr("value", store_get($$store_subs ??= {}, "$createForm", createForm).username)}/> <button type="submit" class="btn relative mt-auto w-full btn-lg btn-secondary"${attr("disabled", creating || joining || isUsernameEmpty, true)}${attr("aria-busy", creating)}><span${attr_class("", void 0, { "invisible": creating })}>${escape_html(/* @__PURE__ */ create_new_game())}</span> `);
  if (showCreateSpinner) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="absolute inset-0 grid place-items-center"><span class="loading loading-sm loading-spinner"></span></span>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></form></div></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { data });
  pop();
}
function _page($$payload, $$props) {
  push();
  let data = $$props["data"];
  let liveUsername = data.joinForm?.data.username || "";
  let games = [...data.games];
  $$payload.out.push(`<div class="flex flex-grow flex-col items-center justify-center gap-10 bg-base-200 p-4">`);
  JoinCreateCard($$payload, { data });
  $$payload.out.push(`<!----> `);
  if (data.currentGame) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card w-full max-w-2xl bg-base-100 text-base-content shadow-xl"><div class="card-body items-center text-center"><h2 class="card-title">${escape_html(/* @__PURE__ */ you_are_still_in_a_game())}</h2> <p>${escape_html(/* @__PURE__ */ you_are_still_in_a_game_description({ name: data.currentGame.name }))}</p> <div class="card-actions justify-end"><a${attr("href", `/${stringify(data.currentGame.code)}`)} class="btn">${escape_html(/* @__PURE__ */ join_game())}</a></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  ActiveGames($$payload, { data: { ...data, games }, username: liveUsername });
  $$payload.out.push(`<!----></div>`);
  bind_props($$props, { data });
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BtlQx-fT.js.map
