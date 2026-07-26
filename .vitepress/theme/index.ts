/// <reference types="vite/client" />

import DefaultTheme from "vitepress/theme";
import ImageViewerP from "@miletorix/vitepress-image-viewer";
import { inBrowser } from "vitepress";

import "./theme.css";
import "@miletorix/vitepress-image-viewer/style.css";

if (inBrowser) {
  // @ts-ignore
  import("@andypf/json-viewer");
}

export default {
  extends: DefaultTheme,
  enhanceApp(ctx: any) {
    ImageViewerP(ctx.app);
  },
};
