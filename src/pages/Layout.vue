<template>
    <div id="layout">
        <div class="layout">
            <el-container>
                <el-aside width="151px">
                    <side-bar></side-bar>
                </el-aside>
                <el-container>
                    <el-header>
                        <TopHeader></TopHeader>
                    </el-header>
                    <el-main>
                        <!-- 视图出口 -->
                        <router-view></router-view>
                    </el-main>
                </el-container>
            </el-container>
        </div>
    </div>
</template>

<script>
import SideBar from "@/components/SideBar.vue";
import TopHeader from "@/components/TopHeader.vue";
export default {
    components: {
        SideBar,
        TopHeader,
    },
};
</script>

<style lang="stylus" scoped>
#layout {
    height: 100%;
}

.layout, .el-container {
    height: 100%;
}

.el-header {
    background: #99a9bf;
}

.el-aside {
    background-color: #434a50;
    height: 100%;
}
</style>