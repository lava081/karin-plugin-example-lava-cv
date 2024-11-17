import { plugin, segment, logger } from 'node-karin'
import { exec } from 'child_process'

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
          fnc: 'run_js',
          permission: 'admin',
        },
      ],
    })
  }

  /**
   * 支持在指令末尾添加 `-path=xxx` 来指定工作目录
   */
  async run_command (e) {
    const cmd = e.msg.replace(/^#?rc/, '').replace(/-path=(.*)$/, '').trim()
    const path = e.msg.match(/-path=(.*)$/)?.[1]
    this.reply(segment.text('正在执行：' + cmd))
    const result = await Cmd(cmd, path)
    return this.reply(segment.text(String(result).trim()))
  }

  async run_js (e) {
    const js = e.msg.replace(/^#?rjs/, '').trim()
    this.reply(segment.text('正在执行js：' + js))
    let result = await Js(js, e)
    if (typeof result === 'object') {
      result = JSON.stringify(result, null, 2)
    }
    return this.reply(segment.text(String(result).trim()))
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
