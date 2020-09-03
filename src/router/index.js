import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Layout from '@/pages/Layout'
import Menu from '@/pages/Menu'
import Role from '@/pages/Role'
import User from '@/pages/User'
import Category from '@/pages/Category'
import Specs from '@/pages/Specs'
import Goods from '@/pages/Goods'
import Member from '@/pages/Member'
import Banner from '@/pages/Banner'
import Seckill from '@/pages/Seckill'

Vue.use(Router)
const router = new Router({
    routes: [
        {
            path: '/login',
            component: Login
        }, {
            path: '/',
            component: Layout,
            children: [{
                path: "index",
                component: Index
            }, {
                path: "menu",
                component: Menu
            }, {
                path: "role",
                component: Role
            }, {
                path: "user",
                component: User
            }, {
                path: "category",
                component: Category
            }, {
                path: "specs",
                component: Specs
            }, {
                path: "goods",
                component: Goods
            }, {
                path: "member",
                component: Member
            }, {
                path: "banner",
                component: Banner
            }, {
                path: "seckill",
                component: Seckill
            }, {
                path: "*",
                redirect: "/index"
            }]
        },
    ]
});

// 导航守卫
router.beforeEach((to, from, next) => {
    let user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
        // 已经登录过  不能再去登录页;
        if (to.path == "/login") {
            next(false);
        } else if (to.path == '/index' || to.path == '/') {
            // 首页正常跳转
            next();
        } else {
            // console.log(user.menus_url);    //  ["/category", "/specs", "/goods", "/member"]
            let flag = user.menus_url.some(item => {
                return item == to.path;
            });
            // console.log(flag);   如果想省略return 需要和{}一起省略
            // 登录权限跳转拦截
            if (flag) {
                next();
            } else {
                // 不具有访问权限
                next(false);
            }
        }
    } else {
        // 还未登录  去登录;
        if (to.path == "/login") {
            next();
        } else {
            next("/login");
        }
    }
});


export default router;