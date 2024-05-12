import { App, segment } from '#Karin'
import os from 'os'
import fs from 'fs'

const app = App.init({
  name: '本机状态',
  priority: -2
})
app.reg({
  reg: '^#?(状态|status)$',
  permission: 'master',
  fnc: 'status',
  async status () {
    await this.reply(segment.text(`${getCpuInfo()}\n\n内存占用：${getMemoryUsage()}\n\n存储占用：${await getDiskUsage() || '未知'}\n\n系统：${getSystemInfo()}\n\n运行时间：${formatTime(os.uptime())}`))
    return false
  }
})

function getCpuInfo () {
  // 获取CPU平均负载
  const usage = os.loadavg()

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
    usagetimes.push(`  核心${index}：${((totalTime - times.idle) / totalTime * 100).toFixed(2)}%`)
  })

  return `CPU负载(根据进程数)：${(usage[0] * 100).toFixed(2)}%\nCPU使用率(根据空闲时间)：\n${usagetimes.join('\n')}\nCPU型号：\n${cpuInfo[0].model}`
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

function formatBytes (bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

function formatTime (uptime) {
  let [day, hour, minute] = [86400, 3600, 60].map(unit => {
    let value = Math.floor(uptime / unit)
    uptime %= unit
    return value
  })
  return `${day}天${hour}小时${minute}分钟`
}

export const status2 = app.plugin(app)
