import { segment, plugin } from 'node-karin'

export class RandomWife extends plugin {
  constructor () {
    super({
      name: '随机老婆',
      dsc: '随机选中一位倒霉群友当老婆',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#?随机老婆$/,
          fnc: 'randomWife'
        }
      ]
    })
  }

  async randomWife (e) {
    if (!e.isGroup) return await e.reply('别找了，我就你老婆呀，真笨💕')
    const gml = await e.bot.GetGroupMemberList(e.group_id)
    const m = gml[Math.floor(Math.random() * gml.length)]
    const res = [
      segment.text('你的群CP是'),
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${m.uin}`),
      segment.text(`【${m.card || m.nick}】(${m.uin})\n看好她哦，别让她乱跑~`)
    ]
    await e.reply(res, { at: true })
  }
}
