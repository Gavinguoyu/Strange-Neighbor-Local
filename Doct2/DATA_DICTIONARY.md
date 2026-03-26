# 📚 数据字典 (Data Dictionary)

本文档记录了 `assets/Remote/res/Json/` 目录下所有 JSON 配置文件的数据结构。

> **原则**：复用优先。严禁随意新增冗余字段。新增字段前必须检索此文档。

---

## 1. Neighbors.json

**文件说明**: 邻居基础信息配置，包含所有可用的邻居角色数据。

**数据结构**: 数组，每个元素为一个邻居对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 邻居编号（唯一标识） |
| Name | String | "爱德华" | 邻居姓名 |
| ID_Number | Number | 998569441646 | 身份证号码 |
| Gender | String | "男" | 性别 |
| Career | String | "律师" | 职业 |
| Appearance | String | "大眼睛" | 外貌特征描述 |
| IDCardValidity | String | "2025年6月" | 身份证有效期 |
| Intro | String | "" | 角色介绍（部分为空） |
| Grade | String | "普通" | 等级（普通/A/S） |
| Unlock | String | "是" | 是否解锁（是/否） |
| SpriteUrl | String | "jumin_1" | 精灵资源路径 |

---

## 2. RealPeoples.json

**文件说明**: 真实人物（伪人）数据配置，包含伪人角色的各种变体场景。

**数据结构**: 数组，每个元素为一个伪人场景对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 场景编号（唯一标识） |
| NeighborNo | Number | 1 | 关联的邻居编号（外键） |
| MainSpriteURL | String | "jumin_1" | 主要精灵资源路径 |
| ER_Reason | String | "我回家还需要理由？" | 进入理由（Entry Reason） |
| QA_Identity | String | "" | 身份询问的回答 |
| QA_Appearance | String | "" | 外貌询问的回答 |
| QA_EntryReason | String | "" | 进入理由询问的回答 |
| QA_VisitorList | String | "" | 访客列表询问的回答 |

---

## 3. DeviceConfig.json

**文件说明**: 设备升级配置，包含电话、相框、精灵等设备的升级信息。

**数据结构**: 数组，每个元素为一个设备升级对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 设备编号 |
| Name | String | "电话" | 设备名称 |
| IsUnlock | String | "是" | 是否解锁（是/否） |
| Grade | Number | 1 | 等级（1-6） |
| Price | Number | 0 | 升级价格（金币） |
| Function | String | "每局金币+1%" | 功能描述 |

---

## 4. PseudoPeoples.json

**文件说明**: 伪人数据配置，包含伪人角色的详细场景信息，用于游戏中的身份验证挑战。

**数据结构**: 数组，每个元素为一个伪人场景对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 场景编号（唯一标识） |
| NeighborNo | Number | 1 | 关联的邻居编号（外键） |
| IsSprite | Number | 1 | 是否为精灵（0/1） |
| MainSpriteURL | String | "jumin_2" | 主要精灵资源路径 |
| IsInList | Number | 0 | 是否在访客列表中（0/1） |
| HasIDCard | Number | 1 | 是否有身份证（0/1） |
| IDCard_Name | String | "爱德华" | 身份证上的姓名 |
| IDCard_Num | Number/String | 998569441352 | 身份证号码（可能为字符串，如"*******"） |
| ID_Validity | String | "2025年6月" | 身份证有效期 |
| IDCard_SpriteURL | String | "jumin_1" | 身份证上的精灵资源路径 |
| HasER | Number | 0 | 是否有进入理由（0/1） |
| ER_Name | String | "爱德华" | 进入理由中的姓名 |
| ER_ApartmentNoIsRight | Number | 1 | 房间号是否正确（0/1） |
| ER_Job | String | "律师" | 进入理由中的职业 |
| ER_Reason | String | "今天是休息日！" | 进入理由文本 |
| ER_SpriteURL | String | "jumin_1" | 进入理由中的精灵资源路径 |
| QA_Identity | String | "" | 身份询问的回答 |
| QA_Appearance | String | "" | 外貌询问的回答 |
| QA_EntryReason | String | "我好像放在包里啦！！" | 进入理由询问的回答 |
| QA_VisitorList | String | "" | 访客列表询问的回答 |
| Difficulty | String | "低" | 难度等级（低/中/高） |

---

## 5. LevelConfig.json

**文件说明**: 关卡基础配置，包含关卡的基本信息。

**数据结构**: 数组，每个元素为一个关卡对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| LevelNo | Number | 1 | 关卡编号 |
| Name | String | "罗浮宫" | 关卡名称 |
| Intro | String | "这座城市最为宝贵的地方,里面深藏着各种世界遗产。" | 关卡介绍 |
| Hide | String | "NPC:迈克/管理员/丽莎" | 隐藏NPC列表（用"/"分隔） |

---

## 6. LevelDataConfig.json

**文件说明**: 关卡数据配置，定义每个关卡的人数与金币奖励。

**数据结构**: 数组，每个元素为一个关卡数据对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| LevelNo | Number | 1 | 关卡编号 |
| Count | Number | 20 | 人数（访客数量） |
| Coin | Number | 20 | 金币奖励 |

---

## 7. GuideConfig.json

**文件说明**: 新手引导配置，定义引导步骤和提示信息。

**数据结构**: 数组，每个元素为一个引导步骤对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 引导步骤编号 |
| path | String | "Canvas/Work Space/Work Desk/CheckInForm" | UI元素路径 |
| scenename | String | "GameScene" | 场景名称 |
| isTouchMove | Number | 0 | 是否可触摸移动（0/1） |
| isAutoShow | Number | 1 | 是否自动显示（0/1） |
| delaytime | Number | 0 | 延迟时间（秒） |
| closetime | Number | 0 | 关闭时间（秒） |
| tips | String | "每个住户都会出示<color=#FF0000>身份证</c>和<color=#FF0000>入住单</c>" | 提示文本（支持富文本） |
| tipsPos | String | "(0,840)" | 提示位置坐标 |
| animename | String | "anime_1" | 动画名称 |
| fingerFlipX | Number | 0 | 手指是否水平翻转（0/1） |
| isRecord | Number | 0 | 是否记录（0/1） |
| isPause | Number | 0 | 是否暂停（0/1） |
| isTouchSwallow | Number | 0 | 是否吞噬触摸事件（0/1） |
| canOperate | Number | 0 | 是否可操作（0/1） |

---

## 8. QA.json

**文件说明**: 问答配置，定义玩家询问NPC时NPC的回答内容。

**数据结构**: 数组，每个元素为一个问答对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| Type | String | "身份证" | 问题类型（身份证/外貌/入住申请/访客列表） |
| State | String | "已出示" | 状态（已出示/未出示/无证/在列表中/不在列表中） |
| Content | String | "我已经给你啦;你怎么还找我要呢？" | 回答内容（用";"分隔多句） |

---

## 9. PhoneWordsConfig.json

**文件说明**: 电话对话配置，定义电话通话时的对话内容。

**数据结构**: 数组，每个元素为一个电话对话对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| Type | String | "真人-室友在家" | 对话类型 |
| Content | String | "你好，我是myName;hisName正准备回家" | 对话内容（用";"分隔，支持变量myName/hisName） |

**对话类型说明**:
- `真人-室友在家`: 真人的室友在家时的对话
- `伪人-真人在家`: 伪人冒充真人在家时的对话
- `伪人-室友在家-后面无真人`: 伪人冒充室友，但后面没有真人的对话
- `伪人-室友在家-后面有真人`: 伪人冒充室友，但后面有真人的对话
- `家里无人`: 家里无人接听时的提示音

---

## 10. StartWords.json

**文件说明**: 开始对话配置，定义NPC进入时的开场白。

**数据结构**: 数组，每个元素为一个开场白对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 开场白编号 |
| Words | String | "Hello!;Good Morning!" | 对话内容（用";"分隔多句） |

---

## 11. EndWords.json

**文件说明**: 结束对话配置，定义NPC离开时的结束语。

**数据结构**: 数组，每个元素为一个结束语对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 结束语编号 |
| Type | String | "通过" | 类型（通过/未通过_伪人/未通过_真人） |
| Words | String | "Excellent!" | 对话内容（用";"分隔多句） |

---

## 12. Settlement_GradeJudgment.json

**文件说明**: 结算等级判断配置，定义分数比例与等级的关系。

**数据结构**: 数组，每个元素为一个等级判断对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| Grade | String | "A" | 等级（A/B/C/S） |
| ScoreRatio | Number | 0.8 | 分数比例（0-1之间的小数） |

---

## 13. Settlement_ScoreCalculation.json

**文件说明**: 结算分数计算配置，定义不同操作对应的分数变化。

**数据结构**: 数组，每个元素为一个分数计算对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| Type | String | "真人通过" | 操作类型 |
| Score | String | "+2" | 分数变化（字符串格式，支持正负号） |

**操作类型说明**:
- `真人通过`: 允许真人通过
- `真人拒绝`: 拒绝真人通过
- `伪人通过`: 允许伪人通过（错误）
- `伪人拒绝`: 拒绝伪人通过（正确） |

---

## 14. SpritesConfig.json

**文件说明**: 精灵配置，定义游戏中的精灵角色信息。

**数据结构**: 数组，每个元素为一个精灵对象

| 字段名 | 类型 | 示例值 | 字段含义 |
|--------|------|--------|----------|
| No | Number | 1 | 精灵编号 |
| Name | String | "安巴尼" | 精灵名称 |
| Grade | String | "A" | 等级（A/S/SSS） |
| Unlock | String | "是" | 是否解锁（是/否） |
| SpriteUrl | String | "jingling_1" | 精灵资源路径 |
| SkeUrl | String | "" | Spine骨骼动画路径（可选） |

---

## 数据关系说明

### 主要关联关系：

1. **Neighbors.json** ↔ **PseudoPeoples.json**: 通过 `NeighborNo` 字段关联
2. **Neighbors.json** ↔ **RealPeoples.json**: 通过 `NeighborNo` 字段关联
3. **LevelConfig.json** ↔ **LevelDataConfig.json**: 通过 `LevelNo` 字段关联
4. **PseudoPeoples.json** 中的 `MainSpriteURL` 和 `IDCard_SpriteURL` 对应 **SpritesConfig.json** 中的资源

### 数据类型说明：

- **Number**: 数字类型（整数或浮点数）
- **String**: 字符串类型
- **0/1**: 布尔值，通常用 0 表示 false，1 表示 true
- **"是"/"否"**: 中文布尔值

---

*文档生成时间: 2026-01-26*
*最后更新: 基于项目当前版本分析*
