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
  title: "🧙‍♂️ Interface Engineering",
  srcDir: "./src",
  cleanUrls: true,
  ignore: IGNORE_FOLDERS,
});

export default defineConfig({
  ...inner,

  lang: "en-US",
  description: "A mostly reasonable approach to designing software interfaces",

  head: [
    [
      "meta",
      {
        property: "og:image",
        content: "https://interface.engineering/preview.png",
      },
    ],
    [
      "meta",
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
    ],
    [
      "meta",
      {
        name: "twitter:image",
        content: "https://interface.engineering/preview.png",
      },
    ],
  ],

  themeConfig: {
    ...inner.themeConfig,

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/schalkventer/interface-engineering",
      },
    ],

    sidebar: inner.themeConfig.sidebar.map((x: any) => {
      return {
        ...x,
        collapsed: false,
        items: x.items.map((y: any) => ({
          ...y,
          collapsed: false,
        })),
      };
    }),
  },
});
