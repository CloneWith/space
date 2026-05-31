---
date: 2025-04-22
tags:
  - CTF
order: 2
---

# 数据识别与审计

## 6 - 越权请求识别

::: info 题目信息

管理员进行 session 数据核验时，发现有些用户出现越权情况，正常情况下普通用户仅可查询自己 id 的内容，管理员用户可以查询任意 id 的内容。管理员将流量监控设备中生成的流量包和服务器生成的 session 文件，命名为 `yuequan.zip` 备份到了文件服务器中。请选手结合流量包和 session 文件识别出存在越权行为的用户 `login_id`，并按照数字大小顺序排列，通过 `_` 拼接后，作为标准答案提交。

:::

根据附件中给出的越权判断标准，当非管理员用户请求搜索其他用户的信息时为越权。

比较简单的方式是，先在 WireShark 中筛选出符合要求的流量（此处是对 `/test/dashboard.php` ​的请求），将它们导出为单个流量包；

![在 WireShark 中过滤请求](./img/request-filter.png "在 WireShark 中过滤请求")

在此之后，使用`导出分组解析结果`​功能，导出流量的 JSON 序列化文件。

POST 表单中的 `search_id`​ 为用户请求的 ID 信息，而 session 信息在请求头的 `Cookie`​ 中（搜索等号即可），与附件中的一批 session 文件是对应的。对于每个 session 文件，可以手动找出 `login_id`​ 与 `is_admin` ​所在的位置，读取并转化为我们需要的形式。

由此得出的脚本如下：

```python
import json

data: list = []

def check_priv(cookie: str, search_id: str) -> bool:
    with open(f"list/session_{cookie}", "r", encoding="utf-8") as s:
        sc = s.read()
        id_index = sc.find("login_id") + 8 + 4
        id_stop = id_index
        login_id = ""

        while id_stop <= len(sc) - 1:
            if sc[id_stop].isdigit():
                login_id += sc[id_stop]
                id_stop += 1
            else:
                break

        admin_index = sc.find("is_admin") + 8 + 4
        is_admin = sc[admin_index] == "1"

        if (not is_admin) and search_id != login_id:
            print(login_id)
            return False
        else:
            return True

        # print(f"{sc[id_index]} {sc[admin_index]}")

with open("1212.json", "r", encoding="utf-8") as f:
    fc = f.read()
    data = json.loads(fc)
    for entry in data:
        try:
            http_data = entry["_source"]["layers"]["http"]
            value = entry["_source"]["layers"]["urlencoded-form"]
            cookie = http_data["http.cookie"]
            session_index = cookie.find("=") + 1

            dp = json.dumps(value)
            v_index = dp.find("value") + 9
            # search_id
            # print(dp[v_index:-3])

            check_priv(cookie[session_index:], dp[v_index:-3])
        except KeyError:
            continue
        #except Exception as e:
        #    print(e)
        #    continue
```

**答案：** ​`607_715_867_1133`​

## 7 - 权限差异比较

::: info 题目信息

交易数据查询系统的数据库 `adminers` 库中存放了平台部分用户权限的备份数据。为了确保数据库的安全性和合规性，公司需要每月对数据库用户权限进行审计。请选手下载平台提供的附件，分析 `用户权限表.pdf` 文件，找出数据库中权限分配不一致的用户。请选手进行数据对比，找到被删除的用户，被添加的用户，权限发生更改的用户进行分别统计，通过 `_` 拼接后，作为标准答案提交。

:::

这题的主要难点在于，如何从数据源中提取数据，同时还要保证二者形式上的差距不太大（这样比较起来才更简单）。

- 在管理系统中，将`adminers`​表内容导出为 CSV 格式；

  ![使用管理后台导出数据信息](./img/dbmgr-export.png "使用管理后台导出数据信息")

- 使用工具从 PDF 中提取所有文本，手动将其逗号分隔；

注意，提取出的内容转化为 CSV 后，需要**再次按用户值**排序，否则比较的结果可能会有出入（尤其是直接使用差异工具对比时）。

处理完成后，使用差异可视化工具直接进行对比。接下来，数就完了！

![差异对比工具的界面显示](./img/diff-comparison.png "差异对比工具的界面显示")

CSV 文件层面的差异可视化比较简单直观，属于可以肉眼看出来的程度。如果数据量大一点，则需要考虑使用 Python 的相关数据分析模块与特性来协助处理一下。

**答案：** ​`9_3_9`​

## 8 - 爬虫范围分析

::: info 题目信息

为方便商家和顾客及时了解商品销售趋势与用户测评数据，公司提供了一个商品测评汇总平台，平台上有各种热门商品及测评报告 URL 链接。请选手提取**热门商品**中的所有的测评报告 URL 链接，请选手下载平台提供的附件，分析附件中的 `robots.txt` 的规则进行数据处理操作。选手需要确定哪些链接是可以进行爬虫的，哪些是不可以进行爬虫的，统计出不可以爬虫的URL的数量并作为答案进行提交。

注：`robots.txt` 中，`Allow` 优先级要高于 `Disallow`。

:::

题目中给出的 `robots.txt` 附件内容如下：

```robots
User-agent: *
Allow: /download
Allow: /about
Allow: /services
Allow: /title
Allow: /products
Allow: /api/v2/safe
Allow: /register
Allow: /temp
Allow: /logs/public
Allow: /system
Allow: /search?q=
Allow: /*.zip$
Allow: /restricted
Allow: /cart

Disallow: /logs
Disallow: /user/profile
Disallow: /api
Disallow: /admin
Disallow: /private/folder
Disallow: /debug
Disallow: /details
Disallow: /*.bak$
Disallow: /*?token=
```

我们尝试直接从网站上复制文本，发现格式很规整，链接总以**纯文本**的形式，在**单独一行**内呈现，适合进行处理：

```md
商品测评汇总平台

追风筝的人
图书
https://trustedreviews.org/debug

美的智能门锁
家电
https://producthub.com/private/folder
...
```

将网站的所有 30 页中的文本输出到单个文件上，然后使用 Python 的正则表达式匹配功能进行处理与统计：

```python
import re

total = 0
banned = 0

ALLOW_LIST = [
    re.compile(r".*/download"),
    re.compile(r".*/about"),
    re.compile(r".*/services"),
    re.compile(r".*/title"),
    re.compile(r".*/products"),
    re.compile(r".*/api/v2/safe"),
    re.compile(r".*/register"),
    re.compile(r".*/temp"),
    re.compile(r".*/logs/public"),
    re.compile(r".*/system"),
    re.compile(r".*/search\?q="),
    re.compile(r".*/*.zip$"),
    re.compile(r".*/restricted"),
    re.compile(r".*/cart")
]

BAN_LIST = [
    re.compile(r".*/logs"),
    re.compile(r".*/user/profile"),
    re.compile(r".*/api"),
    re.compile(r".*/admin"),
    re.compile(r".*/private/folder"),
    re.compile(r".*/debug"),
    re.compile(r".*/details"),
    re.compile(r".*/*.bak$"),
    re.compile(r".*/*\?token="),
]

def not_allowed(url: str) -> bool:
    for r in ALLOW_LIST:
        if r.match(url):
            return False

    for r in BAN_LIST:
        if r.match(url):
            return True

    return False

with open("http.txt", "r", encoding="utf-8") as f:
    while True:
        line = f.readline()
        if line == "":
            break

        if line.lower().startswith("http"):
            total += 1
            banned += 1 if not_allowed(line) else 0

    print(f"[i] {banned} of {total} links disallowed.")
    f.close()

# Output:
# [i] 503 of 1496 links disallowed.
```

**答案：** `503`

## 9 - 异常数据识别

::: info 题目信息

公司管理员在商品测评汇总平台中的文件服务器，存放了一些商品相关或者用户上传的文件数据，包括 TXT，图片，PDF，音频数据。在各种数据中，可能泄露了一些敏感信息或者某些用户插入了恶意代码到各种类型数据中。请选手对于各种数据类型的文件进行审计，找到带有敏感信息或者恶意代码的数据文件，并将文件名列出来。每提交一个正确的文件名可得 `(题目总分数/标准答案个数)` 分，每提交一个错误的文件名扣 `(题目总分数/标准答案个数)` 分，扣到 0 分为止。请选手尽可能的提交正确答案。

注：请选手将所有正确的答案汇总到一个 txt 文件中，并通过 SSH 访问文件服务器对应地址的 2222 端口（账号/密码：`lowuser/lowuser`），将答案文件放到 `/home/lowuser/` 目录下。请选手下载平台提供的附件，参照附件中的 `data.pdf` 要求的答案格式进行提交,否则会影响成绩。

:::

总体看下来，TXT 文本文件是最好分析的，可以结合关键词与字符过滤的方式找出敏感信息文件：

```python
import re
import os

# 这里用到了一些常用的敏感数据关键词
WORDS = [
    "手机号",
    "号码",
    "身份",
    "邮箱",
    "银行",
    "卡",
    "联系",
    "泄露",
    "信息",
    "地址",
    "姓名",
    "名字",
    "车",
]

# 严判：使用正则表达式滤出所有英文字母与数字
SENSITIVE_TAGS = [
    re.compile(r".*[A-Z]+"),
    re.compile(r".*[a-z]+"),
    re.compile(r".*[1-9]+"),
]

def has_sensitive(src: str) -> bool:
    # 为什么不用 isalnum() 判别 ASCII 与数字？见下文
    # for s in src:
    #     if s.isalnum():
    #         return True

    for r in SENSITIVE_TAGS:
        if r.match(src):
            return True

    for w in WORDS:
        if src.find(w) != -1:
            return True
        else:
            return False

for root, dirs, files in os.walk("./txt"):
    for file in files:
        with open(f"./txt/{file}", "r", encoding="utf-8") as f:
            line = f.read()
            if has_sensitive(line):
                print(file)
                print(line)

# Output（已脱敏）:
# 24HZjcP.txt
# 这个商城平台竟然将我的手机号153********，泄露给了商家！
# 6L30ItW.txt
# 我的家庭地址是，南京**********，你发的地址对吗？
# A4qDo79.txt
# 我的地址是北京市**********，客服竟然写成了西安市。
# QE7wx1n.txt
# 客服竟然知道了我的身份证号231221************。
# R4TlSMS.txt
# 请将发票，发送到我的邮箱，********@gmail.com。
# teM7IdO.txt
# 请售后尽快联系我，187********，不然我投诉你们！
# VMf5L4x.txt
# 请售后与我联系，132********。
```

对于 PNG 文件，使用 D 盾扫描在 PNG 文件中发现后门：

![使用 D 盾扫描出的恶意 PNG 文件](./img/dsafe-detection-png.png "使用 D 盾扫描出的恶意 PNG 文件")

PNG 这类图像文件藏信息的方式无非是明文数据（元数据、文件尾后藏信息）以及隐写（LSB 等等，不过出题人恐怕不会想这么折磨选手的...），是相对简单的套路。

::: info 复现说明

以下两种文件的判别方式，作者在赛后复盘时根据他人的经验与自己的理解补充在此。

:::

附件中给出的 PDF 文件是一批报销发票，作者在赛场上没直接看出来，甚至提取出了 PDF 上的文本与左上角的二维码来比对，结果还是没有发现猫腻，遗憾离场...

赛后经作者与他人尝试，发现某些文件在部分平台（如 Firefox PDF 查看器、Okular）打开时会弹出弹窗，怀疑是执行了嵌入在 PDF 文件中的 JavaScript 脚本。

可以尝试将这些出问题的 PDF 文件用文本编辑器打开，向下翻找会发现这样的部分：

```plain {8}
19 0 obj
<</JavaScript 20 0 R>>
endobj
20 0 obj
<</Names[(xss)21 0 R]>>
endobj
21 0 obj
<</JS(app.alert\('xss123'\);)/S/JavaScript>>
endobj
```

由于部分 PDF 解析库支持执行 JavaScript 脚本，因此 `/JS` 标签部分中的内容也会被执行，从而出现弹窗，在此可以理解为恶意代码。

这样一来，可以用 Linux 环境下的 `grep` 工具来快速查找：

```sh
grep -arHc "/JS" *.pdf
```

其他类似的可疑字符串也可以这样搜索出来。果然是占了一大部分啊...

对于 MP3 文件，作者最先想到的是逐个查看波形，但并没有实质性的进展。直到从其他师傅了解到其数据中藏有信息，需要使用特定工具进行解析与提取。

答案（部分）：

```sh
24HZjcP.txt
6L30ItW.txt
A4qDo79.txt
QE7wx1n.txt
teM7IdO.txt
VMf5L4x.txt
R4TlSMS.txt
0zgd83izt5sj.png
79n8p6uy96ha.png
# 后期附加的 PDF 文件
4KPA87S5.pdf
DWPL1FRU.pdf
GJ8B8B39.pdf
J1SPVNSM.pdf
PKZW689R.pdf
X9T760QL.pdf
Z9BRTKK4.pdf
```
