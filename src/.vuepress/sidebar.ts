import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    "intro",
    "changelog",
    {
      text: "代码",
      icon: "code",
      prefix: "posts/code",
      collapsible: true,
      children: "structure",
    },
    {
      text: "技术",
      icon: "hammer",
      prefix: "posts/tools",
      collapsible: true,
      children: "structure",
    },
    {
      text: "网络安全",
      icon: "bullseye",
      prefix: "posts/security/",
      collapsible: true,
      children: "structure",
    },
    {
      text: "本地化",
      icon: "language",
      prefix: "posts/i18n",
      collapsible: true,
      children: "structure",
    },
    {
      text: "osu!",
      icon: "gamepad",
      prefix: "posts/osu",
      collapsible: true,
      children: "structure",
    },
    {
      text: "杂谈",
      icon: "feather",
      prefix: "posts/misc",
      collapsible: true,
      children: "structure",
    },
    {
      text: "笔记",
      icon: "book",
      prefix: "posts/notebook",
      collapsible: true,
      children: "structure",
    },
  ],
});
