/**
 * @author liuly0322
 * @see {@link https://github.com/liuly0322/l-plugin Original Repository}
 * @description Original code from l-plugin. Adapted for Karin by 岩浆 on 2024.04.27.
 */
import { plugin } from 'node-karin'
import lodash from 'lodash'

export class dice extends plugin {
  constructor () {
    super({
      name: 'roll',
      dsc: 'roll骰子',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^#?roll ',
          fnc: 'roll'
        },
        {
          reg: '^#?r ',
          fnc: 'r'
        }
      ]
    })
  }

  async roll () {
    const choices = this.e.msg.split(' ').slice(1)
    const result = lodash.sample(choices)
    await this.reply(`bot帮你选择：${result}`, { at: true })
  }

  async r () {
    const range = this.e.msg.split(' ').map(Number).filter(Number.isInteger)
    const end = range.pop() ?? 100
    const start = range.pop() ?? 1
    const result = lodash.random(start, end)
    await this.reply(`在${start}和${end}间roll到了：${result}`, { at: true })
  }
}
