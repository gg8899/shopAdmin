<template>
    <div id="login">
        <div class="loginBox">
            <h3>登录</h3>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="ruleForm.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        @keydown.enter.native="loginEnter"
                        @click="submitForm('ruleForm')"
                    >提交</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import { mapMutations } from "vuex";

export default {
    created() {
        // 登录回车事件的问题与解决
        let _self = this;
        document.onkeydown = function (e) {
            if (window.event == undefined) {
                var key = e.keyCode;
            } else {
                var key = window.event.keyCode;
            }
            if (key == 13) {
                _self.loginEnter("ruleForm");
            }
        };
    },
    data() {
        return {
            ruleForm: {
                username: "",
                password: "",
            },
            rules: {
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 6,
                        message: "长度在 3 到 5 个字符",
                        trigger: "blur",
                    },
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    {
                        min: 3,
                        max: 8,
                        message: "长度在 3 到 8 个字符",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    methods: {
        ...mapMutations(["setInfo"]),
        loginEnter(data) {
            this.submitForm(data);
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                // 验证通过
                if (valid) {
                    // alert("submit!");
                    this.$http
                        .post("/api/userlogin", this.ruleForm)
                        .then((res) => {
                            // console.log(res);
                            if (res.code == 200) {
                                // 登录成功 1.将用户 Token 存入数据本地
                                sessionStorage.setItem("token", res.list.token);
                                sessionStorage.setItem(
                                    "user",
                                    JSON.stringify(res.list)
                                );
                                // 将store中的数据更新一遍
                                this.setInfo();
                                // 2. 跳转路由
                                this.$router.replace("/");

                                // 在请求成功后把document.onkeydown置为undefined
                                document.onkeydown = undefined;
                            } else {
                                // 登录失败
                                this.$message.error(res.msg);
                            }
                        });
                } else {
                    // this.$message.error("error submit!!");
                    // 阻止表单提交
                    return false;
                }
            });
        },
    },
    // mounted() {
    // console.log(this);  //  VueComponent
    // },
};
</script>
<style lang="stylus" scope="scope">
#login
    width 100%
    height 100%
    background linear-gradient(to right, #563443 20%, #2f3d60 80%)

    h3
        text-align center
        margin-bottom 20px

    .loginBox
        position absolute
        left 50%
        top 50%
        transform translate(-50%, -50%)
        width 300px
        height 256px

        .el-button--primary
            width 100%
</style>