import { defineConfig } from "vitepress";
import { withDynamicSidebar } from "vitepress-dynamic-sidebar";

const IGNORE_FOLDERS = [
  ".git",
  ".vitepress",
  "node_modules",
  ".idea",
  ".vscode",
  "dist",
  "build",
  "coverage",
];

const inner = withDynamicSidebar({
  title: "Interface Engineering",
  srcDir: "./src",
  cleanUrls: true,
  ignore: IGNORE_FOLDERS,
});

export default defineConfig({
  ...inner,
  // themeConfig: {
  //   ...inner.themeConfig,
  //   sidebar: inner.themeConfig.sidebar.map((x: any) => {
  //     return {
  //       ...x,
  //       collapsed: false,
  //       items: x.items.map((y: any) => ({
  //         ...y,
  //         collapsed: false,
  //       })),
  //     };
  //   }),
  // },
});
