import karin, { plugin, segment, logger } from 'node-karin'

export class Megaphone extends plugin {
  constructor () {
    super({
      name: '传声筒',
      desc: '向指定目标发送消息',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#(\d*)(at|AT)?([A-Za-z0-9]*)转发(群|私聊|好友)([A-Za-z0-9]+)(内容)?(.*)/,
          fnc: 'forward',
          permission: 'admin',
        },
      ],
    })
  }

  /**
   * 向单个目标转发单条消息
   * 用例1：#(102073196)(at89B872916A0208EC278F61C9CF139A39)转发群BFE5701CA79A49EA5E60B7D0C798214F(内容这是一条转发消息，用例括号内为可选内容[图片])
   * 效果1：指定通过账号102073196向群BFE5701CA79A49EA5E60B7D0C798214F转发一条消息，内容为“<@89B872916A0208EC278F61C9CF139A39>这是一条转发消息，用例括号内为可选内容[图片]”
   * 用例2：#转发好友2496918369[引用消息]
   * 效果2：通过接收到指令的账号向好友2496918369转发一条消息，内容为引用的消息的内容
   */
  async forward (e) {
    const match = e.msg.match(/^#(\d*)(at|AT)?([A-Za-z0-9]*)转发(群|私聊|好友)([A-Za-z0-9]+)(内容)?(.*)/)
    const bot = match[1] ? match[1] : e.self_id
    const at = match[3]
    const contact = { scene: match[4] === '群' ? 'group' : 'friend', peer: match[5] }
    const elements = []
    if (at) {
      elements.push(segment.at(at))
    }
    if (e.reply_id) {
      elements.push(...((await e.bot.GetMessage(e.contact, e.reply_id)).elements))
      elements.forEach(element => {
        if (element.type === 'image') {
          element.file = element.file.replace('https://multimedia.nt.qq.com.cn', 'http://multimedia.nt.qq.com')
        }
      })
    }
    if (match[7]) {
      elements.push(segment.text(match[7]))
    }
    if (e.image.length) {
      e.image.forEach(image => {
        elements.push(segment.image(image))
      })
    }
    try {
      karin.sendMsg(bot, contact, elements)
    } catch (error) {
      logger.error(error.stack || error.message || error)
      return this.reply(segment.text('转发失败'))
    }
    return this.reply(segment.text(`转发成功 ${bot}:${contact.scene}:${contact.peer}`))
  }
}
