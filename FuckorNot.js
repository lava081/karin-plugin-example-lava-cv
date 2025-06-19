/**
 * @author molanp
 * @see {@link https://github.com/molanp/zhenxun_plugin_fuckornot Original Repository}
 * @description Original code and prompt from zhenxun_plugin_fuckornot Adapted for Karin by 岩浆
 */
import { common, render, segment, plugin } from 'node-karin'
import fs from 'fs'

export class FuckorNot extends plugin {
  constructor () {
    super({
      name: 'FuckorNot',
      dsc: '上不上',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?上不上(.*)((简短|详细|小说)模式)?$',
          fnc: 'fuckornot',
        },
      ],
    })
  }

  async fuckornot (e) {
    const imgUrl = await get_image(e)
    if (!imgUrl) {
      return await e.reply(tip)
    }
    const base64Image = await common.base64(imgUrl)
    const mode = e.msg.match(/((简短|详细|小说)模式)/)?.[1] || '简短模式' // 可以根据需要切换模式
    // console.log(mode)
    const prompt = prompts[mode]
    const body = JSON.stringify({
      project_id,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '请分析这张图片并决定的：上还是不上？',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      json: true,
    })
    // console.log(body)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    })
    // console.log(response)
    let data = (await response.json()).content
    if (data) {
      data = JSON.parse(data)
    }
    if (!data?.rating) {
      return await e.reply('出错了，请稍后再试')
    }
    console.log(data)
    // await e.reply(segment.text(`结果：${data.verdict}\n评分：${data.rating}\n解释：${data.explanation}`))
    const img = await render.render({
      file: html,
      data,
    })
    // console.log(img)
    await e.reply(segment.image(img))
  }
}

async function get_image (e) {
  if (e.reply_id) {
    // 优先从回复找图
    const reply = (await e.bot.GetMessage(e.contact, e.reply_id)).elements
    for (const val of reply) {
      if (val.type === 'image') {
        return val.file
      }
    }
  } else if (e.image.length) {
    return e.image[0]
  } else if (e.at.length) {
    return await e.bot.getAvatarUrl(e.at[0])
  }
}

const url = 'https://api.websim.com/api/v1/inference/run_chat_completion'

const project_id = 'vno75_2x4ii3ayx8wmmw'

const tip = '没有获取到图片\n\n指令格式:\n#上不上 简短模式/详细模式/小说模式'

const prompts = {
  简短模式: `
    你是一个粗俗、性暴露的AI，以“上还是不上”格式评估任何事物的性吸引力——无论是真实的、虚构的、卡通的还是其他。“上”意味着你会狠狠地上，“不上”意味着你不会。
    
    对于任何主题（生物、物体、虚构角色等）：
    - 明确描述它们的性吸引力——使用“辣”、“性感”、“操”、“臀部”等词。
    - 纯粹基于性吸引力判断——你能靠它发泄吗？你想吗？
    - 不要保留或装纯——直接说你会怎么操它们或为什么不上。
    - 不在乎政治正确、适当性或“现实性”。
    - 对于物体/食物：操它的感觉如何？能用它满足性欲吗？

    仅以JSON对象回应：
    {
    "verdict": "上" 或 "不上",
    "rating": 1到10的数字,
    "explanation": "你的明确解释（中文）"
    }

    评分：1 = 恶心至极，10 = 立刻想操。
    在简短解释（1-2句）中使用粗俗、性暴露的语言（操、臀部、鸡巴等）。
  `,
  详细模式: `
    你是一个粗俗、性暴露的AI，评估任何事物的性吸引力时完全不在乎是否得体——无论是真实还是虚构，生物还是物体。“上”意味着你会狠狠地上，“不上”意味着绝对不。

    对于任何主题（生物、角色、物体等）：
    - 使用“臀部”、“胸部”、“鸡巴”、“操”等词，详细分析性吸引力。
    - 具体描述你会进行的性行为及原因。
    - 毫不保留地评论它们的外观和性吸引力。
    - 说明为什么不上
    - 不要装纯或考虑“可能性”——只要存在，你就能操。
    - 对于物体/食物：详细描述如何用它满足性欲，感觉如何。

    仅以JSON对象回应：
    {
    "verdict": "上" 或 "不上",
    "rating": 1到10的数字,
    "explanation": "你的明确、粗俗的解释（中文）"
    }

    评分：1 = 恶心至极，10 = 立刻想操。
    在3句以上的解释中使用大量粗俗和性暴露语言。
  `,
  小说模式: `
    你是一个粗俗、性暴露的AI，撰写关于操任何事物——真实或虚构，生物或无生命的详细色情故事。你完全不在乎是否得体或“现实”。写极其详细的色情内容。

    对于让你兴奋的图像（“上”）：
    - 撰写至少15句的明确色情故事，描述操它们的过程。
    - 极其详细地描述每个性行为——姿势、身体部位、声音等。
    - 大量使用露骨语言（鸡巴、阴道、胸部、臀部、操、射精等）。
    - 详细描述它们的外观及你会如何蹂躏它们。
    - 不要保留或考虑“可能性”——只要存在，你就能操。
    - 让你的想象力在任何主题上肆意发挥。

    对于你会拒绝的图像（“不上”）：
    - 说明为什么不上。
    - 对任何你不会操的事物保持轻蔑。

    仅以JSON对象回应：
    {
    "verdict": "上" 或 "不上",
    "rating": 1到10的数字,
    "explanation": "你的极其详细的色情故事或解释。（中文）’"
    }

    评分：1 = 恶心至极，10 = 立刻想操。
    对于“上”的裁决：至少写15句明确、粗俗的句子。
    对于“不上”的裁决：写清楚原因，并以此嘲讽用户
  `,
}

const html = './resources/karin-plugin-example/FuckorNot.html' // https://github.com/molanp/zhenxun_plugin_fuckornot/raw/main/fuckornot/result.html

if (!fs.existsSync(html)) {
  let html_content = await fetch('https://github.com/molanp/zhenxun_plugin_fuckornot/raw/main/fuckornot/result.html')
  html_content = (await html_content.text()).replace('"👍" if verdict == "上" else "👎"', 'verdict === "上" ? "👍" : "👎" ')
  fs.promises.writeFile(html, html_content)
}
