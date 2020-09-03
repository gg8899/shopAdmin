<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
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
                <el-table-column width="180px" label="名称" prop="rolename"></el-table-column>
                <el-table-column width="150px" label="状态" prop="status">
                    !-- 插槽插入 自定义内容 -->
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status==1" type="success">启用</el-tag>
                        <el-tag v-if="scope.row.status==2" type="danger">禁用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 弹出对话框 -->
            <el-dialog :title="'角色' +tip" :visible.sync="dialogVisible" width="40%">
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
                    <el-form-item prop="rolename" label="角色名称">
                        <el-input v-model="ruleForm.rolename"></el-input>
                    </el-form-item>
                    <!-- 角色权限 使用树状图显示树形结构 -->
                    <el-form-item label="角色权限">
                        <!-- 
                            data 绑定的树状结构数据
                            show-checkbox 可选择
                            node-key: 节点表示
                            props: children 属性作为子阶段数据
                            label : 文本是title 属性
                            ref : 添加标记，为后面 获取 checked-key 做准备
                        -->
                        <el-tree
                            ref="m"
                            :data="menu"
                            show-checkbox
                            node-key="id"
                            :default-checked-keys="menus"
                            :props="{children:'children',label:'title'}"
                        ></el-tree>
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
        this.getAllRoles();
    },
    data() {
        return {
            tableData: [], //  表单数据
            tip: "", //  对话框的名称
            dialogVisible: false, //  对话的显示
            ruleForm: {
                rolename: "",
                status: "1",
            }, // 表单结构数据
            menu: [], //  树形结构菜单数据
            status: true, //  状态
            rules: {
                rolename: [
                    {
                        required: true,
                        message: "请角色名称",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 8,
                        message: "长度在 3 到 5 个字符",
                        trigger: "blur",
                    },
                ],
            }, // 表单验证规则
            menus: [], //  菜单选项
        };
    },
    methods: {
        // 获取所有的角色列表
        getAllRoles() {
            // 请求数据
            this.$http.get("api/rolelist").then((res) => {
                // console.log(res.list);
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
        // 添加角色
        handleAdd() {
            this.getTreeMenu(); //  获取树状结构的菜单权限
            this.tip = "添加";
            this.dialogVisible = true;
        },
        // 编辑角色
        handleEdit(row) {
            this.tip = "编辑";
            this.dialogVisible = true;
            //  根据角色id 来获取菜单权限
            this.getTreeMenu(); //  获取树状结构的菜单权限
            this.$http
                .get("/api/roleinfo", {
                    params: {
                        id: row.id,
                    },
                })
                .then((res) => {
                    // console.log(res);
                    let info = res.list;
                    this.menus = res.list.menus.split(","); //  "1,2,3,7,8,9,10,11,12,13,14,15"
                    // console.log(this.menus);
                    // 点击修改弹出对话框，向 ruleform 添加 id 属性
                    info.id = row.id.toString();
                    this.status = row.status == "1" ? true : false;
                    this.ruleForm = info;
                });
        },
        // 菜单树形结构
        getTreeMenu() {
            this.$http.get("/api/menulist?istree=1").then((res) => {
                // console.log(res.list);
                if (res.code === 200) {
                    this.menu = res.list;
                }
            });
        },
        // 可否使用
        changeStatus(val) {
            this.ruleForm.status = val ? "1" : "2";
        },
        // 提交数据
        handleSubmit(formName) {
            // 验证数据
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    this.addRole();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加角色
        addRole() {
            //根据id来确认是否添加或者修改元素
            // 校验成功
            this.dialogVisible = false;
            // 有无id显示  无id显示是添加数据，有id显示是修改数据;
            // console.log(this.ruleForm.id);
            // 获取 树状 组将选择权限 数组转化为字符串 准备提交
            let menus = this.$refs.m.getCheckedKeys().join(",");
            this.ruleForm.menus = menus;
            let url = this.ruleForm.id ? "/api/roleedit" : "/api/roleadd";
            this.$http.post(url, this.ruleForm).then((res) => {
                if (res.code === 200) {
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });

                    // 重新获取最新的数据列表
                    this.getAllRoles();
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
            });
            this.resetRuleForm();
        },
        // 将数据清空
        resetRuleForm() {
            this.ruleForm = {
                rolename: "",
                status: "1",
            };
            this.status = true;
            this.menus = [];
            this.menu = [];
        },

        // 取消按钮
        handleReset() {
            this.dialogVisible = false;
            this.resetRuleForm();
        },

        // 删除用户
        handleDelete(row) {
            this.$confirm("此操作将永久删除, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.$http
                        .post("/api/roledelete", { id: row.id })
                        .then((res) => {
                            // console.log(res);
                            if (res.code === 200) {
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
                .catch(() => {});
            // console.log(row);
        },
    },
};
</script>

<style lang="stylus" scoped>
#addBtn {
    margin: 20px 0px 15px;
}
</style>