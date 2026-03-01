import { x as push, W as store_get, X as store_mutate, P as escape_html, K as attr_class, T as attr, Y as unsubscribe_stores, V as bind_props, z as pop, Z as fallback, _ as ensure_array_like, U as stringify, M as sanitize_props, N as spread_props, O as slot } from './index-DOTLEX8b.js';
import { i as invalidateAll } from './client-Wqcy-_Io.js';
import { a as superForm, o as onDestroy, t as tick } from './helper-Ct97EdLs.js';
import './app-CVlUDIrM.js';
import { p as pb, a as players, b as actions, c as code, j as join } from './pocketbase-CzzajoGR.js';
import { g as getLocale, t as trackMessageCall } from './runtime-Da7SMkyw.js';
import { I as Icon } from './Icon-BIGHbT-I.js';
import './utils-CnqwCm3b.js';
import { p as public_env } from './shared-server-T6x2t2MG.js';
import { b as back_to_main_menu } from './back_to_main_menu-Cu8TjLAC.js';
import 'zod';
import 'pocketbase';

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
function Circle_check_big($$payload, $$props) {
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
    ["path", { "d": "M21.801 10A10 10 0 1 1 17 3.335" }],
    ["path", { "d": "m9 11 3 3L22 4" }]
  ];
  Icon($$payload, spread_props([
    { name: "circle-check-big" },
    $$sanitized_props,
    {
      /**
       * @component @name CircleCheckBig
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEuODAxIDEwQTEwIDEwIDAgMSAxIDE3IDMuMzM1IiAvPgogIDxwYXRoIGQ9Im05IDExIDMgM0wyMiA0IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/circle-check-big
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
function Hourglass($$payload, $$props) {
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
    ["path", { "d": "M5 22h14" }],
    ["path", { "d": "M5 2h14" }],
    [
      "path",
      {
        "d": "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"
      }
    ],
    [
      "path",
      {
        "d": "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "hourglass" },
    $$sanitized_props,
    {
      /**
       * @component @name Hourglass
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNNSAyMmgxNCIgLz4KICA8cGF0aCBkPSJNNSAyaDE0IiAvPgogIDxwYXRoIGQ9Ik0xNyAyMnYtNC4xNzJhMiAyIDAgMCAwLS41ODYtMS40MTRMMTIgMTJsLTQuNDE0IDQuNDE0QTIgMiAwIDAgMCA3IDE3LjgyOFYyMiIgLz4KICA8cGF0aCBkPSJNNyAydjQuMTcyYTIgMiAwIDAgMCAuNTg2IDEuNDE0TDEyIDEybDQuNDE0LTQuNDE0QTIgMiAwIDAgMCAxNyA2LjE3MlYyIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/hourglass
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
const en_close = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Close`;
  }
);
const de_close = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Schließen`;
  }
);
const close = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("close", locale);
  if (locale === "en") return en_close();
  return de_close();
};
const en_game_settings = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Game Settings`;
  }
);
const de_game_settings = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel Einstellungen`;
  }
);
const game_settings = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("game_settings", locale);
  if (locale === "en") return en_game_settings();
  return de_game_settings();
};
const en_rounds = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Rounds`;
  }
);
const de_rounds = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Runden`;
  }
);
const rounds = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("rounds", locale);
  if (locale === "en") return en_rounds();
  return de_rounds();
};
const en_time_per_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Time per Round (Sec.)`;
  }
);
const de_time_per_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Zeit pro Runde (Sek.)`;
  }
);
const time_per_round = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("time_per_round", locale);
  if (locale === "en") return en_time_per_round();
  return de_time_per_round();
};
const en_grace_distance = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Tolerance (Kilometers)`;
  }
);
const de_grace_distance = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Toleranz (Kilometer)`;
  }
);
const grace_distance = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("grace_distance", locale);
  if (locale === "en") return en_grace_distance();
  return de_grace_distance();
};
const en_fall_of_rate = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Fall-off Rate (Kilometers)`;
  }
);
const de_fall_of_rate = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Abfallrate (Kilometer)`;
  }
);
const fall_of_rate = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("fall_of_rate", locale);
  if (locale === "en") return en_fall_of_rate();
  return de_fall_of_rate();
};
const en_private_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Private Game`;
  }
);
const de_private_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Privates Spiel`;
  }
);
const private_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("private_game", locale);
  if (locale === "en") return en_private_game();
  return de_private_game();
};
const en_list_of_areas = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `List of Areas`;
  }
);
const de_list_of_areas = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Liste an Bereichen`;
  }
);
const list_of_areas = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("list_of_areas", locale);
  if (locale === "en") return en_list_of_areas();
  return de_list_of_areas();
};
const en_join_game_name = (
  /** @type {(inputs: { name: NonNullable<unknown> }) => string} */
  (i) => {
    return `Join ${i.name}`;
  }
);
const de_join_game_name = (
  /** @type {(inputs: { name: NonNullable<unknown> }) => string} */
  (i) => {
    return `${i.name} beitreten`;
  }
);
const join_game_name = /* @__NO_SIDE_EFFECTS__ */ (inputs, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("join_game_name", locale);
  if (locale === "en") return en_join_game_name(inputs);
  return de_join_game_name(inputs);
};
const en_game_summary = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Game Summary`;
  }
);
const de_game_summary = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel Zusammenfassung`;
  }
);
const game_summary = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("game_summary", locale);
  if (locale === "en") return en_game_summary();
  return de_game_summary();
};
const en_total = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Total`;
  }
);
const de_total = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Gesamt`;
  }
);
const total = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("total", locale);
  if (locale === "en") return en_total();
  return de_total();
};
const en_click_on_map = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Click on the Map`;
  }
);
const de_click_on_map = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Klicke auf die Karte`;
  }
);
const click_on_map = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("click_on_map", locale);
  if (locale === "en") return en_click_on_map();
  return de_click_on_map();
};
const en_start_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Start Game`;
  }
);
const de_start_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel starten`;
  }
);
const start_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("start_game", locale);
  if (locale === "en") return en_start_game();
  return de_start_game();
};
const en_waiting_for_players = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Waiting for Players...`;
  }
);
const de_waiting_for_players = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Warte auf Spieler...`;
  }
);
const waiting_for_players = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("waiting_for_players", locale);
  if (locale === "en") return en_waiting_for_players();
  return de_waiting_for_players();
};
const en_waint_until_all_players_are_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Wait until all players are ready`;
  }
);
const de_waint_until_all_players_are_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Warte bis alle Spieler bereit sind`;
  }
);
const waint_until_all_players_are_ready = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("waint_until_all_players_are_ready", locale);
  if (locale === "en") return en_waint_until_all_players_are_ready();
  return de_waint_until_all_players_are_ready();
};
const en_not_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Not Ready`;
  }
);
const de_not_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Nicht bereit`;
  }
);
const not_ready = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("not_ready", locale);
  if (locale === "en") return en_not_ready();
  return de_not_ready();
};
const en_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Ready`;
  }
);
const de_ready = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Bereit`;
  }
);
const ready = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("ready", locale);
  if (locale === "en") return en_ready();
  return de_ready();
};
const en_leave_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Leave Game`;
  }
);
const de_leave_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spiel verlassen`;
  }
);
const leave_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("leave_game", locale);
  if (locale === "en") return en_leave_game();
  return de_leave_game();
};
const en_leave_game_admin_confirmation = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Are you sure? Since you are the admin, another player will be appointed as the new admin. If you are the last player, the game will be deleted.`;
  }
);
const de_leave_game_admin_confirmation = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Bist du sicher? Da du der Admin bist, wird ein anderer Spieler zum neuen Admin ernannt. Wenn du der letzte Spieler bist, wird das Spiel gelöscht.`;
  }
);
const leave_game_admin_confirmation = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("leave_game_admin_confirmation", locale);
  if (locale === "en") return en_leave_game_admin_confirmation();
  return de_leave_game_admin_confirmation();
};
const en_leave_game_confirmation = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Are you sure you want to leave the game?`;
  }
);
const de_leave_game_confirmation = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Bist du sicher, dass du das Spiel verlassen möchtest?`;
  }
);
const leave_game_confirmation = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("leave_game_confirmation", locale);
  if (locale === "en") return en_leave_game_confirmation();
  return de_leave_game_confirmation();
};
const en_abort = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Abort`;
  }
);
const de_abort = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Abbrechen`;
  }
);
const abort = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("abort", locale);
  if (locale === "en") return en_abort();
  return de_abort();
};
const en_yes_leave = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Yes, Leave`;
  }
);
const de_yes_leave = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Ja, verlassen`;
  }
);
const yes_leave = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("yes_leave", locale);
  if (locale === "en") return en_yes_leave();
  return de_yes_leave();
};
const en_chat = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Chat`;
  }
);
const de_chat = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Chat`;
  }
);
const chat = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("chat", locale);
  if (locale === "en") return en_chat();
  return de_chat();
};
const en_no_messages_yet = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `No Messages Yet`;
  }
);
const de_no_messages_yet = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Noch keine Nachrichten`;
  }
);
const no_messages_yet = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("no_messages_yet", locale);
  if (locale === "en") return en_no_messages_yet();
  return de_no_messages_yet();
};
const en_send = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Send`;
  }
);
const de_send = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Senden`;
  }
);
const send = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("send", locale);
  if (locale === "en") return en_send();
  return de_send();
};
const en_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Round`;
  }
);
const de_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Runde`;
  }
);
const round = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("round", locale);
  if (locale === "en") return en_round();
  return de_round();
};
const en_time = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Time`;
  }
);
const de_time = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Zeit`;
  }
);
const time = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("time", locale);
  if (locale === "en") return en_time();
  return de_time();
};
const en_increase = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Increase`;
  }
);
const de_increase = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Vergrößern`;
  }
);
const increase = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("increase", locale);
  if (locale === "en") return en_increase();
  return de_increase();
};
const en_guess = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Guess`;
  }
);
const de_guess = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Raten`;
  }
);
const guess = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("guess", locale);
  if (locale === "en") return en_guess();
  return de_guess();
};
const en_admin = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Admin`;
  }
);
const de_admin = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Admin`;
  }
);
const admin = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("admin", locale);
  if (locale === "en") return en_admin();
  return de_admin();
};
const en_waiting = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Waiting`;
  }
);
const de_waiting = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Warten`;
  }
);
const waiting = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("waiting", locale);
  if (locale === "en") return en_waiting();
  return de_waiting();
};
const en_winner_of_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Winner of Round`;
  }
);
const de_winner_of_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Gewinner der Runde`;
  }
);
const winner_of_round = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("winner_of_round", locale);
  if (locale === "en") return en_winner_of_round();
  return de_winner_of_round();
};
const en_winner_of_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Winner of Game`;
  }
);
const de_winner_of_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Gewinner des Spiels`;
  }
);
const winner_of_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("winner_of_game", locale);
  if (locale === "en") return en_winner_of_game();
  return de_winner_of_game();
};
const en_leaderboard = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Leaderboard`;
  }
);
const de_leaderboard = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Rangliste`;
  }
);
const leaderboard = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("leaderboard", locale);
  if (locale === "en") return en_leaderboard();
  return de_leaderboard();
};
const en_distance = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Distance`;
  }
);
const de_distance = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Distanz`;
  }
);
const distance = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("distance", locale);
  if (locale === "en") return en_distance();
  return de_distance();
};
const en_points_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Round Points`;
  }
);
const de_points_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Rundenpunkte`;
  }
);
const points_round = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("points_round", locale);
  if (locale === "en") return en_points_round();
  return de_points_round();
};
const en_total_points = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Total Points`;
  }
);
const de_total_points = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Gesamtpunkte`;
  }
);
const total_points = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("total_points", locale);
  if (locale === "en") return en_total_points();
  return de_total_points();
};
const en_no_guess = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `No Guess`;
  }
);
const de_no_guess = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Kein Tipp`;
  }
);
const no_guess = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("no_guess", locale);
  if (locale === "en") return en_no_guess();
  return de_no_guess();
};
const en_back_to_lobby = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Back to Lobby`;
  }
);
const de_back_to_lobby = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Zurück zur Lobby`;
  }
);
const back_to_lobby = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("back_to_lobby", locale);
  if (locale === "en") return en_back_to_lobby();
  return de_back_to_lobby();
};
const en_next_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Next Round`;
  }
);
const de_next_round = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Nächste Runde`;
  }
);
const next_round = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("next_round", locale);
  if (locale === "en") return en_next_round();
  return de_next_round();
};
const en_please_enter_name_to_join = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Please enter your name to join the game.`;
  }
);
const de_please_enter_name_to_join = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Bitte gib deinen Namen ein, um dem Spiel beizutreten.`;
  }
);
const please_enter_name_to_join = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("please_enter_name_to_join", locale);
  if (locale === "en") return en_please_enter_name_to_join();
  return de_please_enter_name_to_join();
};
const en_creating_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Creating Game...`;
  }
);
const de_creating_game = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Erstelle Spiel...`;
  }
);
const creating_game = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("creating_game", locale);
  if (locale === "en") return en_creating_game();
  return de_creating_game();
};
const en_unknown_game_status = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Unknown Game Status`;
  }
);
const de_unknown_game_status = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Unbekannter Spielstatus`;
  }
);
const unknown_game_status = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("unknown_game_status", locale);
  if (locale === "en") return en_unknown_game_status();
  return de_unknown_game_status();
};
const en_list_of_areas_description = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Restricts the game to the specified areas (comma-separated) or draw a polygon on the map.`;
  }
);
const de_list_of_areas_description = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Beschränkt das Spiel auf die angegebenen Bereiche (mit Komma trennen) oder zeichne ein Polygon auf der Karte.`;
  }
);
const list_of_areas_description = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("list_of_areas_description", locale);
  if (locale === "en") return en_list_of_areas_description();
  return de_list_of_areas_description();
};
const en_player = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Player`;
  }
);
const de_player = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spieler`;
  }
);
const player = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("player", locale);
  if (locale === "en") return en_player();
  return de_player();
};
const en_points = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Points`;
  }
);
const de_points = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Punkte`;
  }
);
const points = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("points", locale);
  if (locale === "en") return en_points();
  return de_points();
};
const en_maxpoints1 = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Max Points`;
  }
);
const de_maxpoints1 = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Maximale Punkte`;
  }
);
const maxpoints1 = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("maxpoints1", locale);
  if (locale === "en") return en_maxpoints1();
  return de_maxpoints1();
};
const en_only_admin_edits = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Only the admin can edit these settings.`;
  }
);
const de_only_admin_edits = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Nur der Admin kann diese Einstellungen bearbeiten.`;
  }
);
const only_admin_edits = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("only_admin_edits", locale);
  if (locale === "en") return en_only_admin_edits();
  return de_only_admin_edits();
};
const en_please_wait = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Please wait...`;
  }
);
const de_please_wait = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Bitte warten...`;
  }
);
const please_wait = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("please_wait", locale);
  if (locale === "en") return en_please_wait();
  return de_please_wait();
};
const en_list_of_areas_placeholder = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `e.g. America, California, Los Angeles`;
  }
);
const de_list_of_areas_placeholder = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `z.B. Deutschland, Nordrhein-Westfalen, Köln`;
  }
);
const list_of_areas_placeholder = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("list_of_areas_placeholder", locale);
  if (locale === "en") return en_list_of_areas_placeholder();
  return de_list_of_areas_placeholder();
};
const en_still_guessing = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Still guessing`;
  }
);
const de_still_guessing = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Ratet noch`;
  }
);
const still_guessing = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("still_guessing", locale);
  if (locale === "en") return en_still_guessing();
  return de_still_guessing();
};
function Playerlist($$payload, $$props) {
  push();
  let players$1 = fallback($$props["players"], () => [], true);
  let readyPlayers = fallback($$props["readyPlayers"], () => [], true);
  let adminId = $$props["adminId"];
  let isAdmin = fallback($$props["isAdmin"], false);
  let onKick = fallback($$props["onKick"], () => {
  });
  const each_array = ensure_array_like(players$1);
  $$payload.out.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="mb-4 card-title">${escape_html(players())} (${escape_html(players$1.length)})</h2> <ul class="space-y-2"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let player2 = each_array[$$index];
    const isReady = readyPlayers.some((p) => p.id === player2.id);
    $$payload.out.push(`<li class="flex items-center justify-between rounded-lg bg-base-200 p-2"><span class="flex items-center gap-3 font-semibold"><div class="avatar"><div class="w-10 rounded-full"><img${attr("src", `https://api.dicebear.com/9.x/miniavs/svg?seed=${stringify(player2.username)}`)} alt="Avatar"/></div></div> ${escape_html(player2.username)} `);
    if (adminId === player2.id) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="badge text-xs badge-primary">${escape_html(/* @__PURE__ */ admin())}</span>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></span> <div class="flex items-center gap-2">`);
    if (isReady) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="badge badge-info">`);
      Circle_check_big($$payload, { size: "15" });
      $$payload.out.push(`<!----> ${escape_html(/* @__PURE__ */ ready())}</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="badge badge-warning">`);
      Hourglass($$payload, { size: "15" });
      $$payload.out.push(`<!----> ${escape_html(/* @__PURE__ */ waiting())}</div>`);
    }
    $$payload.out.push(`<!--]--> `);
    if (isAdmin && player2.id !== adminId) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button class="btn btn-xs btn-error" title="Kick">X</button>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></li>`);
  }
  $$payload.out.push(`<!--]--></ul></div></div>`);
  bind_props($$props, { players: players$1, readyPlayers, adminId, isAdmin, onKick });
  pop();
}
function GameSettings($$payload, $$props) {
  push();
  let game = $$props["game"];
  let isAdmin = $$props["isAdmin"];
  let onUpdate = $$props["onUpdate"];
  let onPolygonUpdate = $$props["onPolygonUpdate"];
  let previewMap;
  let drawnItems;
  let locationInput = game.locationStrings?.join(", ") || "";
  game.polygon ? JSON.stringify(game.polygon) : null;
  if (!isAdmin) {
    const joined = (game.locationStrings || []).join(", ");
    if (joined !== locationInput) {
      locationInput = joined;
    }
    game.polygon ? JSON.stringify(game.polygon) : null;
  }
  if (isAdmin && previewMap && drawnItems) {
    game.polygon ? JSON.stringify(game.polygon) : null;
  }
  $$payload.out.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">${escape_html(/* @__PURE__ */ game_settings())}</h2> <div class="grid grid-cols-1 items-start gap-x-6 gap-y-4 md:grid-cols-2"><div class="form-control min-h-24"><label class="label min-h-12 items-end" for="max-rounds"><span class="label-text text-sm break-words">${escape_html(/* @__PURE__ */ rounds())}</span></label> <input type="number" id="max-rounds" class="input-bordered input w-full"${attr("value", game.maxRounds)}${attr("disabled", !isAdmin, true)} min="1" max="50"/></div> <div class="form-control min-h-24"><label class="label min-h-12 items-end" for="time-limit"><span class="label-text text-sm break-words">${escape_html(/* @__PURE__ */ time_per_round())}</span></label> <input type="number" id="time-limit" class="input-bordered input w-full"${attr("value", game.timeLimit)}${attr("disabled", !isAdmin, true)} min="0" step="10"/></div> <div class="form-control min-h-24"><label class="label min-h-12 items-end" for="max-points"><span class="label-text text-sm break-words">${escape_html(/* @__PURE__ */ maxpoints1())}</span></label> <input type="number" id="max-points" class="input-bordered input w-full"${attr("value", game.maxPoints)}${attr("disabled", !isAdmin, true)} min="1"/></div> <div class="form-control min-h-24"><label class="label min-h-12 items-end" for="grace-distance"><span class="label-text text-sm break-words">${escape_html(/* @__PURE__ */ grace_distance())}</span></label> <input type="number" id="grace-distance" class="input-bordered input w-full"${attr("value", game.graceDistance)}${attr("disabled", !isAdmin, true)} min="1" max="1000"/></div> <div class="form-control min-h-24"><label class="label min-h-12 items-end" for="fall-off-rate"><span class="label-text text-sm break-words">${escape_html(/* @__PURE__ */ fall_of_rate())}</span></label> <input type="number" id="fall-off-rate" class="input-bordered input w-full"${attr("value", game.fallOfRate)}${attr("disabled", !isAdmin, true)} min="1" max="1000"/></div> <div class="form-control justify-center md:col-span-2 md:justify-end"><label class="label cursor-pointer" for="private-lobby-toggle"><span class="label-text mr-4">${escape_html(/* @__PURE__ */ private_game())}</span> <input id="private-lobby-toggle" type="checkbox" class="toggle toggle-primary"${attr("checked", game.private, true)}${attr("disabled", !isAdmin, true)}/></label></div> <div class="col-span-full"><label class="label" for="location-strings"><span class="label-text">${escape_html(/* @__PURE__ */ list_of_areas())}</span></label> <input type="text" id="location-strings" class="input-bordered input w-full"${attr("value", locationInput)}${attr("placeholder", /* @__PURE__ */ list_of_areas_placeholder())}${attr("disabled", !isAdmin, true)}/> <small class="text-xs text-base-content/60">${escape_html(/* @__PURE__ */ list_of_areas_description())}</small></div> <div class="relative col-span-full"><div class="relative col-span-full"><div${attr_class("h-64 overflow-hidden rounded-lg transition", void 0, {
    "grayscale": !isAdmin,
    "opacity-60": !isAdmin,
    "pointer-events-none": !isAdmin
  })}></div> `);
  if (!isAdmin) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="pointer-events-none absolute inset-0 flex items-center justify-center"><span class="badge text-xs badge-neutral">${escape_html(only_admin_edits?.() || "Admin only")}</span></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div></div></div></div>`);
  bind_props($$props, { game, isAdmin, onUpdate, onPolygonUpdate });
  pop();
}
function LobbyActions($$payload, $$props) {
  push();
  let isAdmin = $$props["isAdmin"];
  let allPlayersReady = $$props["allPlayersReady"];
  let isCurrentPlayerReady = $$props["isCurrentPlayerReady"];
  let starting = false;
  let toggling = false;
  let leaving = false;
  $$payload.out.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">${escape_html(actions())}</h2> <div class="card-actions flex-col gap-2">`);
  if (isAdmin) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<form method="POST" action="?/startGame" class="w-full"><button type="submit" class="btn relative w-full btn-primary"${attr("disabled", !allPlayersReady || starting || toggling || leaving, true)}${attr("aria-busy", starting)}><span${attr_class("", void 0, { "invisible": starting })}>${escape_html(/* @__PURE__ */ start_game())}</span> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></button></form> `);
    if (!allPlayersReady) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<p class="text-center text-xs text-base-content/60">${escape_html(/* @__PURE__ */ waint_until_all_players_are_ready())}</p>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<form method="POST" action="?/toggleReady" class="w-full"><button type="submit"${attr_class("btn relative w-full", void 0, {
      "btn-primary": !isCurrentPlayerReady,
      "btn-secondary": isCurrentPlayerReady
    })}${attr("disabled", leaving, true)}${attr("aria-busy", toggling)}><span${attr_class("", void 0, { "invisible": toggling })}>`);
    if (isCurrentPlayerReady) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`${escape_html(/* @__PURE__ */ not_ready())}`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`${escape_html(/* @__PURE__ */ ready())}`);
    }
    $$payload.out.push(`<!--]--></span> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></button></form>`);
  }
  $$payload.out.push(`<!--]--> <button class="btn w-full btn-outline btn-error">${escape_html(/* @__PURE__ */ leave_game())}</button></div></div></div> <dialog id="leave_game_modal" class="modal"><div class="modal-box"><h3 class="text-lg font-bold">${escape_html(/* @__PURE__ */ leave_game())}</h3> `);
  if (isAdmin) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="py-4">${escape_html(/* @__PURE__ */ leave_game_admin_confirmation())}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<p class="py-4">${escape_html(/* @__PURE__ */ leave_game_confirmation())}</p>`);
  }
  $$payload.out.push(`<!--]--> <div class="modal-action"><form method="POST" action="?/leaveGame"><button class="btn relative btn-error" type="submit"${attr("disabled", leaving, true)}${attr("aria-busy", leaving)}><span${attr_class("", void 0, { "invisible": leaving })}>${escape_html(/* @__PURE__ */ yes_leave())}</span> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></form> <form method="dialog"><button class="btn">${escape_html(/* @__PURE__ */ abort())}</button></form></div></div> <form method="dialog" class="modal-backdrop"><button>${escape_html(/* @__PURE__ */ close())}</button></form></dialog>`);
  bind_props($$props, { isAdmin, allPlayersReady, isCurrentPlayerReady });
  pop();
}
function LobbyChat($$payload, $$props) {
  push();
  let messages = fallback($$props["messages"], () => [], true);
  let currentPlayer = $$props["currentPlayer"];
  let onSendMessage = $$props["onSendMessage"];
  let newMessage = "";
  let sending = false;
  async function scrollToBottom() {
    await tick();
  }
  if (messages) scrollToBottom();
  $$payload.out.push(`<div class="card h-full min-h-96 bg-base-100 shadow-xl"><div class="card-body flex flex-col"><h2 class="card-title">${escape_html(/* @__PURE__ */ chat())}</h2> <div class="flex-grow space-y-2 overflow-y-auto rounded-lg bg-base-200 p-2">`);
  if (messages.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(messages);
    $$payload.out.push(`<!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let message = each_array[$$index];
      const author = message.expand?.player;
      if (author) {
        $$payload.out.push("<!--[-->");
        const isOwnMessage = author.id === currentPlayer?.id;
        $$payload.out.push(`<div${attr_class("chat", void 0, { "chat-start": !isOwnMessage, "chat-end": isOwnMessage })}><div class="avatar chat-image"><div class="w-10 rounded-full"><img alt="Avatar"${attr("src", `https://api.dicebear.com/9.x/miniavs/svg?seed=${stringify(author.username)}`)}/></div></div> <div class="chat-header mb-1 text-xs opacity-50">${escape_html(author.username)}</div> <div${attr_class("chat-bubble", void 0, { "chat-bubble-primary": isOwnMessage })}>${escape_html(message.message)}</div></div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="grid h-full place-items-center text-center text-sm text-base-content/50">${escape_html(/* @__PURE__ */ no_messages_yet())}</div>`);
  }
  $$payload.out.push(`<!--]--></div> <form class="mt-4 flex gap-2"><input type="text"${attr("value", newMessage)} placeholder="Message..." class="input-bordered input w-full"${attr("disabled", sending, true)}${attr("aria-busy", sending)}/> <button type="submit" class="btn relative btn-primary"${attr("disabled", newMessage.trim().length === 0 || sending, true)}${attr("aria-busy", sending)}><span${attr_class("", void 0, { "invisible": sending })}>${escape_html(/* @__PURE__ */ send())}</span> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></form></div></div>`);
  bind_props($$props, { messages, currentPlayer, onSendMessage });
  pop();
}
function Lobby($$payload, $$props) {
  push();
  let game = $$props["game"];
  let players2 = fallback($$props["players"], () => [], true);
  let messages = fallback($$props["messages"], () => [], true);
  let isAdmin = fallback($$props["isAdmin"], false);
  let readyPlayers = fallback($$props["readyPlayers"], () => [], true);
  let allPlayersReady = fallback($$props["allPlayersReady"], false);
  let isCurrentPlayerReady = fallback($$props["isCurrentPlayerReady"], false);
  let currentPlayer = fallback($$props["currentPlayer"], null);
  let onSendMessage = fallback($$props["onSendMessage"], (message) => Promise.resolve());
  let onUpdateSettings = fallback($$props["onUpdateSettings"], () => {
  });
  let onUpdatePolygon = fallback($$props["onUpdatePolygon"], (locationString) => Promise.resolve(null));
  let onKickPlayer = fallback($$props["onKickPlayer"], () => {
  });
  $$payload.out.push(`<div class="min-h-screen bg-base-200 p-4 lg:p-8"><div class="mx-auto max-w-7xl"><div class="mb-2 flex items-center gap-2"><h1 class="text-4xl font-bold">${escape_html(game.name)}</h1> <div class="relative"><button class="rounded-md bg-base-300 btn font-mono mt-1">${escape_html(code())}: ${escape_html(game.code)}</button> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <p class="mb-6 text-base-content/70">${escape_html(/* @__PURE__ */ waiting_for_players())}</p> <div class="grid grid-cols-1 gap-6 lg:grid-cols-3"><div class="flex flex-col gap-6 lg:col-span-2">`);
  Playerlist($$payload, {
    players: players2,
    readyPlayers,
    adminId: game.admin,
    isAdmin,
    onKick: onKickPlayer
  });
  $$payload.out.push(`<!----> `);
  GameSettings($$payload, {
    game,
    isAdmin,
    onUpdate: onUpdateSettings,
    onPolygonUpdate: onUpdatePolygon
  });
  $$payload.out.push(`<!----></div> <div class="flex flex-col gap-6">`);
  LobbyChat($$payload, { messages, currentPlayer, onSendMessage });
  $$payload.out.push(`<!----> `);
  LobbyActions($$payload, { isAdmin, allPlayersReady, isCurrentPlayerReady });
  $$payload.out.push(`<!----></div></div></div></div>`);
  bind_props($$props, {
    game,
    players: players2,
    messages,
    isAdmin,
    readyPlayers,
    allPlayersReady,
    isCurrentPlayerReady,
    currentPlayer,
    onSendMessage,
    onUpdateSettings,
    onUpdatePolygon,
    onKickPlayer
  });
  pop();
}
function GuessMap($$payload, $$props) {
  push();
  let disabled = fallback($$props["disabled"], false);
  let username = $$props["username"];
  function invalidateMapSize() {
  }
  $$payload.out.push(`<div class="relative w-full h-full"><div class="w-full h-full bg-base-200"></div> `);
  if (!disabled) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="absolute top-2 left-1/2 -translate-x-1/2 bg-base-100/80 p-2 rounded-lg shadow-lg pointer-events-none z-[1000]"><p class="text-sm font-semibold">${escape_html(/* @__PURE__ */ click_on_map())}</p></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { disabled, username, invalidateMapSize });
  pop();
}
function MakeGuess($$payload, $$props) {
  push();
  let pictureId, sequenceId, viewerBase, viewerSrc, minutes, seconds;
  let imageId = $$props["imageId"];
  let currentRound = $$props["currentRound"];
  let totalRounds = $$props["totalRounds"];
  let roundDuration = $$props["roundDuration"];
  let remainingSeconds = $$props["remainingSeconds"];
  let username = $$props["username"];
  let mapSize = "small";
  let guessMade = false;
  let timeLeft = remainingSeconds ?? roundDuration;
  let timer;
  const configuredViewerBases = (public_env.PUBLIC_PANORAMAX_VIEWER_URLS || public_env.PUBLIC_PANORAMAX_VIEWER_URL || "https://panoramax.ign.fr").split(",").map((url) => url.trim().replace(/\/$/, "")).filter(Boolean);
  const defaultViewerBase = configuredViewerBases[0] || "https://panoramax.ign.fr";
  onDestroy(() => {
    clearInterval(timer);
  });
  pictureId = typeof imageId === "string" ? imageId : imageId?.id;
  sequenceId = typeof imageId === "string" ? void 0 : imageId?.sequenceId;
  viewerBase = typeof imageId === "string" ? defaultViewerBase : imageId?.viewerBaseUrl || defaultViewerBase;
  viewerSrc = (() => {
    if (!pictureId) return `${viewerBase}/`;
    const params = new URLSearchParams({ focus: "pic", nav: "seq", pic: pictureId });
    if (sequenceId) params.set("seq", sequenceId);
    return `${viewerBase}/?${params.toString()}`;
  })();
  if (remainingSeconds != null && !guessMade) {
    timeLeft = remainingSeconds;
  }
  minutes = Math.floor(timeLeft / 60);
  seconds = timeLeft % 60;
  $$payload.out.push(`<div class="fixed inset-0 mt-15 overflow-hidden" style="height: 100dvh; width: 100dvw;"><iframe${attr("src", viewerSrc)} title="Panoramax Viewer" class="h-full w-full border-0" allow="fullscreen" loading="eager"></iframe> <div class="absolute top-4 left-4 z-10 flex items-center gap-4 rounded-lg bg-base-200/80 p-3 shadow-lg backdrop-blur-sm"><div class="flex flex-col items-center"><div class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">${escape_html(/* @__PURE__ */ round())}</div> <div class="font-mono text-xl font-bold">${escape_html(currentRound)}/${escape_html(totalRounds)}</div></div> <div class="h-10 w-px bg-base-content/20"></div> <div class="flex flex-col items-center"><div class="text-xs font-semibold tracking-wider text-base-content/70 uppercase">${escape_html(/* @__PURE__ */ time())}</div> <div class="font-mono text-xl font-bold">${escape_html(String(minutes).padStart(2, "0"))}:${escape_html(String(seconds).padStart(2, "0"))}</div></div></div> <div${attr_class("absolute top-4 right-4 z-10 flex flex-col rounded-lg bg-base-200/80 shadow-2xl transition-all duration-300 ease-in-out", void 0, {
    "w-[300px]": mapSize === "small",
    "h-[220px]": mapSize === "small",
    "w-[50vw]": mapSize === "large",
    "h-[50vh]": mapSize === "large"
  })}><div class="h-0 flex-grow">`);
  GuessMap($$payload, { username, disabled: guessMade });
  $$payload.out.push(`<!----></div> <div class="flex items-center justify-between rounded-b-lg bg-base-200/80 p-2 backdrop-blur-sm"><button class="btn btn-square btn-ghost btn-sm"${attr("title", /* @__PURE__ */ increase())}>`);
  Chevrons_right_left($$payload, { class: "size-4" });
  $$payload.out.push(`<!----></button> <button class="btn relative font-bold btn-sm btn-primary"${attr("disabled", true, true)}${attr("aria-busy", guessMade)}><span${attr_class("inline-flex items-center gap-1", void 0, { "invisible": guessMade })}>`);
  Check($$payload, { class: "size-4" });
  $$payload.out.push(`<!----> ${escape_html(/* @__PURE__ */ guess())}</span> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></div></div></div>`);
  bind_props($$props, {
    imageId,
    currentRound,
    totalRounds,
    roundDuration,
    remainingSeconds,
    username
  });
  pop();
}
function GameSummary($$payload, $$props) {
  push();
  let gameId = $$props["gameId"];
  let players2 = fallback($$props["players"], () => [], true);
  let rounds2 = fallback($$props["rounds"], 0);
  let refreshKey = fallback($$props["refreshKey"], "");
  let allGuesses = [];
  let loading = true;
  let summaryData = [];
  let fetchDebounce = null;
  let isFetching = false;
  let hasLoadedOnce = false;
  let lastTriggeredKey = "";
  onDestroy(() => {
    if (fetchDebounce) clearTimeout(fetchDebounce);
  });
  async function fetchAllGuesses(source = "init") {
    if (isFetching) return;
    isFetching = true;
    try {
      const list = await pb.collection("guesses").getFullList({
        filter: `game="${gameId}"`,
        sort: "round,updated",
        expand: "player",
        requestKey: "gameSummaryGuesses"
      });
      allGuesses = list;
      hasLoadedOnce = true;
      loading = false;
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg.includes("autocancelled") || msg.includes("aborted")) ;
      else {
        if (!hasLoadedOnce) {
          loading = false;
        }
      }
    } finally {
      isFetching = false;
    }
  }
  function computeSummary() {
    summaryData = players2.map((player2) => {
      const playerGuessesRaw = allGuesses.filter((g) => g.player === player2.id || g.expand?.player?.id === player2.id);
      const byRound = /* @__PURE__ */ new Map();
      for (const g of playerGuessesRaw) {
        const roundIndexRaw = typeof g.round === "string" ? parseInt(g.round, 10) : g.round;
        const roundIndex = (roundIndexRaw || 0) - 1;
        if (roundIndex < 0 || roundIndex >= rounds2) continue;
        const existing = byRound.get(roundIndex);
        if (!existing || new Date(g.updated) > new Date(existing.updated)) {
          byRound.set(roundIndex, g);
        }
      }
      const roundScores = Array.from({ length: rounds2 }, () => 0);
      for (const [rIndex, g] of byRound.entries()) {
        roundScores[rIndex] = Number(g.points ?? g.totalPoints ?? g.score ?? 0);
      }
      const totalPoints = roundScores.reduce((a, b) => a + b, 0);
      return { player: player2, roundScores, totalPoints };
    });
    summaryData.sort((a, b) => b.totalPoints - a.totalPoints);
  }
  if (!loading) {
    computeSummary();
  }
  if (refreshKey && refreshKey !== lastTriggeredKey) {
    lastTriggeredKey = refreshKey;
    if (fetchDebounce) clearTimeout(fetchDebounce);
    fetchDebounce = setTimeout(() => fetchAllGuesses("refresh"), 80);
  }
  $$payload.out.push(`<div class="card bg-base-100 shadow-xl ml-5 mr-6"><div class="card-body"><h2 class="card-title self-center">${escape_html(/* @__PURE__ */ game_summary())}</h2> `);
  if (loading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="flex justify-center my-8"><span class="loading loading-spinner loading-lg"></span></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    const each_array = ensure_array_like(Array(rounds2));
    const each_array_1 = ensure_array_like(summaryData);
    $$payload.out.push(`<div class="overflow-x-auto"><table class="table"><thead><tr><th>${escape_html(/* @__PURE__ */ player())}</th><!--[-->`);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      each_array[i];
      $$payload.out.push(`<th>${escape_html(/* @__PURE__ */ round())} ${escape_html(i + 1)}</th>`);
    }
    $$payload.out.push(`<!--]--><th>${escape_html(/* @__PURE__ */ total())}</th></tr></thead><tbody><!--[-->`);
    for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
      let data = each_array_1[i];
      const each_array_2 = ensure_array_like(data.roundScores);
      $$payload.out.push(`<tr class="hover"><td class="flex items-center gap-3"><span class="w-4 font-bold">${escape_html(i + 1)}.</span> <div class="avatar"><div class="mask h-8 w-8 mask-squircle"><img${attr("src", `https://api.dicebear.com/9.x/miniavs/svg?seed=${stringify(data.player.username)}`)} alt="Avatar"/></div></div> ${escape_html(data.player.username)}</td><!--[-->`);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let score = each_array_2[$$index_1];
        $$payload.out.push(`<td class="text-center">${escape_html(score)}</td>`);
      }
      $$payload.out.push(`<!--]--><td class="font-bold text-center">${escape_html(data.totalPoints)}</td></tr>`);
    }
    $$payload.out.push(`<!--]--></tbody></table></div>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  bind_props($$props, { gameId, players: players2, rounds: rounds2, refreshKey });
  pop();
}
function Summary($$payload, $$props) {
  push();
  let correctLatLng, perPlayerRoundPoints, playersWithGuesses, roundWinner, sortedPlayers;
  let players2 = fallback($$props["players"], () => [], true);
  let guesses = fallback($$props["guesses"], () => [], true);
  let correctLocation = $$props["correctLocation"];
  let isAdmin = fallback($$props["isAdmin"], false);
  let allPlayersFinished = fallback($$props["allPlayersFinished"], false);
  let isFinalRound = fallback($$props["isFinalRound"], false);
  let game = $$props["game"];
  const onKick = () => {
  };
  let submittingNextRound = false;
  let leavingGame = false;
  function toLatLngArray(pos) {
    if (!pos) return null;
    if (Array.isArray(pos) && pos.length >= 2) {
      return [Number(pos[0]), Number(pos[1])];
    }
    if (typeof pos === "object") {
      if ("lat" in pos && "lng" in pos) {
        const latVal = typeof pos.lat === "function" ? pos.lat() : pos.lat;
        const lngVal = typeof pos.lng === "function" ? pos.lng() : pos.lng;
        return [Number(latVal), Number(lngVal)];
      }
    }
    if (typeof pos === "string") {
      try {
        const parsed = JSON.parse(pos);
        return toLatLngArray(parsed);
      } catch {
        return null;
      }
    }
    return null;
  }
  function calculateDistance(lat1, lon1, lat2, lon2) {
    lat1 = Number(lat1);
    lon1 = Number(lon1);
    lat2 = Number(lat2);
    lon2 = Number(lon2);
    const R = 6371e3;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  function toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  correctLatLng = toLatLngArray(correctLocation);
  perPlayerRoundPoints = (() => {
    const map = /* @__PURE__ */ new Map();
    for (const g of guesses) {
      const pid = g.player || g.expand?.player?.id;
      if (!pid) continue;
      map.set(pid, Number(g.points || 0));
    }
    return map;
  })();
  playersWithGuesses = players2.map((p) => {
    const guess2 = guesses.find((g) => g.player === p.id || g.expand?.player?.id === p.id);
    let guessCoords = toLatLngArray(guess2?.location);
    let distanceKm = null;
    if (guessCoords && correctLatLng) {
      const distanceMeters = calculateDistance(guessCoords[0], guessCoords[1], correctLatLng[0], correctLatLng[1]);
      distanceKm = Math.round(distanceMeters / 1e3 * 10) / 10;
    }
    return {
      ...p,
      guessLocation: guessCoords,
      points: perPlayerRoundPoints.get(p.id) ?? guess2?.points ?? p.lastRoundPoints ?? 0,
      distance: distanceKm,
      __guessId: guess2?.id,
      __guessSrc: guess2?.__src
    };
  });
  roundWinner = [...players2].map((p) => ({
    ...p,
    __roundPts: perPlayerRoundPoints.get(p.id) ?? p.lastRoundPoints ?? 0
  })).sort((a, b) => b.__roundPts - a.__roundPts)[0] || players2[0];
  sortedPlayers = [...players2].sort((a, b) => b.totalPoints - a.totalPoints);
  JSON.stringify({
    correctLatLng,
    playersWithGuesses: playersWithGuesses.map((p) => ({ id: p.id, guessLocation: p.guessLocation }))
  });
  const each_array = ensure_array_like(sortedPlayers);
  $$payload.out.push(`<div class="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3"><div class="card h-[60vh] bg-base-100 shadow-xl lg:col-span-2 lg:h-auto"><div class="h-full w-full rounded-2xl"></div></div> <div class="flex flex-col gap-6"><div class="card bg-base-100 text-center shadow-xl"><div class="card-body"><h2 class="card-title self-center">`);
  if (game.status === "summary" && (allPlayersFinished || isFinalRound)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`${escape_html(isFinalRound ? /* @__PURE__ */ winner_of_game() : /* @__PURE__ */ winner_of_round())}`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`${escape_html(waiting_for_players?.() || "Waiting for other players...")}`);
  }
  $$payload.out.push(`<!--]--></h2> `);
  if (game.status === "summary" && (allPlayersFinished || isFinalRound)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="avatar my-2 justify-center"><div class="w-24 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100"><img${attr("src", `https://api.dicebear.com/9.x/miniavs/svg?seed=${stringify(roundWinner.username)}`)} alt="Avatar"/></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (game.status === "summary" && (allPlayersFinished || isFinalRound)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="text-2xl font-bold">${escape_html(roundWinner.username)}</p> <p class="text-lg text-primary">${escape_html(roundWinner.lastRoundPoints)} ${escape_html(/* @__PURE__ */ points())}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="mb-4 card-title self-center">${escape_html(/* @__PURE__ */ leaderboard())}</h2> <div class="overflow-x-auto"><table class="table"><thead><tr><th>${escape_html(/* @__PURE__ */ player())}</th><th>${escape_html(/* @__PURE__ */ distance())}</th><th>${escape_html(/* @__PURE__ */ points_round())}</th><th>${escape_html(/* @__PURE__ */ total_points())}</th></tr></thead><tbody><!--[-->`);
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    let player2 = each_array[i];
    $$payload.out.push(`<tr class="hover"><td class="flex items-center gap-3"><span class="w-4 font-bold">${escape_html(i + 1)}.</span> <div class="avatar"><div class="mask h-10 w-10 mask-squircle"><img${attr("src", `https://api.dicebear.com/9.x/miniavs/svg?seed=${stringify(player2.username)}`)} alt="Avatar"/></div></div> ${escape_html(player2.username)}</td><td>`);
    if (playersWithGuesses.find((p) => p.id === player2.id)?.distance !== null) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`${escape_html(playersWithGuesses.find((p) => p.id === player2.id)?.distance)} km`);
    } else {
      $$payload.out.push("<!--[!-->");
      if (game.status === "summary" && (allPlayersFinished || isFinalRound)) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<span class="text-error">${escape_html(/* @__PURE__ */ no_guess())}</span>`);
      } else {
        $$payload.out.push("<!--[!-->");
        $$payload.out.push(`<span class="italic opacity-70">${escape_html(/* @__PURE__ */ still_guessing())}</span>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]--></td><td class="font-semibold text-info">+${escape_html(playersWithGuesses.find((p) => p.id === player2.id)?.points || 0)}</td><td class="font-bold">${escape_html(player2.totalPoints)}</td></tr>`);
  }
  $$payload.out.push(`<!--]--></tbody></table></div></div></div> `);
  if (isAdmin) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body flex-row items-center justify-center gap-4"><button type="button" class="btn w-full flex-1 btn-outline btn-error"${attr("disabled", submittingNextRound, true)}>${escape_html(/* @__PURE__ */ leave_game())}</button> <form method="POST" action="?/nextRound" class="flex-1"><button type="submit" class="btn relative w-full btn-primary"${attr("disabled", !allPlayersFinished || submittingNextRound, true)}${attr("aria-busy", submittingNextRound)}><span${attr_class("", void 0, { "invisible": submittingNextRound })}>`);
    if (isFinalRound) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`${escape_html(/* @__PURE__ */ back_to_lobby())}`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`${escape_html(/* @__PURE__ */ next_round())}`);
    }
    $$payload.out.push(`<!--]--></span> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></button></form></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="card bg-base-100 shadow-xl"><div class="card-body"><button type="button" class="btn w-full btn-outline btn-error">${escape_html(/* @__PURE__ */ leave_game())}</button></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> `);
  if (game.status === "summary" && isFinalRound && allPlayersFinished) {
    $$payload.out.push("<!--[-->");
    GameSummary($$payload, {
      gameId: game.id,
      players: players2,
      rounds: game.maxRounds,
      refreshKey: `${game.status}:${guesses.length}:${players2.map((p) => p.totalPoints).join("-")}`
    });
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <dialog id="leave_game_modal" class="modal"><div class="modal-box"><h3 class="text-lg font-bold">${escape_html(/* @__PURE__ */ leave_game())}</h3> `);
  if (isAdmin) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<p class="py-4">${escape_html(/* @__PURE__ */ leave_game_admin_confirmation())}</p>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<p class="py-4">${escape_html(/* @__PURE__ */ leave_game_confirmation())}</p>`);
  }
  $$payload.out.push(`<!--]--> <div class="modal-action"><form method="POST" action="?/leaveGame"><button class="btn relative btn-error" type="submit"${attr("disabled", leavingGame, true)}${attr("aria-busy", leavingGame)}><span${attr_class("", void 0, { "invisible": leavingGame })}>${escape_html(/* @__PURE__ */ yes_leave())}</span> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></button></form> <form method="dialog"><button class="btn">${escape_html(/* @__PURE__ */ abort())}</button></form></div></div> <form method="dialog" class="modal-backdrop"><button>${escape_html(/* @__PURE__ */ close())}</button></form></dialog>`);
  bind_props($$props, {
    players: players2,
    guesses,
    correctLocation,
    isAdmin,
    allPlayersFinished,
    isFinalRound,
    game,
    onKick,
    calculateDistance
  });
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let isPlayerInGame, players2, messages, readyPlayers, isAdmin, allPlayersReady, isCurrentPlayerReady, roundImage, isFinalRound, currentRound, remainingSeconds;
  let data = $$props["data"];
  let game = data.game;
  let currentPlayer = data.currentPlayer;
  let isGeneratingChallenge = false;
  let guesses = [];
  let playersFinished = 0;
  let allPlayersFinished = false;
  let correctLocation = [0, 0];
  let view = game.status === "summary" ? "summary" : "guessing";
  let joining = false;
  let showJoinSpinner = false;
  let joinSpinnerTimer = null;
  const serverClockOffset = Date.now() - (data.serverNow ?? Date.now());
  function nowServerMs() {
    return Date.now() - serverClockOffset;
  }
  function computeRemainingSeconds(g) {
    if (!g?.round_deadline_at) return null;
    const deadlineMs = new Date(g.round_deadline_at).getTime();
    return Math.max(0, Math.ceil((deadlineMs - nowServerMs()) / 1e3));
  }
  const { form, errors } = superForm(data.form, {
    onSubmit: () => {
      joining = true;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      joinSpinnerTimer = setTimeout(() => showJoinSpinner = true, 1e3);
    },
    onResult: ({ result }) => {
      joining = false;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      showJoinSpinner = false;
      if (result.type === "success") invalidateAll();
    },
    onError: () => {
      joining = false;
      if (joinSpinnerTimer) clearTimeout(joinSpinnerTimer);
      showJoinSpinner = false;
    }
  });
  let summaryRefetchTimer = null;
  async function fetchSummaryData() {
    try {
      console.debug("[fetchSummaryData] start", { round: game.currentRound, status: game.status });
      const guessesResponse = await pb.collection("guesses").getFullList({
        filter: `game="${game.id}" && round=${game.currentRound}`,
        sort: "updated",
        expand: "player"
      });
      guesses = guessesResponse.map((g) => ({ ...g, __src: "fetch" }));
      playersFinished = guessesResponse.length;
      allPlayersFinished = playersFinished === players2.length;
      await fetchPlayersForScores();
    } catch (err) {
      console.error("Error fetching summary data:", err);
    }
  }
  async function fetchPlayersForScores() {
    try {
      const fresh = await pb.collection("games").getOne(game.id, { expand: "players,admin,ready_players,messages.player" });
      data.game = fresh;
    } catch (e) {
      console.warn("fetchPlayersForScores failed", e);
    }
  }
  async function sendMessage(message) {
    if (!currentPlayer) return;
    try {
      const messageRecord = await pb.collection("messages").create({ message, player: currentPlayer.id });
      await pb.collection("games").update(game.id, { "messages+": messageRecord.id });
    } catch (err) {
      console.error("Error while sending message:", err);
    }
  }
  async function updateGameSettings() {
    if (!isAdmin) return;
    const formData = new FormData();
    formData.append("maxRounds", String(game.maxRounds));
    formData.append("timeLimit", String(game.timeLimit));
    formData.append("private", String(game.private));
    formData.append("graceDistance", String(game.graceDistance));
    formData.append("fallOfRate", String(game.fallOfRate));
    formData.append("maxPoints", String(game.maxPoints));
    formData.append("polygon", JSON.stringify(game.polygon || null));
    formData.append("locationStrings", JSON.stringify(game.locationStrings || []));
    await fetch("?/updateGameSettings", { method: "POST", body: formData });
  }
  async function updatePolygonFromInput(locationString) {
    const formData = new FormData();
    formData.append("locationString", locationString);
    const res = await fetch("?/updatePolygon", { method: "POST", body: formData });
    const actionResult = await res.json();
    if (actionResult.type === "success" && actionResult.data) {
      try {
        const parsedArray = JSON.parse(actionResult.data);
        return JSON.parse(parsedArray[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
  async function kickPlayer(playerId) {
    if (!isAdmin || !playerId || playerId === currentPlayer?.id) return;
    const fd = new FormData();
    fd.append("playerId", playerId);
    const res = await fetch("?/kickPlayer", { method: "POST", body: fd });
    if (!res.ok) {
      console.warn("Kick failed", await res.text());
      return;
    }
    const curPlayers = data.game.expand?.players || [];
    const curReady = data.game.expand?.ready_players || [];
    data.game = {
      ...data.game,
      expand: {
        ...data.game.expand,
        players: curPlayers.filter((p) => p.id !== playerId),
        ready_players: curReady.filter((p) => p.id !== playerId)
      }
    };
    await invalidateAll();
  }
  game = data.game;
  currentPlayer = data.currentPlayer;
  isPlayerInGame = currentPlayer ? (game.players || []).includes(currentPlayer.id) : false;
  players2 = game.expand?.players || [];
  messages = game.expand?.messages || [];
  readyPlayers = game.expand?.ready_players || [];
  isAdmin = game.admin === currentPlayer?.id;
  allPlayersReady = players2.length > 0 && players2.length === readyPlayers.length;
  isCurrentPlayerReady = readyPlayers.some((p) => p.id === currentPlayer?.id);
  roundImage = game.challenge?.rounds[game.currentRound - 1];
  isFinalRound = game.currentRound >= game.maxRounds;
  currentRound = game.challenge?.rounds[game.currentRound - 1];
  correctLocation = currentRound?.location ? [currentRound.location[1], currentRound.location[0]] : [0, 0];
  remainingSeconds = computeRemainingSeconds(game);
  {
    if (game.status === "summary") {
      const missing = players2.length - guesses.length;
      if (missing > 0) {
        if (summaryRefetchTimer) clearTimeout(summaryRefetchTimer);
        summaryRefetchTimer = setTimeout(
          () => {
            console.debug("[Watcher] missing guesses, refetching", { players: players2.length, guesses: guesses.length });
            fetchSummaryData().then(() => {
              console.debug("[Watcher] after forced fetch", {
                players: players2.length,
                guesses: guesses.length,
                ids: guesses.map((g) => g.id)
              });
            });
          },
          250
        );
      }
    }
  }
  if (currentPlayer && store_get($$store_subs ??= {}, "$form", form).username === "") {
    store_mutate($$store_subs ??= {}, "$form", form, store_get($$store_subs ??= {}, "$form", form).username = currentPlayer.username);
  }
  isGeneratingChallenge = !!game.is_generating_challenge;
  if (!isPlayerInGame) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]"><div class="card w-full max-w-md bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">${escape_html(/* @__PURE__ */ join_game_name({ name: game.name }))}</h2> <p>${escape_html(/* @__PURE__ */ please_enter_name_to_join())}</p> <form method="POST" action="?/join" class="mt-4 flex flex-col gap-4"><div class="form-control"><input type="text" name="username" placeholder="Dein Name"${attr_class("input-bordered input input-lg w-full", void 0, {
      "input-error": store_get($$store_subs ??= {}, "$errors", errors).username
    })}${attr("value", store_get($$store_subs ??= {}, "$form", form).username)}${attr("disabled", joining, true)}${attr("aria-busy", joining)}/> `);
    if (store_get($$store_subs ??= {}, "$errors", errors).username) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<label class="label" for="username"><span class="label-text-alt text-error">${escape_html(store_get($$store_subs ??= {}, "$errors", errors).username)}</span></label>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div> <div class="card-actions flex-col gap-2"><button type="submit" class="btn relative w-full btn-primary"${attr("disabled", joining || !(store_get($$store_subs ??= {}, "$form", form).username && store_get($$store_subs ??= {}, "$form", form).username.trim().length > 0), true)}${attr("aria-busy", joining)}><span${attr_class("", void 0, { "invisible": joining })}>${escape_html(join())}</span> `);
    if (showJoinSpinner) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="absolute inset-0 grid place-items-center"><span class="loading loading-sm loading-spinner"></span></span>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></button> <a href="/" class="btn w-full btn-ghost">${escape_html(back_to_main_menu())}</a></div></form></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (isGeneratingChallenge) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm"><div class="flex flex-col items-center gap-4 text-white"><span class="loading loading-lg loading-spinner"></span> <span class="text-2xl font-bold">${escape_html(/* @__PURE__ */ creating_game())}</span> `);
    if (game.generation_target >= 1 || game.generation_found >= 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="w-64"><progress class="progress w-full progress-primary"${attr("value", game.generation_found)}${attr("max", game.generation_target)}></progress> <p class="mt-1 text-center font-mono text-sm">${escape_html(game.generation_found)}/${escape_html(game.generation_target)}</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<p class="text-sm opacity-70">${escape_html(/* @__PURE__ */ please_wait())}</p>`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div${attr_class("transition-all duration-300", void 0, { "pointer-events-none": !isPlayerInGame })}>`);
  if (game.status === "lobby") {
    $$payload.out.push("<!--[-->");
    Lobby($$payload, {
      game,
      players: players2,
      messages,
      isAdmin,
      readyPlayers,
      allPlayersReady,
      isCurrentPlayerReady,
      currentPlayer,
      onSendMessage: sendMessage,
      onUpdateSettings: updateGameSettings,
      onUpdatePolygon: updatePolygonFromInput,
      onKickPlayer: kickPlayer
    });
  } else {
    $$payload.out.push("<!--[!-->");
    if (game.status === "playing" || game.status === "summary") {
      $$payload.out.push("<!--[-->");
      if (view === "guessing") {
        $$payload.out.push("<!--[-->");
        MakeGuess($$payload, {
          imageId: roundImage,
          username: currentPlayer?.username,
          currentRound: game.currentRound,
          totalRounds: game.maxRounds,
          roundDuration: game.timeLimit,
          remainingSeconds: remainingSeconds ?? game.timeLimit
        });
      } else {
        $$payload.out.push("<!--[!-->");
        if (view === "summary") {
          $$payload.out.push("<!--[-->");
          Summary($$payload, {
            players: players2,
            game,
            guesses,
            correctLocation,
            isAdmin,
            allPlayersFinished,
            isFinalRound,
            onKick: kickPlayer
          });
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]-->`);
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="p-8 text-center"><h1 class="text-3xl">${escape_html(/* @__PURE__ */ unknown_game_status())}: ${escape_html(game.status)}</h1></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { data });
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-joAn-JxS.js.map
