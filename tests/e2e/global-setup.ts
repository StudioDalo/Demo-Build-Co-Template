import { rmSync } from "node:fs";

export default function globalSetup() {
  rmSync(".data-test", { recursive: true, force: true });
}
