// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
// eslint-disable-next-line
//lintExactActiveClass:'active'
 // eslint-disable-next-line
 /* eslint-disable */
import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
import goods from './components/goods/goods';
import ratings from './components/ratings/ratings';
import seller from './components/seller/seller';
import index from './common/stylus/index.styl';
import VueResource from 'vue-resource';
Vue.use(VueResource);
Vue.use(VueRouter);
Vue.config.productionTip = false;
//routes 是指多条路由  router是对路由进行管理 接收routes参数
const routes = [
  { path: '/goods', component: goods },
  { path: '/ratings', component: ratings },
  { path: '/seller', component: seller },
  { path: '*', redirect:'/goods' }//默认跳转路由
];
const router = new VueRouter({
  routes: routes
});
export default router;

//配置完成后，把router 实例注入到 vue 根实例中,就可以使用路由了
new Vue({
  el: '#app',
  router,
  render: h => h(App)

});
