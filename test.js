/* eslint-disable camelcase */
// import fetch from 'node-fetch'
import { segment, plugin } from '#Karin'

export class example5 extends plugin {
  constructor () {
    super({
      name: '复读',
      dsc: '复读用户发送的内容，然后撤回',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      priority: -5001,
      rule: [
        {
          reg: /^#(语音|视频|图片|大图|卡片|MD|文字|ob|kr)开始(.*)$/s,
          fnc: 'repeat'
        },
        {
          reg: '^#开始$',
          fnc: 'repeat'
        }
      ]
    })
  }

  /** 复读 */
  async repeat (e) {
    const raw_type = e.msg.match(/^#(语音|视频|图片|大图|卡片|MD|文字|ob|kr)?开始/)
    let image_url = 'http://api.yujn.cn/api/chaijun.php?'
    let record_url = 'http://api.yujn.cn/api/maren.php?'
    let video_url = 'https://api.yujn.cn/api/pcfjsp.php?'
    let card_url

    let type = 'all'
    let card_msg
    let md_msg = '八嘎！杂鱼！hentai！萝莉控！'
    switch (raw_type[1]) {
      case '图片': {
        type = 'image'
        image_url = (e.msg.replace(raw_type[0], '')) || image_url
        break
      } case '语音': {
        type = 'record'
        record_url = (e.msg.replace(raw_type[0], '')) || record_url
        break
      } case '视频': {
        type = 'video'
        video_url = (e.msg.replace(raw_type[0], '')) || video_url
        break
      } case '卡片': {
        type = 'card'
        card_msg = (e.msg.replace(raw_type[0], '')) || '{"app":"com.tencent.contact.lua","desc":"","view":"contact","bizsrc":"bot.card_share","ver":"0.0.0.1","prompt":"[机器人] 回家照顾驮兽","appID":"","sourceName":"","actionData":"","actionData_A":"","sourceUrl":"","meta":{"contact":{"nickname":"回家照顾驮兽","avatar":"https://bot-resource-1251316161.file.myqcloud.com/avatar/a07f02a8-25a9-4e84-9243-acda40ff78e06060494031085614394?ts=1698244449","contact":"提供原神/星铁攻略、资讯和面板查询","tag":"机器人","tagIcon":"https://tangram-1251316161.file.myqcloud.com/files/20230420/b8156a6e9f6f326d4a31f46413a1f007.png","jumpUrl":"https://web.qun.qq.com/qunrobot/data.html?robot_uin=2854216359&_wwv=130&_wv=3"}},"config":{"autosize":0,"collect":1,"ctime":1702159269,"forward":1,"height":225,"reply":1,"round":1,"token":"af34d6ea7d22e90413a959634f23215a","type":"normal","width":526},"text":"","extraApps":[],"sourceAd":"","extra":""}'
        card_msg = JSON.stringify(JSON.parse(card_msg))
        break
      } case '大图': {
        type = 'card'
        card_url = (e.msg.replace(raw_type[0], '')) || image_url
        let yx = '[图片]'
        let bt = ''
        let bt2 = ''

        // 第一步：使用空格分割字符串成一维数组
        let arr1D = card_url.split(' ')
        let pair = []

        // 第三步：遍历一维数组中的每个元素
        for (let i = 0; i < arr1D.length; i++) {
          // 第四步：使用冒号分割每个元素，并将其作为新的子数组推送到二维数组中
          pair = arr1D[i].split('：')
          switch (pair[0]) {
            case '外显': yx = pair[1]; break
            case '大标题': bt2 = pair[1]; break
            case '小标题': bt = pair[1]; break
            case '': break
            default: card_url = pair[0]; break
          }
        }
        if (e.adapter != 'QQBot') {
          // let a
          // let url_type = ''
          // if (card_url.match(/gchat\.qpic\.cn/)) { a = 'a' } else {
          //   a = 'a2'
          //   if (card_url.match(/\?/)) { url_type = '2' }
          // }

          // card_msg = await fetch(`https://api.lolimi.cn/API/ark/${a}.php?img=${card_url}&bt=${bt}&bt2=${bt2}&yx=${yx}&type=${url_type}`, { method: 'GET' })
          // card_msg = await card_msg.json()
          // console.log(card_msg)
        } else {
          type = 'md'
          const params = []
          if (bt2 != '') { params.push({ key: 'text_0', values: [`\r#${bt2}`] }) }
          params.push({ key: 'text_1', values: [`![${yx} #0px #0px`] })
          params.push({ key: 'text_2', values: [`](${card_url})`] })
          if (bt != '') { params.push({ key: 'text_3', values: [`\r\r>\r${bt}`] }) }
          md_msg = {
            type: 'markdown',
            custom_template_id: e.bot.config.markdown.id,
            params
          }
        }
        break
      } case 'MD': {
        type = 'md'
        let md_url = e.msg.replace(raw_type[0], '').replace(/\\n/g, '\r').replace(/\\r/g, '\r').replace(/--r/g, '\r') || md_msg
        let button = md_url.match(/--b(.*)/) || md_url.match(/\\b(.*)/) || ['', '[]']
        md_url = md_url.replace(/--b(.*)/g, '').replace(/\\b(.*)/g, '')
        button = JSON.parse(button[1])
        md_msg = [segment.markdown(md_url)]
        if (e.bot.version.app_name === 'Lagrange.OneBot') {
          md_msg = segment.markdown(JSON.stringify({ content: md_url }))
          if (button.length > 0) {
            md_msg.push({ type: 'keyboard', data: { content: segment.rows(button) } })
          }
        }
        // if (e.bot.version.app_name == 'QQBot') {
        // // 第一步：使用空格分割字符串成一维数组
        //   let arr1D = md_url.split('：')
        //   const params = []
        //   for (let arr in arr1D) { params.push({ key: `text_${+arr}`, values: [`${arr1D[arr]}`] }) }
        //   logger.info(params)
        //   md_msg = [{
        //     type: 'markdown',
        //     custom_template_id: e.bot.config.markdown.id,
        //     params
        //   }]
        //   if (button.length > 0) { md_msg.push(segment.button(button)) }
        // } else if (e.bot.version.app_name == 'Lagrange.OneBot') {
        //   md_msg = [
        //     segment.markdown(md_url)
        //   ]
        //   if (button.length > 0) {
        //     md_msg.push({
        //       type: 'keyboard',
        //       data: {
        //         content: segment.rows(button)
        //       }
        //     })
        //   }
        //   // md_msg = await common.makeForwardMsg(e, [md_msg], '', true)
        // }
        break
      } case '文字': {
        type = 'md'
        md_msg = e.msg.replace(raw_type[0], '') || md_msg
        try {
          md_msg = JSON.parse(md_msg)
        } catch (error) {
          md_msg = [md_msg]
        }
        if (e.adapter != 'QQBot') {
          md_msg.push('\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B')
        }
        break
      } case 'ob': {
        type = 'ob'
        try {
          const msg = (e.msg.replace(raw_type[0], '') || 'send_group_msg：{"group_id":646247164,"message":[{"type":"text","data":{"text":"test"}}]}').split('：')
          const cmd = msg[0]
          const params = JSON.parse(msg[1])
          const res = await e.bot.SendApi(cmd, params)
          console.log(res)
          await e.reply(JSON.stringify(res))
        } catch (error) {
          console.error(error)
          await e.reply(String(error) == '[object Object]' ? JSON.stringify(error) : String(error))
        }
        break
      } case 'kr': {
        type = 'kr'
        const command = e.msg.replace(raw_type[0], '').trim().split('：')
        let option = command[1]
        if (option) {
          option = option.split(' ')
        } else {
          option = []
        }

        for (let i in option) {
          if (option[i].startsWith('parse')) {
            option[i] = JSON.parse(option[i].replace(/^parse/, ''))
          }
          if (option[i] === 'contact') {
            option[i] = e.contact
          }
        }

        try {
          const res = await e.bot[command[0]](...option)
          console.log(res)
          await e.reply(JSON.stringify(res))
        } catch (error) {
          console.error(error)
          await e.reply(String(error) == '[object Object]' ? JSON.stringify(error) : String(error))
        }
        break
      } case undefined: {
        const msg = '\r\r# 欢迎使用 回家照顾驮兽📌\r***\r\r># 希望你的心情如这绚烂的花朵，每天都充满色彩和活力🌸，生活中的每一刻都值得珍惜与欢笑(˃ ⌑ ˂ഃ )\r>✨温馨提示:机器人拉群和使用完全免费\r✨机器人不断学习进步当中，欢迎反馈改进建议\r\r>#  所有指令均要 @机器人\r\r>✨以下 @ 是有效的:\r1. 长按头像\r2. 输入 / 唤起机器人指令\r3. 输入 @回家照顾驮兽 后点击机器人头像\r✨以下 @ 是无效的:\r1. 复制粘贴的指令\r\r# 以下按钮是可以点击的哦'
        e.reply(msg)
        break
      }
    }
    switch (type) {
      case 'image':
        await this.reply(segment.image(image_url))
        break
      case 'record':
        await this.reply(segment.record(record_url))
        break
      case 'video':
        await this.reply(segment.video(video_url))
        break
      case 'card':
        await this.reply(segment.json(card_msg))
        break
      case 'md':
        await this.reply(md_msg)
        break
      default: break
    }
    await this.reply('查收')
  }
}
