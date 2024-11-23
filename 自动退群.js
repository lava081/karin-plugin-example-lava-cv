import { segment, karin, logger, Cfg, YamlEditor } from 'node-karin'
/** 允许的禁言时间 */
const ACCEPTABLE_DURATION_MAX = 6 * 60 * 60

/** 被禁言超过允许的禁言时间则退群并加入黑名单 */
export const AutoExitWhenBaned = karin.accept('notice.group_member_ban',
  async (e) => {
    if (e.content.target_uid === e.self_id && e.content.operator_uid !== e.content.target_uid && e.content.duration >= ACCEPTABLE_DURATION_MAX) {
      const msg = `在群【${e.content.group_id}】被【${e.content.operator_uid}】禁言了${format_time(e.content.duration)}，自动退群并拉黑群`
      add_to_black_list(e, msg)
      await e.bot.LeaveGroup(e.content.group_id)
    } else { return false }
  },
  {
    name: '自动退群:被恶意禁言',
    priority: 100,
  }
)

/** 被动退群则加入黑名单 */
export const AutoExitWhenKicked = karin.accept('notice.group_member_decrease',
  async (e) => {
    console.log(e)
    if (e.content.type === 'kick_me' && e.content.operator_uid !== e.self_id) {
      const msg = `在群【${e.content.group_id}】被【${e.content.operator_uid}】踢出，自动拉黑群`
      add_to_black_list(e, msg)
    } else { return false }
  },
  {
    name: '自动退群:被踢出群聊',
    priority: 100,
  }
)

async function add_to_black_list (e, msg) {
  logger.warn(msg)
  /** 加入黑名单 */
  try {
    if (!Cfg.Config.BlackList.groups.includes(e.content.group_id)) {
      const karin_config = new YamlEditor(Cfg.cfgDir + '/config/config.yaml')
      karin_config.append('BlackList.groups', e.content.group_id)
      karin_config.save()
    }
  } catch (err) { logger.error(err) }
  /** 通知主人和管理员 */
  const masters = Cfg.master.map((master) => karin.contactFriend(master))
  const admins = Cfg.admin.map((admin) => karin.contactFriend(admin))
  for (const contact of masters.concat(admins)) {
    try {
      await karin.sendMsg(e.self_id, contact, segment.text(msg))
    } catch (err) { logger.error(err) }
  }
}

/** 将秒数换算成天时分秒 */
function format_time (seconds) {
  const days = Math.floor(seconds / (24 * 3600))
  seconds %= 24 * 3600
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (seconds > 0) parts.push(`${seconds}秒`)

  return parts.join('')
}
