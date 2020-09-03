<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>管理员列表</el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <el-button id="addBtn" type="primary" @click="handleAdd()">添加</el-button>
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
                <el-table-column prop="uid" label="用户编号" width="180"></el-table-column>
                <el-table-column prop="rolename" label="角色" width="150"></el-table-column>
                <el-table-column prop="username" label="用户名" width="150"></el-table-column>
                <el-table-column prop="status" label="状态" width="150">
                    !-- 插槽插入 自定义内容 -->
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status==1" type="success" effect="dark">启用</el-tag>
                        <el-tag v-if="scope.row.status==2" type="danger" effect="dark">禁用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!-- 点击编辑和删除按钮，做对应的操作，传入参数为这一行的数据 -->
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="comfirmDel(scope.row)">删除</el-button>
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
            <el-dialog :title="'管理员' +tip" :visible.sync="dialogVisible" width="40%">
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item label="角色" prop="roleid">
                        <el-select v-model="ruleForm.roleid" ref="f1" placeholder="请选择角色">
                            <el-option
                                v-for="item in roles"
                                :label="item.rolename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="username" label="用户名">
                        <el-input v-model="ruleForm.username"></el-input>
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
        this.getAllUsers(this.pages.currentPage, this.pages.pageSize);
        this.getUsersTotal();
    },
    data() {
        return {
            tableData: [],
            tip: "",
            dialogVisible: false, //  对话的显示
            ruleForm: {
                roleid: "",
                username: "",
                password: "",
                status: "1",
            },
            status: true,
            rules: {
                roleid: [
                    {
                        required: true,
                        message: "请输入上级菜单",
                        trigger: "blur",
                    },
                ],
                username: [
                    {
                        required: true,
                        message: "请用户名称",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 8,
                        message: "长度在 2 到 8 个字符",
                        trigger: "blur",
                    },
                ],
            },
            roles: [],
            pages: {
                totals: 1, //  总用户数数
                pageCount: 1, //  总计页面数
                currentPage: 1, //  当前页面
                pageSize: 2, //  当前页面显示的条数
            },
        };
    },
    methods: {
        // 更改当前页面
        changePage(v) {
            this.pages.currentPage = v;
            this.getAllUsers(this.pages.currentPage, this.pages.pageSize);
        },
        // 获取所有用户总数
        getUsersTotal() {
            this.$http.get("/api/usercount").then((res) => {
                if (res.code === 200) {
                    // console.log(res.list[0].total);
                    this.pages.totals = res.list[0].total;
                }
            });
        },
        // 获取当前页面所有用户信息
        getAllUsers(page, size) {
            // 设置显示第一页 一页显示6个用户
            // console.log(page,size);
            this.$http
                .get("/api/userlist?page=" + page + "&size=" + size)
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
        // 获取所有的角色列表
        getAllRoles() {
            this.$http.get("/api/rolelist").then((res) => {
                // console.log(res.list);
                if (res.code === 200) {
                    this.roles = res.list;
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
            this.getAllRoles(); //  获取所有角色
        },
        // 编辑
        handleEdit(row) {
            // console.log(row);
            this.dialogVisible = true;
            this.tip = "编辑";
            this.getAllRoles(); //  获取所有角色
            // 回显数据

            this.ruleForm = {
                roleid: String(row.roleid),
                username: row.username,
                password: row.password, //  已经加密了的密码
                status: String(row.status),
            };

            this.status = row.status == "1" ? true : false;
            this.ruleForm.uid = row.uid;
            this.ruleForm.id = row.id;
        },
        // 删除 根据id来删除数据而不是uid
        handleDelete(row) {
            // console.log(row.id);
            this.$http.post("/api/userdelete", { id: row.id }).then((res) => {
                // console.log(res);
                if (res.code == 200) {
                    this.$message({
                        type: "success",
                        message: "删除成功",
                    });
                    // 更新页码数
                    this.pages.totals = res.list.length;

                    // 更新页面的数据;
                    // console.log(this.pages.totals);
                    this.pages.pageCount = Math.ceil(
                        this.pages.totals / this.pages.pageSize
                    );
                    // console.log(this.pages.pageCount);
                    this.pages.currentPage =
                        this.pages.currentPage > this.pages.pageCount
                            ? this.pages.pageCount
                            : this.pages.currentPage;
                    // console.log(this.pages.currentPage);
                    this.getAllUsers(
                        this.pages.currentPage,
                        this.pages.pageSize
                    );
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
            });
        },
        // 确认删除
        comfirmDel(row) {
            // console.log(row);
            this.$confirm("此操作将永久删除, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    // 确认删除
                    this.handleDelete(row);
                })
                .catch(() => {});
        },
        // 更改状态
        changeStatus(val) {
            // console.log(val);
            this.ruleForm.status = val ? "1" : "2";
        },
        // 取消提交
        handleReset() {
            this.dialogVisible = false;
            this.resetFormData();
        },
        // 重置表单提交的数据
        resetFormData() {
            this.ruleForm = {
                roleid: "3",
                username: "",
                password: "",
                status: "1",
            };
            this.roles = [];
            this.status = true;
        },

        // 提交表单
        handleSubmit(formName) {
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    // 添加用户
                    this.addUser();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加用户  显示最新添加的数据
        addUser() {
            this.dialogVisible = false;
            let id = this.ruleForm.id;
            let url = id ? "/api/useredit" : "/api/useradd";
            // 请求数据
            this.$http.post(url, this.ruleForm).then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    //  提醒数据更新成功更新页面数据
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });

                    //  如果是修改用户  则显示向前页面的数据
                    // console.log(id);
                    if (id) {
                        console.log(this.pages.currentPage);
                        this.getAllUsers(
                            this.pages.currentPage,
                            this.pages.pageSize
                        );
                        return;
                    }

                    // 更新页面的数据;  请求都是异步的 需要将数据返回之后才能使用数据
                    // md  太难了 导致我有时候获取不到数据~~~fine!
                    this.$http.get("/api/usercount").then((res) => {
                        if (res.code === 200) {
                            this.pages.totals = res.list[0].total;
                            this.pages.pageCount = Math.ceil(
                                this.pages.totals / this.pages.pageSize
                            );
                            // console.log(this.pages.pageCount);
                            this.pages.currentPage = this.pages.pageCount;
                            this.getAllUsers(
                                this.pages.currentPage,
                                this.pages.pageSize
                            );
                        }
                    });
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
            });

            // 清空表单的数据
            this.resetFormData();
        },
    },
};
</script>

<style lang="stylus" scoped>
#addBtn {
    margin: 20px 0px 15px;
}

// 分页
.fenye.el-pagination {
    margin-top: 30px;
    text-align: right;
}
</style>