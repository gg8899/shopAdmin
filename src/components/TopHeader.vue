<template>
    <div>
        <el-row>
            <el-col :span="24">
                <div class="grid-content bg-purple-dark">
                    <div class="userInfo">
                        <em>{{username}}</em>
                        <el-row class="block-col-2">
                            <el-col :span="12">
                                <el-dropdown>
                                    <span class="el-dropdown-link">
                                        <i class="el-icon-setting"></i>
                                    </span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item @click.native="loginOut()">登出</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </el-col>
                        </el-row>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { mapMutations } from "vuex";
export default {
    computed: {
        username() {
            return this.$store.state.user.username;
        },
    },
    methods: {
        ...mapMutations(["clearInfo"]),
        loginOut() {
            // 登出 1.将用户信息 和 token 从本地删除
            sessionStorage.clear();
            // 将数据同步到store 中
            this.clearInfo();
            // 回退到登录页面
            this.$router.replace("/login");
        },
    },
};
</script>

<style lang="stylus" scoped>
.userInfo
    float right
    width 120px
    height 60px
    line-height 60px

    em
        font-size 14px
        color #333
        margin-right 20px

    .block-col-2
        float right
        width 60px

// 设置图标颜色
.el-icon-setting
    color #000

.el-dropdown-link
    cursor pointer
    color #409EFF

.el-icon-arrow-down
    font-size 12px

.demonstration
    display block
    color #8492a6
    font-size 14px
    margin-bottom 20px
</style>