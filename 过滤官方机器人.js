import karin from 'node-karin'
export const ignore_bot = karin.command('', async (e) => {
  // 按号码段过滤群机器人
  if (e.at.some(at => (at > 2854000000 && at < 2855000000))) {
    return
  } else if (e.at.some(at => (at > 3889000000 && at < 3890000000))) {
    return
  } else {
    return false
  }
}, {
  name: '过滤官方群机器人',
  priority: -99,
  log: false
})