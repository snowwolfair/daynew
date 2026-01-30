import { Context, Schema } from "koishi";
import {} from "koishi-plugin-cron";

export const name = "daily-news";

export const inject = {
  required: ["cron", "database"],
  optional: ["adapter-onebot"],
};

export const usage = `
<h1>每日新闻</h1>

<p>目前仅测试了 <b>Onebot</b> 协议</p>

<p>仓库地址：<a href="https://github.com/snowwolfair/daynew">https://github.com/snowwolfair/daynew</a></p>

<p style="color: #f39c12;">插件使用问题 / Bug反馈 / 建议 请 添加企鹅群 156529412 或在仓库中发 issue </p>


<h2>食用方法</h2>

<p>在 <b>发送信息配置</b> 中 <b style="color: #08b402ff;">添加项目</b>, 然后输入机器人所在群号即可</p>
<p>若需要发送到多个群，可以继续添加项目</p>
<hr>
<p>本项目注册了一个名为 <b style="color: #f70404ff;">daily</b> 的命令，和定时任务发出的信息一样</p>
<p>若不需要该命令，请在 <b style="color: #08b402ff;">指令管理</b> 中关闭</p>
`;

export const Config: Schema = Schema.intersect([
  Schema.object({
    daynews: Schema.boolean().default(true).description("是否发送每日新闻"),
    sendTime: Schema.object({
      week: Schema.number()
        .default(0)
        .description("发送时间-星期几(0-7, 0 表示每天)")
        .min(0)
        .max(7)
        .step(1),
      month: Schema.number()
        .default(0)
        .description("发送时间-哪个月(0-12, 0 表示每个月)")
        .min(0)
        .max(12)
        .step(1),
      day: Schema.number()
        .default(0)
        .description("发送时间-哪一天(0-31, 0 表示每天)")
        .min(0)
        .max(31)
        .step(1),
      hour: Schema.number()
        .default(9)
        .description("发送时间-哪个小时(0-24, 24 表示每小时)(默认为早上9点)")
        .min(0)
        .max(24)
        .step(1),
      minute: Schema.number()
        .default(0)
        .description("发送时间-哪一分钟(0-60, 60 表示每分钟)")
        .min(0)
        .max(60)
        .step(1),
    }).description("发送时间"),
    url: Schema.object({
      list: Schema.array(Schema.string().default("").description("新闻源"))
        .default(["https://60s.viki.moe/v2/60s"])
        .description("新闻源列表"),
    }).description("新闻源配置"),
  }).description("每日新闻配置"),

  Schema.object({
    Objective: Schema.array(
      Schema.object({
        platform: Schema.union(["onebot", "qq", "discord", "telegram", "kook"])
          .default("onebot")
          .description("目标平台"),
        group: Schema.array(
          Schema.string().default("").description("目标群组"),
        ).default([]),
      }),
    )
      .default([])
      .description("信息目标列表"),
  }).description("发送信息配置"),
]);

export function apply(ctx: Context, config) {
  const UrlList = config.url.list;

  if (!config.daynews) return;

  ctx.cron(
    `${config.sendTime.minute == 60 ? "*" : config.sendTime.minute} ${
      config.sendTime.hour == 24 ? "*" : config.sendTime.hour
    } ${config.sendTime.day == 0 ? "*" : config.sendTime.day} ${
      config.sendTime.month == 0 ? "*" : config.sendTime.month
    } ${config.sendTime.week == 0 ? "*" : config.sendTime.week}`,
    async () => {
      // 每天早上 9 点执行
      const sendnewMessage = await sendNews(ctx, UrlList);
      const groupList = config.Objective.flatMap((item) =>
        item.group.map((groupId) => `${item.platform}:${groupId}`),
      );
      console.log(sendnewMessage, groupList);
      ctx.broadcast(groupList, sendnewMessage);
      // ctx.broadcast(["sandbox:z7lzin03zqg"], sendnewMessage);
    },
  );

  ctx.command("daily").action(async ({ session }) => {
    for (const url of UrlList) {
      try {
        await session.send(await sendNews(ctx, UrlList));
        break;
      } catch (err) {
        console.error("请求失败:", err);
      }
    }
  });
}

function dateFormat(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

async function sendNews(ctx: Context, UrlList?: string[]) {
  for (const url of UrlList) {
    try {
      const res = await ctx.http.get(url);
      const dailyNews = res.data;
      return `${dateFormat(new Date(dailyNews.date))} ${
        dailyNews.day_of_week || ""
      } 农历 ${dailyNews.lunar_date || ""}\n 1. ${
        dailyNews.news[0] || ""
      }\n 2. ${dailyNews.news[1] || ""}\n 3. ${dailyNews.news[2] || ""}\n 4. ${
        dailyNews.news[3] || ""
      }\n 5. ${dailyNews.news[4] || ""}\n 6. ${dailyNews.news[5] || ""}\n 7. ${
        dailyNews.news[6] || ""
      }\n 8. ${dailyNews.news[7] || ""}\n 9. ${dailyNews.news[8] || ""}\n 10. ${
        dailyNews.news[9] || ""
      }\n
  `;
    } catch (err) {
      console.error("请求失败:", err);
    }
  }
  return "❌ 获取每日新闻失败，请稍后再试。";
}
