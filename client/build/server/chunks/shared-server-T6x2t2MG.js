let private_env = {};
let public_env = {};
let safe_public_env = {};
function set_private_env(environment) {
  private_env = environment;
}
function set_public_env(environment) {
  public_env = environment;
}
function set_safe_public_env(environment) {
  safe_public_env = environment;
}

export { safe_public_env as a, set_public_env as b, set_safe_public_env as c, private_env as d, public_env as p, set_private_env as s };
//# sourceMappingURL=shared-server-T6x2t2MG.js.map
