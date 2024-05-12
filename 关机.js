import { App, segment } from '#Karin'

const app = App.init({
  name: '关机',
  priority: -99
})
app.reg({
  reg: '^#?关机$',
  permission: 'master',
  fnc: 'shutdown',
  async shutdown () {
    await this.reply(segment.text(`本次运行${uptime()}\n已关机✔`), { reply: true })
    process.exit()
  }
})

function uptime () {
  let uptime = process.uptime()
  let [day, hour, minute] = [86400, 3600, 60].map(unit => {
    let value = Math.floor(uptime / unit)
    uptime %= unit
    return value
  })
  return `${day}天${hour}小时${minute}分钟`
}

export const shutdown = app.plugin(app)
