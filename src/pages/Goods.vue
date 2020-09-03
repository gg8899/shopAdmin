<template>
    <div>
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <div>
            <el-button
                id="addBtn"
                type="primary"
                @click="handleAdd()"
                style="margin:25px 0px 15px"
            >添加</el-button>
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
                <el-table-column prop="firstcatename" label="一级分类" width="180"></el-table-column>
                <el-table-column prop="secondcatename" label="二级分类" width="150"></el-table-column>
                <el-table-column prop="goodsname" label="商品名称" width="150"></el-table-column>
                <el-table-column prop="price" label="销售价" width="150"></el-table-column>
                <el-table-column prop="market_price" label="市场价" width="150"></el-table-column>
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
                style="text-align:right;margin-top:20px"
            ></el-pagination>
            <!-- 弹出对话框 -->
            <el-dialog :title="'商品' +tip" :visible="dialogVisible" width="55%" @close="handleReset">
                <!-- 提交表单 -->
                <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
                    <el-form-item label="一级分类" prop="first_cateid">
                        <el-select
                            v-model="ruleForm.first_cateid"
                            placeholder="请选择分类"
                            @change="selectFirstCate"
                        >
                            <el-option
                                v-for="item in firstCate"
                                :label="item.catename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="二级分类" prop="second_cateid">
                        <el-select v-model="ruleForm.second_cateid" placeholder="请选择分类">
                            <el-option
                                v-for="item in secondCate"
                                :label="item.catename"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="goodsname" label="商品名称">
                        <el-input v-model="ruleForm.goodsname" placeholder="请选择商品名称"></el-input>
                    </el-form-item>
                    <!-- 商品图片 -->
                    <!-- 图片上传路径 图片卡槽 图片上传地址 -->
                    <el-form-item label="商品图片" prop="img">
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
                    <el-form-item label="商品规格名称">
                        <el-select
                            v-model="ruleForm.specsid"
                            placeholder="请选择商品规格名称"
                            @change="selectSpecsattr"
                        >
                            <el-option
                                v-for="item in specsarr"
                                :label="item.specsname"
                                :key="item.id"
                                :value="item.id.toString()"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="商品规格值">
                        <!-- multiple:可选复数个 -->
                        <el-select
                            v-model="ruleForm.specsattr"
                            :multiple="true"
                            placeholder="请选择商品规格值"
                        >
                            <el-option
                                v-for="(item,index) in specsattrs"
                                :label="item"
                                :key="index"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item prop="price" label="销售价">
                        <el-input
                            v-model="ruleForm.price"
                            type="number"
                            :disabled="!ruleForm.status"
                        ></el-input>
                    </el-form-item>
                    <el-form-item prop="market_price" label="市场价">
                        <el-input
                            v-model="ruleForm.market_price"
                            type="number"
                            :disabled="!ruleForm.status"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="是否新品">
                        <el-radio v-model="ruleForm.isnew" :label="true">是</el-radio>
                        <el-radio v-model="ruleForm.isnew" :label="false">否</el-radio>
                    </el-form-item>
                    <el-form-item label="是否热卖">
                        <el-radio v-model="ruleForm.ishot" :label="true">是</el-radio>
                        <el-radio v-model="ruleForm.ishot" :label="false">否</el-radio>
                    </el-form-item>
                    <!-- 富文本编译器的容器 -->
                    <el-form-item label="商品描述" class="goodseditor">
                        <div id="editor"></div>
                    </el-form-item>
                    <!-- 状态栏 -->
                    <!-- 状态1正常2禁用 @change="changeStatus" -->
                    <el-form-item label="状态">
                        <el-radio v-model="ruleForm.status" :label="true">上架</el-radio>
                        <el-radio v-model="ruleForm.status" :label="false">下架</el-radio>
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
import $ from "jquery";
import axios from "axios";
import E from "wangeditor";
export default {
    mounted() {
        // 获取管理员的数据 page 页面数 size 每页显示的条数
        this.getAllGoods(this.pages.currentPage, this.pages.pageSize);
        this.getGoodsTotal();
    },
    data() {
        return {
            tableData: [],
            tip: "",
            dialogVisible: false, //  对话的显示
            ruleForm: {
                first_cateid: "", //一级分类编号
                second_cateid: "", //二级分类编号
                goodsname: "", //商品名称
                price: "", //商品价格
                market_price: "", //市场价格
                img: "", //商品图片（文件）
                description: "", //商品描述
                specsid: "", //商品规格编号
                specsattr: "", // 商品规格属性
                isnew: true, //是否新品
                ishot: true, //是否热卖推荐
                status: true, //状态1正常2禁用
                //
            },
            firstCate: [], //  一级分类列表
            secondCate: [], //  二级分类列表
            specsarr: [], //  属性类表
            specsattrs: [], //  属性值列表
            // 富文本编译器实例
            editor: null,
            rules: {
                goodsname: [
                    {
                        required: true,
                        message: "请输入商品名称",
                        trigger: "blur",
                    },
                ],
                price: [
                    {
                        required: true,
                        message: "请输入商品价格",
                        trigger: "blur",
                    },
                ],
            },

            pages: {
                totals: 1, //  总用户数数
                pageCount: 1, //  总计页面数
                currentPage: 1, //  当前页面
                pageSize: 2, //  当前页面显示的条数
            },
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
        // 更改当前页面
        changePage(v) {
            this.pages.currentPage = v;
            this.getAllGoods(this.pages.currentPage, this.pages.pageSize);
        },
        // 获取所有商品总数
        getGoodsTotal() {
            this.$http.get("/api/goodscount").then((res) => {
                if (res.code === 200) {
                    this.pages.totals = res.list[0].total;
                }
            });
        },
        // 获取当前页面所有商品信息
        getAllGoods(page, size) {
            // console.log(page,size);
            this.$http
                .get("/api/goodslist?page=" + page + "&size=" + size)
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
            // 创建文本编辑器
            this.dialogVisible = true;
            this.tip = "添加";
            // 清空富文本编辑内内容
            setTimeout(() => {
                // 延时创建文本编辑器
                this.createEdtor();
            }, 0);
            // 获取菜单数据 默认获取一级数据
            this.getCate();
            // 获取商品规格
            this.getSpecs();
        },

        // 根据pid获取菜单数据
        getCate(pid = 0) {
            this.$http.get("/api/catelist?pid=" + pid).then((res) => {
                // console.log(res);
                if (res.code == 200) {
                    if (pid === 0) {
                        // 获取成功
                        this.firstCate = res.list;
                    } else {
                        // 获取二级目录
                        this.secondCate = res.list;
                    }
                }
            });
        },
        // 根据选择的一级目录获取二级目录中的数据
        selectFirstCate(pid) {
            // console.log(pid);
            this.getCate(pid);
        },

        // 获取商品规格
        getSpecs() {
            // 新创建的数据没有属性值，属性为空; 需要后续添加数据，然后添加到数据中去
            // 如果通过编辑打开那么就，根据 this.ruleForm.specsid  设置当前的属性值

            // 获取所有的商品规格specs
            this.$http.get("/api/specslist").then((res) => {
                // console.log(res, this.ruleForm.specsid);
                // 获取所有的规格
                this.specsarr = res.list;
                this.specsarr.map((item) => {
                    if (item.id === this.ruleForm.specsid) {
                        // 展示的规格属性
                        this.specsattrs = item.attrs;
                    }
                });

                // console.log(this.specsattrs)
            });
        },
        // 属性切换
        selectSpecsattr(specsid) {
            // 获取商品规格之前，需要将属性值清空~~~
            this.ruleForm.specsattr = "";

            // console.log(this.ruleForm.specsattr);
            // console.log(specsid);
            // 根据切换的specsid来获取对应的属性 记得要类型转化
            var nowselect = this.specsarr.find((item) => {
                return item.id === Number(specsid);
            });
            // 获取属性值
            // console.log(nowselect, this.specsarr);
            this.specsattrs = nowselect.attrs;
            // console.log(this.specsattrs);    //  要展示的规格的值
        },

        // 创建文本编辑器
        createEdtor() {
            // console.log(document.getElementById("editor"));
            // $("#editor").empty();
            // 1.创建实例，传入容器的名称作为参数，指定容器
            this.editor = new E("#editor");

            // 2.绑定用户的输入操作事件：  html 用户输入的内容
            this.editor.customConfig.onchange = (html) => {
                // console.log(html)
                // 将用户输入的内容和 表单描述绑定
                this.ruleForm.description = html;
            };
            //3. 创建富文本编辑器
            this.editor.create();
            // 富文本编辑框预设文字

            this.editor.txt.html(this.ruleForm.description);
        },

        // 编辑
        handleEdit(row) {
            // console.log(row);
            this.dialogVisible = true;
            this.tip = "编辑";
            // 清空富文本编辑内内容
            setTimeout(() => {
                // 延时创建文本编辑器
                this.createEdtor();
            }, 0);
            // 获取菜单数据 默认获取一级数据
            this.getCate();
            // 获取商品规格
            this.getSpecs();

            // 回显数据
            this.ruleForm = {
                first_cateid: row.first_cateid.toString(), //一级分类编号
                second_cateid: row.second_cateid.toString(), //二级分类编号
                goodsname: row.goodsname, //商品名称
                price: row.price, //商品价格
                market_price: row.market_price, //市场价格
                img: row.img, //商品图片（文件）
                description: row.description, //商品描述
                specsid: row.specsid.toString(), //商品规格编号
                specsattr: row.specsattr, // 商品规格属性
            };
            row.first_cateid ? this.getCate(row.first_cateid) : "";

            // 处理数据
            this.ruleForm.ishot = row.ishot === 1 ? true : false; //是否热卖推荐 状态1热卖 2非热卖
            this.ruleForm.isnew = row.isnew === 1 ? true : false; //是否新品  状态1新品 2 非新品
            this.ruleForm.status = row.status === 1 ? true : false; //1正常 2禁用

            // 规格值重新 字符串变数组
            this.ruleForm.specsattr = row.specsattr
                ? row.specsattr.split(",")
                : "";

            // 显示图片
            if (row.img) {
                this.fileList = [
                    { name: "", url: "http://localhost:3000" + row.img },
                ];
            }

            // 添加id属性
            this.ruleForm.id = row.id;
            // console.log(this.ruleForm.specsattr);
        },
        // 删除 根据id来删除数据而不是uid
        handleDelete(row) {
            // console.log(row.id);
            this.$http.post("/api/goodsdelete", { id: row.id }).then((res) => {
                // console.log(res);
                if (res.code == 200) {
                    this.$message({
                        type: "success",
                        message: "删除成功",
                    });
                    // 更新页面的数据;
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
                    this.getAllGoods(
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

        // 取消提交
        handleReset() {
            this.dialogVisible = false;
            this.resetFormData();
        },
        // 重置表单提交的数据
        resetFormData() {
            this.ruleForm = {
                first_cateid: "", //一级分类编号
                second_cateid: "", //二级分类编号
                goodsname: "", //商品名称
                price: "", //商品价格
                market_price: "", //市场价格
                img: "", //商品图片（文件）
                description: "", //商品描述
                specsid: "", //商品规格编号
                specsattr: "", // 商品规格属性
                isnew: true, //是否新品
                ishot: true, //是否热卖推荐
                status: true, //状态1正常2禁用
            };
            this.firstCate = []; //  一级分类列表
            this.secondCate = []; //  二级分类列表
            this.specsarr = []; //  属性类表
            this.specsattrs = []; //  属性值列表
            // 富文本编译器实例
            this.editor = null;

            // 清空上传的图片
            document.querySelector(
                ".el-upload-list.el-upload-list--picture-card"
            ).innerHTML = "";
            this.fileList = [];
        },

        // 提交表单
        handleSubmit(formName) {
            // 提交数据 之前验证表单
            this.$refs[formName].validate((valid) => {
                // console.log(valid);
                if (valid) {
                    // 添加商品
                    this.addGoods();
                } else {
                    this.$message({
                        type: "warn",
                        message: "格式不正确",
                    });
                }
            });
        },
        // 添加商品
        addGoods() {
            // 清空表单的数据

            this.dialogVisible = false;
            // 处理数据
            this.ruleForm.ishot = this.ruleForm.ishot ? "1" : "2"; //是否热卖推荐 状态1热卖 2非热卖
            this.ruleForm.isnew = this.ruleForm.ishot ? "1" : "2"; //是否新品  状态1新品 2 非新品
            this.ruleForm.status = this.ruleForm.ishot ? "1" : "2"; //1正常 2禁用
            // 规格值重新 数组变字符串
            this.ruleForm.specsattr = this.ruleForm.specsattr
                ? this.ruleForm.specsattr.join(",")
                : "";
            let url = this.ruleForm.id ? "/api/goodsedit" : "/api/goodsadd";
            // 使用原生axios来提交数据

            let data = new FormData();
            for (let i in this.ruleForm) {
                data.append(i, this.ruleForm[i]);
            }
            axios({
                method: "post",
                url,
                data,
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
                    // 获取所有商品信息
                    // 更新页面的数据;  请求都是异步的 需要将数据返回之后才能使用数据
                    // md  太难了 导致我有时候获取不到数据~~~fine!

                    if (this.ruleForm.id) {
                        // 修改数据 更新当前页面的数据
                        this.getAllGoods(
                            this.pages.currentPage,
                            this.pages.pageSize
                        );
                        return;
                    }

                    this.$http.get("/api/goodscount").then((res) => {
                        if (res.code === 200) {
                            this.pages.totals = res.list[0].total;
                            this.pages.pageCount = Math.ceil(
                                this.pages.totals / this.pages.pageSize
                            );
                            // console.log(this.pages.pageCount);

                            //  添加数据需要看见最新的数据;
                            this.pages.currentPage = this.pages.pageCount;

                            this.getAllGoods(
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

<style lang="stylus" >
// 富文本编辑器
.goodseditor .el-form-item__label {
    float: none;
}
</style>