import { plugin, segment, Cfg } from 'node-karin'
export class find_Master extends plugin {
  constructor () {
    super({
      name: '找主人',
      dsc: '帮走丢的机器人找到回家的路',
      event: 'message',
      priority: 10,
      rule: [
        {
          reg: '^#?你主人是谁$',
          fnc: 'like',
        },
      ],
    })
  }

  async like () {
    const msg = []
    msg.push(segment.text('我的主人是'))
    Cfg.master.forEach((master) => {
      if (Number(master)) {
        msg.push(segment.text('\n'))
        msg.push(segment.at(+master))
        msg.push(segment.text(`(${master})`))
      }
    })
    Cfg.admin.forEach((master) => {
      if (Number(master)) {
        msg.push(segment.text('\n'))
        msg.push(segment.at(+master))
        msg.push(segment.text(`(${master})`))
      }
    })
    await this.reply(msg)
  }
}
