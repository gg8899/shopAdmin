<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>限时秒杀列表</el-breadcrumb-item>
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
                <el-table-column width="180px" label="活动名称" prop="title"></el-table-column>
                <el-table-column width="150px" label="状态" prop="status">
                    !-- 插槽插入 自定义内容 -->
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status==1" type="success" effect="dark">启用</el-tag>
                        <el-tag v-if="scope.row.status==2" type="danger" effect="dark">禁用</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" @click="comfirmDel(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 弹出对话框 -->
            <el-dialog
                :title="'限时秒杀' +tip"
                :visible.sync="dialogVisible"
                width="56%"
                @close="handleReset()"
            >
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
                    <el-form-item prop="title" label="活动名称">
                        <el-input v-model="ruleForm.title"></el-input>
                    </el-form-item>
                    <!-- 活动时间组件 -->
                    <el-form-item>
                        <el-date-picker
                            v-model="ruleForm.createTime"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            :default-time="['00:00:00', '23:59:59']"
                            @change="timeRange"
                        ></el-date-picker>
                    </el-form-item>

                    <!-- 一级分类 -->
                    <el-form-item label="一级分类">
                        <el-select
                            v-model="ruleForm.first_cateid"
                            @change="changeFisrtCate"
                            placeholder="请选择分类"
                        >
                            <el-option
                                v-for="item in firstCate"
                                :label="item.catename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 二级分类 -->
                    <el-form-item label="二级分类">
                        <el-select
                            v-model="ruleForm.second_cateid"
                            @change="changeSecondCate"
                            placeholder="请选择分类"
                        >
                            <el-option
                                v-for="item in secondCate"
                                :label="item.catename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 商品 -->
                    <el-form-item label="商品">
                        <el-select v-model="ruleForm.goodsid" placeholder="请选择商品">
                            <el-option
                                v-for="item in productList"
                                :label="item.goodsname"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
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
        this.getAllSeckills();
    },
    data() {
        return {
            tableData: [], //  表单数据
            tip: "", //  对话框的名称
            dialogVisible: false, //  对话的显示
            ruleForm: {
                title: "",
                begintime: "",
                endtime: "",
                first_cateid: "",
                second_cateid: "",
                goodsid: "", //  商品id编号
                status: "1",
            }, // 表单结构数据
            status: true, //  状态
            firstCate: [], //  一级目录
            secondCate: [], //  根据选择的一级目录选择对应的二级目录,二级目录
            productList: [], //  根据一级二级目录来获取商品;
            // ====================================
            // 日期组件
            createTime: [],
            rules: {
                title: [
                    {
                        required: true,
                        message: "请活动名称",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 8,
                        message: "长度在 3 到 8 个字符",
                        trigger: "blur",
                    },
                ],
            }, // 表单验证规则
        };
    },
    methods: {
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
        timeRange() {
            console.log(this.ruleForm.createTime);
            // 将时间转化成字符串;   时间对象转换成 时间戳
            this.ruleForm.begintime = this.ruleForm.createTime[0].getTime();
            this.ruleForm.endtime = this.ruleForm.createTime[1].getTime();
        },

        // 获取限时秒杀列表
        getAllSeckills() {
            // 请求数据
            this.$http.get("api/secklist").then((res) => {
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

        // 获取分类数据 pid=0获取一级目录 其他为二级目录
        getCategory(pid = 0) {
            this.$http.get("/api/catelist?pid=" + pid).then((res) => {
                // console.log(res.list);
                if (res.code === 200) {
                    pid === 0
                        ? (this.firstCate = res.list)
                        : (this.secondCate = res.list);
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
            });
        },
        // 切换一级目录下拉框,获取二级目录
        changeFisrtCate(val) {
            // 切换一级目录之前，现将之前选中的数据id 二级菜单和商品数据清空
            this.ruleForm.second_cateid = "";
            this.ruleForm.goodsid = "";

            //  一级目录的pid为 0
            this.ruleForm.first_cateid = val;
            // console.log(val);
            // return;
            // 根据一级目录请求二级目录的数据
            this.getCategory(Number(val));
        },

        // 选择商品根据二级分类来获取商品
        changeSecondCate(pid) {
            this.choiceAllGoods(Number(pid));
            // console.log(pid);

            console.log(this.productList);
        },
        //
        choiceAllGoods(pid) {
            // 获取所有商品 二级目录的id来获取数据
            this.$http.get("/api/goodslist").then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    this.productList = res.list.filter(
                        (item) => item.second_cateid === pid
                    );
                }
            });
        },

        // 添加活动
        handleAdd() {
            this.tip = "添加";
            this.dialogVisible = true;
            // 获取一级目录
            this.getCategory();
        },
        // 编辑活动
        handleEdit(row) {
            // 获取一级目录
            this.getCategory();
            this.getCategory(row.first_cateid);
            this.choiceAllGoods(row.second_cateid);
            // console.log(row);
            this.tip = "编辑";
            this.dialogVisible = true;
            //  根据角色id 来获取菜单权限
            this.ruleForm = {
                title: row.title,
                begintime: row.begintime,
                endtime: row.endtime,
                first_cateid: row.first_cateid.toString(),
                second_cateid: row.second_cateid.toString(),
                goodsid: row.goodsid.toString(), //  商品id编号
                status: row.status.toString(),
            }; // 表单结构数据
            this.status = row.status === 1 ? true : false; //  状态
            // this.firstCate = row; //  一级目录
            // this.secondCate = row; //  根据选择的一级目录选择对应的二级目录,二级目录
            // this.productList = row; //  根据一级二级目录来获取商品;
            // 日期组件的数据清空
            // 需要将时间戳转换成时间对象
            let start = new Date(Number(row.begintime));
            let end = new Date(Number(row.endtime));
            this.ruleForm.createTime = [start, end];
            // console.log(this.ruleForm.createTime);
            this.ruleForm.id = row.id;
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
                    this.addSeckill();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加秒杀活动
        addSeckill() {
            //根据id来确认是否添加或者修改元素
            // 校验成功
            this.dialogVisible = false;
            // 有无id显示  无id显示是添加数据，有id显示是修改数据;
            console.log(this.ruleForm);
            // 获取 树状 组将选择权限 数组转化为字符串 准备提交
            let url = this.ruleForm.id ? "/api/seckedit" : "/api/seckadd";
            // console.log(url);
            this.$http.post(url, this.ruleForm).then((res) => {
                console.log(res);
                if (res.code === 200) {
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });

                    // 重新获取最新的数据列表
                    this.getAllSeckills();
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
            });
            // 清空数据
            this.resetRuleForm();
        },
        // 将数据清空
        resetRuleForm() {
            this.ruleForm = {
                title: "",
                begintime: "1",
                endtime: "1",
                first_cateid: "",
                second_cateid: "",
                goodsid: "", //  商品id编号
                status: "1",
            }; // 表单结构数据
            this.status = true; //  状态
            this.firstCate = []; //  一级目录
            this.secondCate = []; //  根据选择的一级目录选择对应的二级目录,二级目录
            this.productList = []; //  根据一级二级目录来获取商品;
            // 日期组件的数据清空
            this.createTime = [];
        },

        // 取消按钮
        handleReset() {
            this.dialogVisible = false;
            this.resetRuleForm();
        },

        // 删除用户
        handleDelete(row) {
            // console.log(row);
            this.$http.post("/api/seckdelete", { id: row.id }).then((res) => {
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
        },
    },
};
</script>

<style lang="stylus" scoped>
#addBtn {
    margin: 20px 0px 15px;
}
</style>