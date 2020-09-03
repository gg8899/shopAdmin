<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>分类列表</el-breadcrumb-item>
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
                <el-table-column width="180px" label="分类名称" prop="catename">
                    <!--  -->
                </el-table-column>
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
                        <el-button size="mini" type="danger" @click="comfirmDel(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 弹出对话框 -->
            <el-dialog :title="'分类' +tip" :visible.sync="dialogVisible" width="40%">
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item label="上级分类" prop="pid">
                        <el-select
                            v-model="ruleForm.pid"
                            ref="f1"
                            @change="changeMenu"
                            placeholder="请输入上级分类"
                        >
                            <el-option label="顶层分类" :value="'0'" :key="0"></el-option>
                            <el-option
                                v-for="item in cate"
                                :label="item.catename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="catename" label="分类名称">
                        <el-input v-model="ruleForm.catename"></el-input>
                    </el-form-item>
                    <!-- 图片上传 -->
                    <!-- 图片上传路径 图片卡槽 图片上传地址 -->
                    <el-form-item label="分类图片" prop="img">
                        <el-upload
                            action="#"
                            list-type="picture-card"
                            :auto-upload="false"
                            :on-change="fileUpload"
                            :file-list="fileList"
                        >
                            <!-- 上传 -->
                            <i slot="default" class="el-icon-plus"></i>
                            <!-- 图片缩略插槽 -->
                            <div slot="file" slot-scope="{file}">
                                <img class="el-upload-list__item-thumbnail" :src="file.url" alt />
                                <span class="el-upload-list__item-actions">
                                    <!-- 处理图片信息 -->
                                    <span
                                        class="el-upload-list__item-preview"
                                        @click="handlePictureCardPreview(file)"
                                    >
                                        <i class="el-icon-zoom-in"></i>
                                    </span>
                                    <!-- 删除图片 -->
                                    <span
                                        v-if="!disabled"
                                        class="el-upload-list__item-delete"
                                        @click="handleRemove(file)"
                                    >
                                        <i class="el-icon-delete"></i>
                                    </span>
                                </span>
                            </div>
                        </el-upload>
                        <!-- 上传图片的对话框 -->
                        <el-dialog :visible.sync="dialogImgVisible">
                            <img width="100%" :src="dialogImageUrl" alt />
                        </el-dialog>
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
import axios from "axios";
export default {
    mounted() {
        this.getAllCates();
    },
    data() {
        return {
            tableData: [], //  表单数据
            tip: "", //  对话框的名称
            dialogVisible: false, //  对话的显示
            ruleForm: {
                pid: "",
                catename: "",
                img: "", //图片
                status: "1", //  1正常2禁用
            }, // 表单结构数据
            status: true, //  状态
            rules: {
                pid: [
                    {
                        required: true,
                        message: "请选择上级分类",
                        trigger: "blur",
                    },
                ],
                catename: [
                    {
                        required: true,
                        message: "请输入分类名称",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 5,
                        message: "长度在 2 到 5 个字符",
                        trigger: "blur",
                    },
                ],
            }, // 表单验证规则
            cate: "",
            // 图片上传的参数
            dialogImageUrl: "",
            dialogImgVisible: false,
            disabled: false,
            fileList: [], //文件上传
        };
    },
    methods: {
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
        // 获取所有的目录列表
        getAllCates() {
            // 请求数据获取树形结构
            this.$http.get("/api/catelist?istree=1").then((res) => {
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
        //   获取所有目录
        getCate() {
            this.$http.get("/api/catelist").then((res) => {
                // console.log(res.list);
                this.cate = res.list;
            });
        },

        // 切换状态     状态1正常2禁用
        changeStatus(val) {
            // 根据 切换的 boolean 决定状态
            this.ruleForm.status = val ? "1" : "2";
        },
        // 切换下拉框
        changeMenu(val) {
            //  一级目录的pid为 0
            // console.log(val);
            this.ruleForm.pid = val;
        },

        // 添加
        handleAdd() {
            this.tip = "添加";
            this.dialogVisible = true;
            this.getCate();
        },
        // 编辑
        handleEdit(row) {
            // 获取目录
            this.getCate();

            this.tip = "编辑";
            this.dialogVisible = true;
            //  根据角色id 来获取菜单权限
            // console.log(row);
            this.ruleForm = {
                pid: String(row.pid),
                catename: row.catename,
                img: row.img, //图片
                status: String(row.status), //  1正常2禁用
            };

            this.status = row.status == "1" ? true : false;
            this.ruleForm.id = row.id;

            // 图片预览图
            //设置图片预览图
            this.fileList = [
                { name: "", url: "http://localhost:3000" + this.ruleForm.img },
            ];
        },

        // 提交数据
        handleSubmit(formName) {
            // 验证数据
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    this.addCate();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加角色
        addCate() {
            //根据id来确认是否添加或者修改元素
            // 校验成功
            this.dialogVisible = false;
            // 有无id显示  无id显示是添加数据，有id显示是修改数据;
            // console.log(this.ruleForm.id);

            let url = this.ruleForm.id ? "/api/cateedit" : "/api/cateadd";

            // 数据的封装显示
            let formData = new FormData();
            for (let key in this.ruleForm) {
                formData.append(key, this.ruleForm[key]);
            }
            // 请求数据=============
            axios({
                method: "post",
                data: formData,
                url,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: sessionStorage.getItem("token"),
                },
            }).then((res) => {
                // console.log(res);
                if (res.code == 200) {
                    this.$message({
                        type: "success",
                        message: res.msg,
                    });
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }
                // 插入数据失败
                this.resetRuleForm();
                // 更新数据
                this.getAllCates();
            });
        },
        // 将数据清空
        resetRuleForm() {
            this.ruleForm = {
                pid: "",
                catename: "",
                img: "", //图片
                status: "1", //  1正常2禁用
            };
            document.querySelector(
                ".el-upload-list.el-upload-list--picture-card"
            ).innerHTML = "";
            this.fileList = [];
            this.state = true;
            this.cate = "";
        },

        // 取消按钮
        handleReset() {
            this.dialogVisible = false;
            // 清空数据
            this.resetRuleForm();
        },

        // 删除用户
        handleDelete(row) {
            // console.log(row);
            this.$http.post("/api/catedelete", { id: row.id }).then((res) => {
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
        // ========================================
        // 上传图片的事件

        // 删除图片
        handleRemove(file) {
            // console.log(file);   //  文件信息
            document.querySelector(
                ".el-upload-list.el-upload-list--picture-card"
            ).innerHTML = "";
            this.fileList = [];
        },
        // 处理事件
        handlePictureCardPreview(file) {
            // console.log(file.raw);
            this.dialogImageUrl = file.url;
            this.dialogImgVisible = true;
            // 将文件信息存入
        },

        // 上传的文件信息
        fileUpload(file) {
            // console.log(file.raw);
            this.ruleForm.img = file.raw;
        },
    },
};
</script>

<style lang="stylus" scoped>
#addBtn {
    margin: 20px 0px 15px;
}
</style>