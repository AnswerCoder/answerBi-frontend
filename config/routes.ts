export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { name: '登录', path: '/user/login', component: './User/Login' },
      { name: '注册', path: '/user/register', component: './User/Register' }
    ],
  },
  {
    name: '智能分析',
    path: '/analyze',
    icon: 'barChart',
    component: './Chart/AddChart'
  },
  {
    name: '智能分析(异步)',
    path: '/analyze/async',
    icon: 'barChart',
    component: './Chart/AddChartAsync'
  },
  {
    name: '我的图表',
    path: '/my_chart',
    icon: 'pieChart',
    component: './Chart/MyChart'
  },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', redirect: 'user-manage' },
      { path: '/admin/user-manage', name: '用户管理', icon: 'smile', component: './Admin/UserManage' },
    ],
  },
  { path: '/', redirect: '/analyze' },
  { path: '*', layout: false, component: './404' },
];
