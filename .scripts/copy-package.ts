import { readJsonFile, writeJsonFile } from "@cpdevtools/lib-node-utilities";
import { PackageJson } from "type-fest";

(async () => {
  const pkg = (await readJsonFile("./package.json")) as PackageJson;
  delete pkg.devDependencies;
  //delete pkg.scripts;
  pkg.scripts = {
    postinstall: "devhost install",
  };
  delete (pkg as any)["lint-staged"];

  await writeJsonFile("./dist/main/package.json", pkg, 2);
})();
