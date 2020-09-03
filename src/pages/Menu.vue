<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>菜单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <el-button id="addBtn" type="primary" @click="handleAdd()">添加</el-button>
            <!-- 表格数据 -->
            <el-table
                :data="tableData"
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                row-key="id"
                border
                style="width: 100%"
            >
                <!--  
                    prop : 关联的 tableData 中的数据的名称
                    label : 表头文字
                默认将 关联数据的文本作为内容项-->
                <el-table-column width="180px" label="名称" prop="title"></el-table-column>
                <el-table-column width="150px" label="图标" prop="icon">
                    !-- 插槽插入 自定义内容 -->
                    <template slot-scope="scope">
                        <!-- scope.row ： 这一行的数据 -->
                        <i :class="scope.row.icon"></i>
                    </template>
                </el-table-column>
                <el-table-column width="150px" label="类型" prop="type">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.type==1">目录</el-tag>
                        <el-tag v-if="scope.row.type==2" type="success">菜单</el-tag>
                    </template>
                </el-table-column>
                <el-table-column width="150px" label="菜单URL" prop="url"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 弹出对话框 -->
            <el-dialog :title="'菜单' +tip" :visible.sync="dialogVisible" width="40%">
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item label="菜单类型" prop="pid">
                        <el-select v-model="ruleForm.pid" ref="f1" @change="changeMenu">
                            <el-option label="顶层菜单" :value="'0'" :key="0"></el-option>
                            <el-option
                                v-for="item in menu"
                                :label="item.title"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="title" label="菜单名称">
                        <el-input v-model="ruleForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-radio
                            v-model="ruleForm.type"
                            label="1"
                            :disabled="ruleForm.type=='2'"
                        >目录</el-radio>
                        <el-radio
                            v-model="ruleForm.type"
                            label="2"
                            :disabled="ruleForm.type=='1'"
                        >菜单</el-radio>
                    </el-form-item>
                    <!-- 1目录显示菜单图标，2菜单显示菜单路径; -->
                    <el-form-item v-show="ruleForm.type==='1'" prop="icon" label="菜单图标">
                        <el-input v-model="ruleForm.icon"></el-input>
                    </el-form-item>
                    <el-form-item v-show="ruleForm.type==='2'" label="菜单路径">
                        <el-input v-model="ruleForm.url"></el-input>
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
        // 请求数据
        this.$http.get("/api/menulist?istree=1").then((res) => {
            // console.log(res.list);
            if (res.code === 200) {
                this.tableData = res.list;
            }
        });
    },
    data() {
        //  value 要验证的值
        // callback，回调函数 ,传入错误对象，显示错误信息
        var menucheck = (rule, value, callback) => {
            // 输入值为空
            var reg = /^[\u4e00-\u9fa5]{3,5}$/g;
            if (!value) {
                return callback(new Error("菜单不能为空"));
            } else if (!reg.test(value)) {
                return callback(new Error("请输入3-5汉字"));
            } else {
                return callback();
            }
        };
        return {
            // 树形菜单数据
            tableData: [],
            //对话框是否显示
            dialogVisible: false,
            //对话框标题文本
            tip: "",
            ruleForm: {
                // 选择上级分类
                pid: "0",
                //文本
                title: "",
                // 图标
                icon: "",
                // 类型
                type: "1",
                // 菜单路径
                url: "",
                // 状态
                status: "1",
            }, //   菜单列表数据
            menu: [],
            status: true,
            // 验证数据规则
            rules: {
                pid: [
                    {
                        required: true,
                        message: "请输入上级菜单",
                        trigger: "blur",
                    },
                ],
                title: [
                    { required: true, validator: menucheck, trigger: "blur" },
                ],
            },
        };
    },
    methods: {
        //   获取一级目录
        getMenu() {
            this.$http.get("/api/menulist?pid=0").then((res) => {
                // console.log(res.list);
                this.menu = res.list;
            });
        },
        // 添加函数
        handleAdd() {
            this.getMenu();
            this.tip = "添加";
            // 显示对话框
            this.dialogVisible = true;
        },
        // 切换下拉框
        changeMenu(val) {
            // 根据 切换的 option 的value 决定类型
            // 类型1目录2菜单
            // console.log(val);
            this.ruleForm.type = val === "0" ? "1" : "2";
        },
        // 切换状态     状态1正常2禁用
        changeStatus(val) {
            // console.log(val);
            // 根据 切换的 boolean 决定状态
            // console.log(this.ruleForm.status);
            this.ruleForm.status = val ? "1" : "2";
        },
        // =======================================
        // 删除函数
        handleDelete(row) {
            this.$confirm("此操作将永久删除, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    // 确认删除
                    this.$http
                        .post("/api/menudelete", { id: row.id })
                        .then((res) => {
                            if (res.code == 200) {
                                this.$message({
                                    type: "success",
                                    message: "删除成功",
                                });
                                this.tableData = res.list ? res.list : [];
                            } else {
                                this.$message({
                                    type: "warn",
                                    message: res.msg,
                                });
                            }
                        });
                })
                .catch(() => {
                    // 取消删除
                });
        },
        // 修改函数
        handleEdit(row) {
            // console.log(row);
            this.tip = "修改";
            // 显示对话框
            this.dialogVisible = true;
            //  回显数据 根据id来显示
            // 老师的项目是根据row.id来获取请求数据然后再回显数据;
            // console.log(row);
            // 获取树形菜单;
            this.getMenu();
            //  将类型转化为字符串类型
            row.pid = String(row.pid);
            row.type = String(row.type);
            this.ruleForm = row;
            this.status = row.status == "1" ? true : false;
        },
        // 清空数据
        resetRuleForm() {
            this.ruleForm = {
                pid: "0",
                title: "",
                icon: "",
                type: "1",
                url: "",
                status: "1",
            };
            this.status = true;
            this.menu = [];
        },
        // 取消按钮,重置数据
        handleReset() {
            this.dialogVisible = false;
            this.resetRuleForm();
        },
        // 提交按钮: 将添加的数据加入数据库,将修改的数据以修改的路径提交
        // 区别：有无id显示
        handleSubmit(formName) {
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    this.addMeun();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加菜单
        addMeun() {
            // 校验成功
            this.dialogVisible = false;
            // 有无id显示  无id显示是添加数据，有id显示是修改数据;
            // console.log(this.ruleForm.id);
            let url = this.ruleForm.id ? "/api/menuedit" : "/api/menuadd";
            // 请求数据
            this.$http.post(url, this.ruleForm).then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    //  提醒数据更新成功更新页面数据
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });
                    // 添加成功 获取最新的菜单列表来渲染
                    this.$http.get("/api/menulist?istree=1").then((res) => {
                        // console.log(res);
                        if (res.code == 200) {
                            this.tableData = res.list || [];
                        } else {
                            this.$message({
                                type: "warn",
                                message: res.msg,
                            });
                        }
                    });
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
                // 清空数据
                this.resetRuleForm();
            });
        },
    },
};
</script>

<style lang="stylus" scoped>
#addBtn {
    margin: 20px 0px 15px;
}
</style>