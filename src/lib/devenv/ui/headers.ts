import boxen from "boxen";
import chalk from "chalk";

export function applicationHeader(text: string): string {
  return (
    "\n" +
    boxen(text, {
      padding: 1,
      margin: 0,
      borderStyle: "double",
      borderColor: "green",
      textAlignment: "center",
      width: 80,
      float: "left",
    }) +
    "\n"
  );
}

export function applicationFooter(text: string): string {
  return (
    "\n" +
    boxen(text, {
      padding: 1,
      margin: 0,
      borderStyle: "double",
      borderColor: "green",
      textAlignment: "center",
      width: 80,
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
        width: 80,
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
        width: 80,
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
        width: 80,
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
        width: 80,
        float: "left",
      })
  );
}
