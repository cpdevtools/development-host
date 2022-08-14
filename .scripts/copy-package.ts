import { readJsonFile, writeJsonFile } from "@cpdevtools/lib-node-utilities";
import { PackageJson } from "type-fest";

(async () => {
  const pkg = (await readJsonFile("./package.json")) as PackageJson;
  delete pkg.devDependencies;
  delete (pkg as any)["lint-staged"];
  pkg.scripts = {
    postinstall: "devhost postinstall",
  };

  await writeJsonFile("./dist/main/package.json", pkg, 2);
})();
