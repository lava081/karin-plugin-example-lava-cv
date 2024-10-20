import { Cfg, plugin, segment, common, logger, Bot } from 'node-karin'
import os from 'os'
import fs from 'fs'

export class TrafficMonitor extends plugin {
  constructor () {
    super({
      name: '本机状态',
      dsc: '查看系统占用的无额外依赖临时方案',
      priority: 100,
      rule: [
        {
          reg: /^#状态$/,
          fnc: 'status',
        },
        {
          reg: /^#?账号列表$/,
          fnc: 'accounts',
        },
      ],
    })
  }

  async status (e) {
    await this.reply(segment.text(`${await getCpuInfo()}\n\n内存：${getMemoryUsage()}\n\n存储：${await getDiskUsage() || '未知'}\n\n系统：${getSystemInfo()}\n开机时长：${formatTime(os.uptime())}\n\n${await getVersion(e)}`))
    this.accounts()
    return false
  }

  async accounts () {
    await this.reply(segment.text(await getAccounts()))
    return false
  }
}

async function getAccounts () {
  const accounts = await Bot.getBotAll(true)
  const accountList = accounts.map(account => `-> 适配器${account.index} <-\n\t昵称：${account.bot.account.name || '???'}\n\t账号：${account.bot.account.uin || account.bot.account.uin || '???'}\n\t适配器：${account.bot.version.app_name || account.bot.version.name || '???'}-v${account.bot.version.version || '?'}\n\t连接时长：${formatTime((Date.now() - account.bot.adapter.start_time) / 1000)}`)
  return accountList.join('\n\n')
}

async function getCpuInfo () {
  const cpu_time_current = []
  // 获取CPU平均负载
  const usage = os.loadavg()

  const cpu_time_0 = getCpuTime()
  await common.sleep(1000)
  const cpu_time_1 = getCpuTime()

  cpu_time_1.forEach(cpu => {
    cpu_time_current.push(`  核心${cpu.id}：${(((cpu.total - cpu_time_0[cpu.id].total) - (cpu.idle - cpu_time_0[cpu.id].idle)) / (cpu.total - cpu_time_0[cpu.id].total) * 100).toFixed(2)}%`)
  })

  return `CPU负载(根据进程数)：${(usage[0] * 100).toFixed(2)}%\nCPU使用率(根据空闲时间)：\n${cpu_time_current.join('\n')}\nCPU型号：\n${cpu_time_1[0].model}`
}

function getCpuTime () {
  const usagetimes = []

  // 获取CPU核心信息
  const cpuInfo = os.cpus()
  cpuInfo.forEach((core, index) => {
    // 计算总时间
    let totalTime = 0
    const times = core.times
    Object.values(times).forEach(time => {
      totalTime += time
    })
    usagetimes.push({ id: index, idle: times.idle, total: totalTime, model: core.model })
  })
  return usagetimes
}

function getMemoryUsage () {
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  return `${formatBytes(totalMemory - freeMemory)} / ${formatBytes(totalMemory)}`
}

async function getDiskUsage () {
  const diskPath = '/' // 你要检查的硬盘路径
  const stats = await fs.promises.statfs(diskPath)
  const totalDiskSpace = stats.blocks * stats.bsize
  const freeDiskSpace = stats.bfree * stats.bsize
  return `${formatBytes(totalDiskSpace - freeDiskSpace)} / ${formatBytes(totalDiskSpace)}`
}

function getSystemInfo () {
  return `${os.type()}-${os.release()}_${os.machine()}`
}

async function getVersion (e) {
  let adapter = {}
  try {
    adapter = await e.bot.GetVersion()
  } catch (error) {
    logger.error('获取适配器版本失败' + error)
  }
  return `框架：${Cfg.package.name}-v${Cfg.package.version}\n适配器：${adapter.app_name || adapter.name || '???'}-v${adapter.version || '?'}`
}

function formatBytes (bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

function formatTime (uptime) {
  const [day, hour, minute] = [86400, 3600, 60].map(unit => {
    const value = Math.floor(uptime / unit)
    uptime %= unit
    return value
  })
  return `${day > 0 ? `${day}天` : ''}${(day > 0 || hour > 0) ? `${hour}时` : ''}${minute}分`
}
