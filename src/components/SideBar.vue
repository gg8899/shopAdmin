<template>
    <div id="sideBar">
        <el-menu
            class="el-menu-vertical-demo"
            background-color="#434a50"
            text-color="#fff"
            active-text-color="#ffd04b"
            unique-opened
            :default-active="$route.path"
        >
            <el-menu-item>后台管理系统</el-menu-item>
            <!-- 首页 -->
            <el-menu-item index="/index">
                <router-link to="/index">
                    <i class="el-icon-s-home"></i>首页
                </router-link>
            </el-menu-item>
            <!-- 一级菜单 -->
            <el-submenu v-for="(item,index) in menus" :key="index" :index="(index+1).toString()">
                <template slot="title">
                    <!-- 标题插槽 -->
                    <i :class="item.icon"></i>
                    {{item.title}}
                </template>
                <el-menu-item-group>
                    <el-menu-item
                        v-for="(sub,index) in item.children"
                        :index="sub.url"
                        :key="index"
                    >
                        <router-link :to="sub.url">{{sub.title}}</router-link>
                    </el-menu-item>
                </el-menu-item-group>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
export default {
    computed: {
        menus() {
            return this.$store.state.user.menus;
        },
    },
};
</script>

<style lang="stylus" scoped>// 图标居中
// 将它的右边框去掉
#sideBar ul
    border 0

.el-icon-s-home:before, .el-icon-s-goods:before, .el-icon-setting:before
    display inline-block
    margin-top -10px

/* 活跃样式 */
.el-menu .is-active a.router-link-active, .is-opened .is-active a.router-link-active
    color #ffd04b

/* 左侧宽带 */
.el-menu
    width 150px

/*  */
.el-submenu, .el-submenu .el-menu-item
    min-width 149px
</style>