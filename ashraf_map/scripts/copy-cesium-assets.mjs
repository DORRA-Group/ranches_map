import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const sourceRoot = resolve("node_modules/cesium/Build/Cesium");
const outputRoot = resolve("public/cesium");
const directories = ["Assets", "ThirdParty", "Widgets", "Workers"];

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

for (const directory of directories) {
  cpSync(resolve(sourceRoot, directory), resolve(outputRoot, directory), { recursive: true });
}
