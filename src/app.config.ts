export default defineAppConfig({
  pages: [
    'pages/queue/index',
    'pages/clinic/index',
    'pages/missed/index',
    'pages/mine/index',
    'pages/take-number/index',
    'pages/clinic-detail/index',
    'pages/crisis-assess/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '精神科门诊排号',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/queue/index',
        text: '排队叫号'
      },
      {
        pagePath: 'pages/clinic/index',
        text: '诊室排期'
      },
      {
        pagePath: 'pages/missed/index',
        text: '过号管理'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
