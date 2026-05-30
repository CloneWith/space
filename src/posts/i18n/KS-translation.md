---
date: 2024-06-22
tags:
  - renpy
  - i18n
  - game
categories:
  - i18n
comments: true
---

# 关于 Katawa Shoujo 重制版翻译

本文主要讲述我在迁移 Katawa Shoujo 翻译到重制版框架时的过程与一些问题。<!-- more -->

## 概况

Katawa Shoujo 作为一款脍炙人口的 GalGame 游戏，在贴吧与各大游戏论坛中也悄然活跃许久（说是*悄然*，主要是因为里面的部分内容在国内一些平台受限了）。然而，作为原作团队的 Four Leaf Studios 近几年却杳无音信，游戏本身也没有过多的更新，受到外界的关注也极其有限。

随后，另一个游戏制作团队站了出来：**Fleeting Heart Studios**（简称 *FHS*），他们负责将游戏的框架重新翻新整理，同时重建已有的论坛与博客，旨在“实现对可访问性与质量上的优化，在那时是做不到的[^about]”。可以在 [Codeberg](https://codeberg.org/fhs) 上找到他们。

在我关注到这个项目时，他们已经完成了 KS 的俄语、法语、西班牙语、荷兰语翻译；因为我也在资源站找到了 KS 的原汉化版，就尝试了一下迁移翻译。

## 需求分析

就翻译文件的结构与处理方式而言，旧版 Ren'py 与新版 Ren'py 8 完全不同：

- 旧版本框架中，原脚本与翻译脚本是独立的，意味着可以单独运行。
- 新版本框架中，翻译脚本基于原脚本使用 SDK 生成，使用一批 `old` `new` 标签标识原文与译文。

框架上的更改，以及原游戏的脚本文件经过了编译处理，为迁移工作带来一些麻烦，需要：

- 获取原游戏，反编译脚本
- 从脚本文件中提取字符串，建立对应关系
- 从重置版中提取翻译模板，应用翻译

::: info 关于翻译文件

关于翻译文件的更多内容，详见[官方文档](https://renpy.org/doc/html/translation.html)。

:::

## 初步准备

翻译迁移对设备的系统与性能并没有过高的要求，主要体现在软件方面：

- Python **2**（具体原因见下）
- Ren'py 8 SDK：在[官网](https://renpy.org/latest.html)下载
- 顺手的代码编辑器（建议图形编辑器）
- Git（如果想将翻译进一步交给 KS:RE 的开发者）
- 稳定干净的网络（以便访问 GitHub 与 Codeberg）

除此之外，翻译迁移需要的时间与工作量并不小（更别提直接翻译了...），需要耐心一点。

::: info Windows 用户提示

如果之前安装过 Python 3，在安装 Python 2 时请不要将 Python 2 目录添加到 PATH，否则在日后使用会遇到一些冲突问题（至少 Windows 的环境变量是分优先级的）。无论如何，也请记住 Python 2 可执行文件的所在目录，以便之后在命令行执行。

Linux 等 \*nix 用户无需考虑这类问题，因为安装时一般都分好版本了（使用 `python2` 与 `python3` 的调用），或者有全局按参数控制的大版本调用（如 `py -2` 与 `py -3`）。

:::

### 获取依赖项

首先，从任意来源下载 KS **原版**。解压之后，应该能在 `game` 目录下找到一批 `.rpyc` 文件，从中复制出以下文件，以便进行反编译：

- `script-a*-*.rpyc`
- `script-a*-*_ZHS.rpyc`
- `ui_strings.rpyc`
- `ui_strings_ZHS.rpyc`

使用终端执行以下命令（其他等效的方式也可以）：

```sh
# 拉取 Codeberg 上的 KS:RE 仓库
git clone https://codeberg.org/fhs/katawa-shoujo-re-engineered.git
# 拉取 unrpyc 仓库
git clone https://github.com/CensoredUsername/unrpyc.git
```

此后，将 KS 原版游戏目录下的 `renpy` 文件夹直接复制到刚刚拉取的 `unrpyc` 目录下，这是 unrpyc 工具工作需要的依赖。

### 反编译

有人可能会问了：为啥不直接使用 Release 给的 `bytecode.rpyb` `un.rpy` `un.rpyc` 呢？

其实这几种方法我都试过了，但是都没有用，会报告各种奇怪的错误，如语法错误、模块无对应属性等等，不如直接使用仓库源码。个人猜测，这是由于原版 KS 的 Ren'py 对应 Python 版本过旧导致的，在原版的框架上运行时无法解析来自 unrpyc 中的新语法架构。

::: warning

此教程仅针对 KS:RE 讲述。其他游戏的兼容性可能不同，但多数会比较简单，直接使用 Release 里的文件，按步骤操作即可。

:::

值得注意的是，unrpyc 的最新版本代码是面向 Python 3 与 Ren'py 较新版本设计的，无法直接运行。需要手动切换到适合的版本：

```sh
git checkout v1.1.5
```

项目中每个比较稳定的发行版都有一个对应的标签，检出时直接输入对应的标签名即可。我处理时使用的便是 `v1.1.5` 版本。

在此之后，尝试使用 Python 2 运行脚本：

```sh
cd path/to/unrpyc/repo
python2 unrpyc.py --help
```

如果报错，请检查环境配置，然后尝试检出到其他标签再次测试。当一切正常，会输出帮助信息：

```sh
usage: unrpyc.py [-h] [-c] [-d] [-p PROCESSES] [-t TRANSLATION_FILE]
                 [-T WRITE_TRANSLATION_FILE] [-l LANGUAGE] [--sl1-as-python]
                 [--comparable] [--no-pyexpr] [--tag-outside-block]
                 [--init-offset] [--try-harder]
                 file [file ...]
```

对每个目标文件执行：

```sh
python2 unrpyc.py path/to/rpyc/file
```

完成后会得到一批 `.rpy` 文件，这些正是我们需要的。

## 提取与应用

KS:RE 仓库的 [`scripts/tl_script`](https://codeberg.org/fhs/katawa-shoujo-re-engineered/src/branch/master/scripts/tl_script) 目录下存储了一系列脚本，对于翻译迁移过程会很有帮助。

先使用 `extract.py` 从 `.rpy` 提取字符串，将文件作为参数输入，会得到前缀为 `new-` 的文本文件，里面是所有提取出的字符串。

接下来仔细检查提取出的字符串，中英逐行对照，检查有无不对应的情况，减少后面处理错误导致的麻烦。

然后，使用 `concat.py` 脚本，基于中英双语的提取文本生成 `.json` 文件，以便下一步应用翻译。

这时打开 Ren'py SDK 图形界面，操作如下：

- 转到`设置 -> 一般 -> 项目目录`，将其设置为 KS:RE 仓库所在上一层目录；
- 返回项目列表，应该能看到项目 `katawa-shoujo-re-engineered`，选中它；
- 点击`生成翻译`，语言输入 `zh` 或者其他你认为恰当的；
- 遵照默认设置，点击`提取字串翻译`，稍等片刻；
- 最后在界面所示的目录中，会得到一批空的翻译模板文件。

::: info 小提示

在对翻译文件做出批量操作前，建议先行进行备份，以免造成不必要的损失。

:::

最后，应用翻译到翻译文件。

由于仓库现有的部分脚本不够灵活，这里给出自行修改过的版本：

```python title="concat.py"
# concat.py, by @CloneWith and others
import os
import sys
import json

# Convert the original and translated files into one .json file
# 注意：原文件与翻译文件脚本的前面部分必须完全相同；运行时仅需输入原文件的文件名（不带扩展名后缀）
og = open(sys.argv[1] + ".rpy", "r", encoding="utf8").readlines()
tl = open(sys.argv[1] + "_zh_hans.rpy", "r", encoding="utf8").readlines()
# 这里我用的是 *_zh_hans 后缀，可根据情况修改
# Line numbers must match to proceed
try:
    assert len(og) == len(tl)
    # TODO: 字符串结构检测
except AssertionError:
    print(
        "[!] Sorry, the two files don't *exactly* match. Please check the line numbers first."
    )
    exit(1)

out = {}

for i in range(len(og)):
    ogsc = og[i].strip().replace("“", "\'").replace("”", "\'")
    out[ogsc] = tl[i].strip()

json.dump(
    out,
    open(f"{os.path.splitext(sys.argv[1])[0]}.json", "w", encoding="utf8"),
    ensure_ascii=False,
    indent="\t",
)
```

```python title="apply.py"
# apply.py, by @CloneWith and others
import re
import sys
import json

# 符合要求的行
exp = re.compile(r"\A([a-zA-Z0-9_]* )?\"(.+)\"(.*)\Z")
# 识别注释，我们要从其中找出原文
exp_com = re.compile(r"\A\#( [a-zA-Z0-9_]* )\"(.*)\Z")
# 上面提到的 json 文件
dataset = json.load(open(sys.argv[1], "r", encoding="utf8"))
# 写入翻译
tl = open(sys.argv[2], "r", encoding="utf8").readlines()

WARNS = 0

for i in range(len(tl)):
    t = tl[i].strip()
    pre = "    "
    MODE = 1
    if t.startswith("new \"") or t.find("\"\"") != -1:
        # Skip NEW for now and empty strings
        continue
    if t.endswith(" nointeract"):
        t = t[:-11]
    if t.startswith("# \"") or exp_com.match(t) is not None:
        t = t[2:]
        MODE = 0
    elif t.startswith("old \""):
        t = t[4:]
        MODE = 2
    elif exp.match(t) is None:
        if t.startswith("translate") or t.startswith("#") or t.startswith("nvl"):
            continue
        if len(t.strip()) == 0: continue
    else:
        continue

    new = dataset.get(t)

    if new is None:
        print("Missing translation on line {}:".format(i) + tl[i])
        WARNS += 1
        continue

    if MODE == 1:
        tl[i] = tl[i].replace(t, new)
    elif MODE == 0:
        tl[i+1] = pre + new + "\n"
    elif MODE == 2:
        tl[i+1] = tl[i].replace(t, new).replace("old", "new")

open("tl-" + sys.argv[2], "w", encoding="utf8").write("".join(tl))
print("[i] Auto application complete.")
if WARNS != 0:
    print("[!] {} warnings found.".format(WARNS))
```

## 界面设计

添加新语言、嵌入新字体时，应：

- 在 `game/screens.rpy` 中添加语言对应选项，便于用户切换到新语言；
- 在 `game/styles.rpy` 中修改字体设置，使用字体组引用新字体。
- 将你的字体文件复制到游戏仓库的 `game/font` 文件夹，以便游戏读取。

::: info 使用字体组实现本地化字体

`FontGroup` 的原理是从空字体集合开始，将指定字体中需要的部分通过 `add()` 方法添加到集合中，使原有字体缺少的字形能够用指定的字体显示，实现多语言字体的混合。与手动将字体整合导出相比，显著提高了效率。

以下是示例：

```py
style default:
    font "font/playtime.ttf"
    # 0x4e00 0xffff 对应引用范围，前者优先
    font FontGroup().add("font/cjkFonts-allseto.ttf", 0x4e00, 0xffff).add("font/playtime.ttf", 0x0000, 0xffff)
    # font "font/playtime.ttf"
    size 36 + mobile_ts_add * (renpy.android or renpy.ios)
```

:::

对于 KS:RE 的中文界面，最初选用的是 **[cjkFont 全濑体](https://cjkfonts.io/blog/cjkfonts_allseto)**，比较可爱，也比较契合其他界面文字。

一段时间后，其他用户在[工单](https://codeberg.org/fhs/katawa-shoujo-re-engineered/issues/101)中反映，由于全濑体是在**小濑字体（面向日语）**的基础上，通过深度学习生成了缺失的简体中文字形，在简体中文环境下，某些字会显示错误的字形。考虑之后，换用了[小赖字体](https://github.com/lxgw/kose-font)：

```diff {22-23}
diff --git a/game/styles.rpy b/game/styles.rpy
index fd7fae3..1b126c7 100644
--- a/game/styles.rpy
+++ b/game/styles.rpy
@@ -8,9 +8,14 @@ define mobile_ts_add = 10

 define bold_size = 38

+define default_font = "font/playtime.ttf"
+
+translate zh_hans python:
+    default_font = FontGroup().add("font/XiaolaiSC-Regular.ttf", 0x2e80, 0xffff).add("font/playtime.ttf", 0x0000, 0xffff)
+    gui.text_size = 36 + mobile_ts_add * (renpy.android or renpy.ios)
+
 style default:
-    font FontGroup().add("font/cjkFonts-allseto.ttf", 0x2e80, 0xffff).add("font/playtime.ttf", 0x0000, 0xffff)
-    # font "font/playtime.ttf"
+    font default_font
     size 36 + mobile_ts_add * (renpy.android or renpy.ios)

 style gui_text is default:
```

最后，希望这篇文章对大家翻译 Ren'py 视觉小说游戏有所帮助！

[^about]: 翻译自 FHS 官网，[来源](https://www.fhs.sh/about)
