import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Poppins is vendored under assets/ so next/og renders the brand face without
 * a network fetch at request time.
 */
export async function poppins() {
  const dir = path.join(process.cwd(), "assets");
  const [bold, regular] = await Promise.all([
    readFile(path.join(dir, "Poppins-Bold.ttf")),
    readFile(path.join(dir, "Poppins-Regular.ttf")),
  ]);
  return [
    { name: "Poppins", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Poppins", data: regular, weight: 400 as const, style: "normal" as const },
  ];
}
