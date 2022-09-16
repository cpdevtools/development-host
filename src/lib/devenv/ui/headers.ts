import boxen from "boxen";
import chalk from "chalk";

export function applicationHeader(text: string, color?: "" | "warn"): void {
  console.info(
    "\n" +
      boxen(text, {
        padding: 1,
        margin: 0,
        borderStyle: "double",
        borderColor: color === "warn" ? "yellow" : "greenBright",
        textAlignment: "center",
        float: "left",
      }) +
      "\n"
  );
}

export function applicationFooter(text: string): void {
  console.info(
    "\n" +
      boxen(text, {
        padding: 1,
        margin: 0,
        borderStyle: "double",
        borderColor: "greenBright",
        textAlignment: "center",
        float: "left",
      }) +
      "\n"
  );
}

export function taskHeader(text: string): void {
  console.info(
    "\n" +
      boxen(text, {
        padding: 0,
        margin: 0,
        borderStyle: "single",
        borderColor: "blueBright",
        textAlignment: "center",
        float: "left",
      })
  );
}

export function taskFooter(text: string): void {
  console.info(
    "\n" +
      boxen(chalk.grey(text), {
        padding: 0,
        margin: 0,
        borderStyle: "single",
        borderColor: "blue",
        textAlignment: "center",
        float: "left",
      })
  );
}

export function subTaskHeader(text: string): void {
  console.info(
    "\n" +
      boxen(text, {
        padding: 0,
        margin: 0,
        borderStyle: "single",
        borderColor: "yellow",
        textAlignment: "center",
        float: "left",
      })
  );
}

export function subTaskFooter(text: string): void {
  console.info(
    "\n" +
      boxen(chalk.grey(text), {
        padding: 0,
        margin: 0,
        borderStyle: "single",
        borderColor: "yellow",
        textAlignment: "center",
        float: "left",
      })
  );
}
