import { plugin, segment, logger, render } from 'node-karin'
import { exec } from 'child_process'
import fs from 'fs'

export class CommandRunner extends plugin {
  constructor () {
    super({
      name: '命令执行器',
      desc: '执行命令',
      event: 'message',
      priority: 100,
      rule: [
        {
          reg: /^#?rc/,
          fnc: 'run_command',
          permission: 'admin',
        },
        {
          reg: /^#?rjs/,
          fnc: 'run_command',
          permission: 'admin',
        },
      ],
    })
  }

  /**
   * 支持在指令末尾添加 `-path=xxx` 来指定工作目录，由于目录可能存在空格，该参数必须放在最后
   * 支持添加 `-msg=xxx` 来指定命令的编码方式，可选'base64'，默认为文本
   * 支持添加 `-reply=xxx` 来指定回复内容的编码方式，可选'base64'，默认为文本
   */
  async run_command (e) {
    let cmd = e.msg.replace(/^#?rc/, '').replace(/^#?rjs/, '').replace(/-path=(.*)$/, '').replace(/-reply=([^\s]*)/, '').trim()
    const path = e.msg.match(/-path=(.*)$/)?.[1]
    const reply_type = e.msg.match(/-reply=([^\s]*)/)?.[1]
    if (cmd.includes('-msg=base64')) {
      cmd = (Buffer.from(cmd.replace(/-msg=base64/, '').trim(), 'base64')).toString()
      this.reply(segment.text('解码成功，正在执行'))
    } else {
      this.reply(segment.text('正在执行：' + cmd))
    }
    let result = /^#?rc/.test(e.msg) ? await Cmd(cmd, path) : await Js(cmd, e)
    if (typeof result === 'object') {
      result = JSON.stringify(result, null, 2)
    } else if (String(result) === '') {
      result = 'null'
    }
    switch (reply_type) {
      case 'base64': {
        this.reply(segment.text(Buffer.from(String(result).trim(), 'utf-8').toString('base64')))
        break
      }
      case 'image': {
        const img = await render.render({
          file: './resources/karin-plugin-example/Cmd.html',
          data: {
            result: String(result).trim(),
          },
        })
        this.reply(segment.image(img))
        break
      }
      default: {
        this.reply(segment.text(String(result).trim()))
        break
      }
    }
  }
}

/**
 * 执行命令
 * @param {string} cmd 命令
 * @param {string} cwd 工作目录
 */
async function Cmd (cmd, cwd = process.cwd()) {
  return new Promise((resolve) => {
    exec(cmd, { cwd, stdio: 'inherit' }, (error, stdout, stderr) => {
      const info = error ? error.message : (stderr || stdout)
      logger.info(info)
      resolve(info)
    })
  })
}

/**
 * 执行js语句
 * @param {string} cmd js语句
 * @param {KarinMessageType} e
 */
async function Js (cmd, e) {
  try {
    // eslint-disable-next-line no-eval
    const result = await eval(cmd)
    logger.info(result)
    return result
  } catch (error) {
    logger.warn(error)
    return error.message || error
  }
}

/**
 * HTML模板
 */
const html = `<!DOCTYPE html>
<head>
  <meta charset="UTF-8">
  <style>
    .output {
      white-space: pre-wrap; /* 保留空格和换行 */
    }
  </style>
</head>
<body>
  <div class="output">{{result}}</div>
</body>
</html>
`

if (!fs.existsSync('./resources/karin-plugin-example/Cmd.html')) {
  fs.writeFile('./resources/karin-plugin-example/Cmd.html', html, (err) => {
    if (err) {
      logger.error(err)
    }
  })
}
