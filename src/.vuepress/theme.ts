import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://clonewith.me",
  author: {
    name: "Clonewith",
    url: "https://clonewith.me",
  },
  logo: "https://theme-hope-assets.vuejs.press/logo.svg",
  repo: "clonewith/space",
  docsDir: "src",

  navbar,
  sidebar,

  print: false,
  editLink: false,
  displayFooter: true,
  footer: "你所热爱的，就是你的生活。",

  blog: {
    description: "Open source programmer",
    intro: "/intro.html",
    medias: {
      GitHub: "https://github.com/clonewith",
    },
  },

  markdown: {
    alert: true,
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    mermaid: true,
    plantuml: true,
    spoiler: true,
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,
    math: {
      type: "katex",
    },
  },

  plugins: {
    blog: true,
    comment: {
      provider: "Twikoo",
      envId: "https://comments.clonewith.me",
    },
    components: {
      components: ["Badge", "VPCard"],
    },
    icon: {
      prefix: "fa6-solid:",
    },
  },
});
