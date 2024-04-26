import { segment, plugin } from '#Karin'

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
    const gml = await e.bot.GetGroupMemberList({ group_id: e.group_id })
    const m = gml[Math.floor(Math.random() * gml.length)]
    const sex = m.sex === 'male' ? '他' : '她'
    const res = [
      segment.text('你的群CP是'),
      segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${m.user_id}`),
      segment.text(`【${m.nickname}】(${m.user_id})\n看好${sex}哦，别让${sex}乱跑~`)
    ]
    await e.reply(res, { at: true })
  }
}
