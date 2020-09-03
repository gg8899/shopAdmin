// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// 初始化CSS样式
import './assets/css/reset.css'

// import UI组件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 引入store文件
import store from './store/index'

// 引入网络请求资源
import http from './http/index'

Vue.prototype.$http = http;

Vue.use(ElementUI); 
Vue.config.productionTip = false

new Vue({
    el: '#app',
    store,
    router,
    components: { App },
    template: '<App/>'
})
