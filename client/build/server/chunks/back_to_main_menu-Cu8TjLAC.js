import { g as getLocale, t as trackMessageCall } from './runtime-Da7SMkyw.js';

const en_back_to_main_menu = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Back to Main Menu`;
  }
);
const de_back_to_main_menu = (
  /** @type {(inputs: {}) => string} */
  () => {
    return `Zurück zum Hauptmenü`;
  }
);
const back_to_main_menu = /* @__NO_SIDE_EFFECTS__ */ (inputs = {}, options = {}) => {
  const locale = options.locale ?? getLocale();
  trackMessageCall("back_to_main_menu", locale);
  if (locale === "en") return en_back_to_main_menu();
  return de_back_to_main_menu();
};

export { back_to_main_menu as b };
//# sourceMappingURL=back_to_main_menu-Cu8TjLAC.js.map
