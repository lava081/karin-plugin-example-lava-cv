import { segment, plugin, redis } from 'node-karin'

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
          fnc: 'randomWife',
        },
      ],
    })
  }

  async randomWife (e) {
    if (e.bot.adapter.id === 'QQBot') return this.randomWife_qqbot(e)
    if (!e.isGroup) return await e.reply('别找了，我就你老婆呀，真笨💕')
    const gml = await e.bot.GetGroupMemberList(e.group_id)
    const m = gml[Math.floor(Math.random() * gml.length)]
    const res = [
      segment.text('你的群CP是'),
      segment.image(e.bot.getAvatarUrl(m.uin)),
      segment.text(`【${m.card || m.nick}】(${m.uin})\n看好她哦，别让她乱跑~`),
    ]
    await e.reply(res, { at: true })
  }

  async randomWife_qqbot (e) {
    const today = (new Date()).getDate()
    let count = 0
    const group_key = `random_wife:${e.self_id}:${e.group_id}:`
    const member = await redis.get(group_key + e.user_id)
    if (member && member.split(':')[1] === today) {
      count = Number(member.split(':')[0])
    }
    count++
    await redis.set(group_key + e.user_id, `${count}:${today}`)
    const gml = await redis.keys(group_key + '*')
    const m = gml[Math.floor(Math.random() * gml.length)]
    const res = [
      segment.text('你的群CP是：\n'),
      segment.image(e.bot.getAvatarUrl(m.replace(group_key, ''))),
    ]
    await e.reply(res, { at: true })
  }
}
