<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>规格列表</el-breadcrumb-item>
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
                <el-table-column prop="specsname" label="属性名称" width="180"></el-table-column>
                <el-table-column prop="attrs" label="属性值" width="150">
                    <!-- 数组的值如何写入 -->
                    <template slot-scope="scope">
                        <el-tag v-for="(item,index) in scope.row.attrs" :key="index">{{item}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" class="attrColumn">
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
                    <el-form-item label="属性名称" prop="specsname">
                        <el-input v-model="ruleForm.specsname"></el-input>
                    </el-form-item>
                    <!-- v-model 不能绑定 v-for 的item,把数据变为数组成员的对象的属性-->
                    <el-form-item prop="attrs" label="属性值">
                        <div v-for="(item,index) in ruleForm.attrs" :key="index" class="attrItem">
                            <!-- 新增属性值 -->
                            <el-input
                                v-model="item.value"
                                class="addAttrsInp"
                                @input="change($event)"
                            ></el-input>
                            <el-button v-if="index==0" type="primary" @click="addAttr()">新增属性值</el-button>
                            <el-button v-if="index>0" type="danger" @click="delAttr(index)">删除</el-button>
                        </div>
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
        this.getAllSpecs(this.pages.currentPage, this.pages.pageSize);
        this.getSpecsTotal();
    },
    data() {
        return {
            tableData: [],
            tip: "",
            dialogVisible: false, //  对话的显示
            ruleForm: {
                specsname: "",
                attrs: [{ value: "" }],
                status: "1",
            },
            status: true,
            rules: {
                specsname: [
                    {
                        required: true,
                        message: "请属性名称",
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

            pages: {
                totals: 1, //  总用户数数
                pageCount: 1, //  总计页面数
                currentPage: 1, //  当前页面
                pageSize: 3, //  当前页面显示的条数
            },
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
        // 修改页面input无法输入
        change(e) {
            this.$forceUpdate();
        },
        // 更改当前页面
        changePage(v) {
            // console.log(v);
            this.pages.currentPage = v;
            this.getAllSpecs(this.pages.currentPage, this.pages.pageSize);
        },
        // 获取当前页面所有商品规格
        getAllSpecs(page, size) {
            // 设置显示第一页 一页显示6个用户
            // console.log(page,size);
            this.$http
                .get("/api/specslist?page=" + page + "&size=" + size)
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

        // 获取所有规格总数
        getSpecsTotal() {
            this.$http.get("/api/specscount").then((res) => {
                if (res.code === 200) {
                    this.pages.totals = res.list[0].total;
                }
            });
        },
        // 添加数据
        handleAdd() {
            // 清空数据
            this.resetFormData();
            // 再操作其他的;
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
                specsname: row.specsname,
                status: row.status,
            };
            // 将字符串转换成对象形式的数据;
            this.ruleForm.attrs = row.attrs.map((item) => {
                return { value: item };
            });
            this.ruleForm.id = row.id;
            // console.log(this.ruleForm);
        },
        // 删除 根据id来删除数据而不是uid
        handleDelete(row) {
            // console.log(row.id);
            this.$http.post("/api/specsdelete", { id: row.id }).then((res) => {
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
                    this.getAllSpecs(
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
                specsname: "",
                attrs: [{ value: "" }],
                status: "1",
            };
            this.status = true;
        },
        // 操作之后不能更新数据页面
        // 添加属性
        addAttr() {
            // console.log(this.ruleForm.attrs);
            this.ruleForm.attrs.unshift({ value: "" }); //  如何更新数据 马上渲染到页面中
            // console.log(this.ruleForm.attrs);
            // 原因：动态数据中存在数组嵌套对象, 对象嵌套数组的情况时候，vue 无法检测到数据深层次的变化;
            //   this.$forceUpdate();每次数据发生变化时候，强制渲染数据;
            this.$forceUpdate();
        },
        // 删除属性
        delAttr(index) {
            // this.ruleForm.attrs = this.ruleForm.attrs.filter((item) => {
            //     return attr != item.value;
            // });
            this.ruleForm.attrs.splice(index, 1);
            this.$forceUpdate();
        },

        // 提交表单
        handleSubmit(formName) {
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    // 添加用户
                    this.addSpecs();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加用户
        addSpecs() {
            this.dialogVisible = false;
            // 将属性的对象数组转换成字符串"bb,aa"向上传递;
            let attrs = this.ruleForm.attrs.map((item) => item.value);
            this.ruleForm.attrs = attrs.join(",");

            // console.log(this.ruleForm);
            let url = this.ruleForm.id ? "/api/specsedit" : "/api/specsadd";

            // 请求数据
            this.$http.post(url, this.ruleForm).then((res) => {
                // console.log(res);
                if (res.code === 200) {
                    //  提醒数据更新成功更新页面数据
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });
                    // 获取所有商品信息
                    // 更新页面的数据;  请求都是异步的 需要将数据返回之后才能使用数据
                    // md  太难了 导致我有时候获取不到数据~~~fine!

                    if (this.ruleForm.id) {
                        // 修改数据 更新当前页面的数据
                        this.getAllSpecs(
                            this.pages.currentPage,
                            this.pages.pageSize
                        );
                        return;
                    }

                    this.$http.get("/api/specscount").then((res) => {
                        if (res.code === 200) {
                            this.pages.totals = res.list[0].total;
                            this.pages.pageCount = Math.ceil(
                                this.pages.totals / this.pages.pageSize
                            );
                            // console.log(this.pages.pageCount);

                            //  添加数据需要看见最新的数据;
                            this.pages.currentPage = this.pages.pageCount;

                            this.getAllSpecs(
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
                // 清空表单的数据
                this.resetFormData();
            });
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

.addAttrsInp {
    width: 60%;
}

.addAttrsInp.el-input {
    width: 240px;
    margin-bottom: 10px;
}

.attrItem {
    &:nth-child(n+2) {
        margin-left: 54px;
    }
}
</style>