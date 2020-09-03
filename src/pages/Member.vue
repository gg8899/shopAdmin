<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>会员列表</el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <!-- <el-button id="addBtn" type="primary" @click="handleAdd()">添加</el-button> -->
            <!-- 表格数据 -->
            <el-table
                :data="tableData"
                style="width: 100%"
                row-key="id"
                border
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            >
                <!-- 
                    prop : 关联的data 中的数据的名称
                    label : 表头文字
                    默认将 关联数据的文本作为内容项
                -->
                <!-- prop: 指定关联的data 数据的属性 -->
                <el-table-column prop="nickname" label="昵称" width="180"></el-table-column>
                <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
                <el-table-column prop="addtime" label="注册日期" width="150"></el-table-column>

                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 点击编辑和删除按钮，做对应的操作，传入参数为这一行的数据 -->
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页条 page-size 每页显示条目个数 page-count 总页数 total	总条目数
            current-change	currentPage 改变时会触发
            current-page	当前页数
            -->
            <el-pagination
                class="fenye"
                background
                layout="prev, pager, next"
                :page-size="pages.pageSize"
                :page-count="pages.pageCount"
                :total="pages.totals"
                :current-page="pages.currentPage"
                @current-change="changePage"
            ></el-pagination>
            <!-- 弹出对话框 -->
            <el-dialog :title="'会员' +tip" :visible.sync="dialogVisible" width="40%">
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item label="昵称" prop="nickname">
                        <el-input v-model="ruleForm.nickname"></el-input>
                    </el-form-item>
                    <el-form-item prop="phone" label="手机号">
                        <el-input v-model="ruleForm.phone"></el-input>
                    </el-form-item>
                    <el-form-item prop="password" label="密码">
                        <el-input v-model="ruleForm.password" type="password"></el-input>
                    </el-form-item>
                    <!-- 状态栏 -->
                    <!-- 状态1正常2禁用 @change="changeStatus" -->
                    <el-form-item label="状态">
                        <el-switch v-model="status" @change="changeStatus"></el-switch>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="handleReset()">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit('ruleForm')">确 定</el-button>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        // 获取管理员的数据 page 页面数 size 每页显示的条数
        this.getAllMembers(this.pages.currentPage, this.pages.pageSize);
        this.getMemberTotal();
    },
    data() {
        return {
            tableData: [],
            tip: "",
            dialogVisible: false, //  对话的显示
            ruleForm: {
                nickname: "",
                phone: "",
                password: "",
                status: "1",
            },
            status: true,
            rules: {
                nickname: [
                    {
                        required: true,
                        message: "请用户名称",
                        trigger: "blur",
                    },
                ],
                phone: [
                    {
                        required: true,
                        message: "请用户手机号",
                        trigger: "blur",
                    },
                ],
            },
            pages: {
                totals: 1, //  总用户数数
                pageCount: 1, //  总计页面数
                currentPage: 1, //  当前页面
                pageSize: 1, //  当前页面显示的条数
            },
        };
    },
    methods: {
        // 更改当前页面
        changePage(v) {
            this.pages.currentPage = v;
            this.getAllMembers(this.pages.currentPage, this.pages.pageSize);
        },
        // 获取所有商品总数
        getMemberTotal() {
            this.$http.get("/api/membercount").then((res) => {
                if (res.code === 200) {
                    this.pages.totals = res.list[0].total;
                }
            });
        },
        // 获取当前页面所有商品信息
        getAllMembers(page, size) {
            // console.log(page,size);
            this.$http
                .get("/api/memberlist?page=" + page + "&size=" + size)
                .then((res) => {
                    // console.log(res);
                    if (res.code === 200) {
                        this.tableData = res.list;
                    } else {
                        this.$message({
                            type: "warn",
                            message: res.msg,
                        });
                    }
                });
        },

        // 添加数据
        handleAdd() {
            this.dialogVisible = true;
            this.tip = "添加";
        },
        // 编辑
        handleEdit(row) {
            // console.log(row);
            this.dialogVisible = true;
            this.tip = "编辑";
            // 回显数据

            this.ruleForm = {
                nickname: row.nickname,
                phone: row.phone,
                password: row.password,
                status: String(row.status),
            };
            this.ruleForm.uid = row.uid;
        },

        // 更改状态
        changeStatus(val) {
            this.ruleForm.status = val === "0" ? "1" : "2";
        },
        // 取消提交
        handleReset() {
            this.dialogVisible = false;
            this.resetFormData();
        },
        // 重置表单提交的数据
        resetFormData() {
            this.ruleForm = {
                nickname: "",
                phone: "",
                password: "",
                status: "1",
            };
        },

        // 提交表单
        handleSubmit(formName) {
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    // 修改用户
                    this.editMember();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 修改用户
        editMember() {
            this.dialogVisible = false;
            // 请求数据
            this.$http.post("/api/memberedit", this.ruleForm).then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    //  提醒数据更新成功更新页面数据
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });
                    // 数据更新页面
                    this.getAllMembers(
                        this.pages.currentPage,
                        this.pages.pageSize
                    );
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
                // 清空表单的数据
                this.resetFormData();
            });
        },
    },
};
</script>

<style lang="stylus" scoped>
.el-table {
    margin: 20px 0px 15px;
}

// 分页
.fenye.el-pagination {
    margin-top: 30px;
    text-align: right;
}
</style>