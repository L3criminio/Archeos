import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "Archeos";
const isUserPage = repositoryName.toLowerCase().endsWith(".github.io");
const base = process.env.GITHUB_PAGES === "true" && !isUserPage ? `/${repositoryName}/` : "/";

export default defineConfig({
  base,
  plugins: [tailwindcss()],
});
