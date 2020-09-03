<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>轮播图列表</el-breadcrumb-item>
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
                <el-table-column width="180px" label="轮播图名称" prop="title"></el-table-column>
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
            <el-dialog :title="'轮播图' +tip" :visible.sync="dialogVisible" width="56%">
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px">
                    <el-form-item prop="title" label="轮播图标题">
                        <el-input v-model="ruleForm.title"></el-input>
                    </el-form-item>
                    <!-- 角色权限 使用树状图显示树形结构 -->
                    <!-- 图片上传 -->
                    <!-- 图片上传路径 图片卡槽 图片上传地址 -->
                    <el-form-item label="轮播图图片" prop="img">
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
        this.getAllBanners();
    },
    data() {
        return {
            tableData: [], //  表单数据
            tip: "", //  对话框的名称
            dialogVisible: false, //  对话的显示
            ruleForm: {
                title: "",
                img: "",
                status: "1",
            }, // 表单结构数据
            status: true, //  状态
            rules: {
                title: [
                    {
                        required: true,
                        message: "请轮播图标题",
                        trigger: "blur",
                    },
                    {
                        min: 2,
                        max: 8,
                        message: "长度在 2 到 8 个字符",
                        trigger: "blur",
                    },
                ],
            }, // 表单验证规则
            // 图片上传的参数
            dialogImageUrl: "",
            dialogImgVisible: false,
            disabled: false,
            fileList: [], //文件上传
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
        // 获取所有的角色列表
        getAllBanners() {
            // 请求数据
            this.$http.get("api/bannerlist").then((res) => {
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
            this.tip = "添加";
            this.dialogVisible = true;
        },
        // 编辑角色
        handleEdit(row) {
            // console.log(row);
            this.tip = "编辑";
            this.dialogVisible = true;
            //回显数据
            this.ruleForm = {
                title: row.title,
                status: String(row.status),
            };
            this.status = row.status == "1" ? true : false;

            //设置图片预览图
            this.fileList = [
                { name: "", url: "http://localhost:3000" + row.img },
            ];
            this.ruleForm.id = row.id;
        },

        // 可否使用
        changeStatus(val) {
            // console.log(this.ruleForm.status);
            this.ruleForm.status = val ? "1" : "2";
        },
        // 提交数据
        handleSubmit(formName) {
            // 验证数据
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    this.addBanner();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加角色
        addBanner() {
            //根据id来确认是否添加或者修改元素
            // 校验成功
            this.dialogVisible = false;
            // 有无id显示  无id显示是添加数据，有id显示是修改数据;
            // console.log(this.ruleForm.id);
            // 获取 树状 组将选择权限 数组转化为字符串 准备提交

            let url = this.ruleForm.id ? "/api/banneredit" : "/api/banneradd";
            let formData = new FormData();
            for (let key in this.ruleForm) {
                formData.append(key, this.ruleForm[key]);
            }
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
                    // 更新数据
                    this.getAllBanners();
                } else {
                    this.$message({
                        type: "warn",
                        message: res.msg,
                    });
                }

                // 重置数据
                this.resetRuleForm();
            });
        },
        // 将数据清空
        resetRuleForm() {
            this.ruleForm = {
                title: "",
                img: "",
                status: "1",
            };
            status: true;
            this.fileList = []; //文件上传
            document.querySelector(
                ".el-upload-list.el-upload-list--picture-card"
            ).innerHTML = ""; //  图片清空
        },

        // 取消按钮
        handleReset() {
            this.dialogVisible = false;
            this.resetRuleForm();
        },

        // 删除用户
        handleDelete(row) {
            // console.log(row);
            this.$http.post("/api/bannerdelete", { id: row.id }).then((res) => {
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