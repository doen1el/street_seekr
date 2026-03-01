import { g as getLocale, t as trackMessageCall } from './runtime-Da7SMkyw.js';
import PocketBase from 'pocketbase';
import { p as public_env } from './shared-server-T6x2t2MG.js';

const en_players = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Players`;
  }
);
const de_players = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Spieler`;
  }
);
const players = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("players", locale);
  if (locale === "en") return en_players();
  return de_players();
};
const en_join = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Join`;
  }
);
const de_join = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Beitreten`;
  }
);
const join = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("join", locale);
  if (locale === "en") return en_join();
  return de_join();
};
const en_code = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Code`;
  }
);
const de_code = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Code`;
  }
);
const code = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("code", locale);
  if (locale === "en") return en_code();
  return de_code();
};
const en_actions = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Actions`;
  }
);
const de_actions = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Aktionen`;
  }
);
const actions = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("actions", locale);
  if (locale === "en") return en_actions();
  return de_actions();
};
const pb = new PocketBase(public_env.PUBLIC_POCKETBASE_URL);
pb.autoCancellation(false);

export { players as a, actions as b, code as c, join as j, pb as p };
//# sourceMappingURL=pocketbase-CzzajoGR.js.map
