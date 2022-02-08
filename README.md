# 一个能够同步你所在位置天气信息的 GitHub Action

## 如何使用

### 准备工作

1. 申请一个高德的开发者账号，准备好一个查询天气的 API KEY [详情](https://lbs.amap.com/api/webservice/guide/api/weatherinfo)

2. 创建一个 GitHub Token，需要有一定的权限 [详情](https://github.com/settings/tokens)

3. 查询你所在地区的 atcode [详情](http://www.mca.gov.cn/article/sj/xzqh/2020/2020/202101041104.html)

### 开始

1. Fork 本项目
2. 更新 [CITY_ATCODE](https://github.com/qianxi0410/github-action-weather-info/blob/master/.github/workflows/schedule.yml#L21)为你所在地区的 atcode
3. 在你 fork 的项目下，创建`GH_TOKEN`和`GAODE_KEY`私有变量，值为上文中准备号的值 (步骤是 settings -> secrets -> actions)
4. 在你的 GitHub Profile 中，创建一个占位 block，`id`为`weather`,如

```html
<div id="weather"></div>
```

5. 进入 Action 页面，执行对应的 workflow，去你的 profile 中查看结果
