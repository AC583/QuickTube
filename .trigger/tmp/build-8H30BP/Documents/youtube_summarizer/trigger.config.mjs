import {
  defineConfig
} from "../../chunk-4E7IDVDR.mjs";
import "../../chunk-WZGQJWAS.mjs";
import {
  init_esm
} from "../../chunk-FUV6SSYK.mjs";

// trigger.config.ts
init_esm();
var trigger_config_default = defineConfig({
  project: process.env.TRIGGER_PROJECT_REF,
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./trigger"],
  build: {}
});
var resolveEnvVars = void 0;
export {
  trigger_config_default as default,
  resolveEnvVars
};
//# sourceMappingURL=trigger.config.mjs.map
