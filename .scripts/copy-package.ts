import { readJsonFile, writeJsonFile } from "@cpdevtools/lib-node-utilities";

(async () => {
  const pkg = await readJsonFile("./package.json");
  delete pkg.devDependencies;
  delete pkg.scripts;
  pkg.scripts = {
    postinstall: "devhost install",
  };
  delete (pkg as any)["lint-staged"];

  await writeJsonFile("./dist/package.json", pkg, 2);
})();
