import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  "/intro",
  {
    text: "代码",
    icon: "code",
    link: "/posts/code/",
  },
  {
    text: "CTF",
    icon: "bullseye",
    link: "/posts/security/",
  },
]);
