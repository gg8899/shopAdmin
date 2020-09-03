<template>
    <div class="container">
        <el-row justify="center" type="flex" :gutter="10">
            <el-col :span="11">
                <h2>商品总览</h2>
                <div class="box">
                    <div>100</div>
                    <div>400</div>
                    <div>50</div>
                    <div>500</div>
                </div>
                <div class="box">
                    <div>已下架</div>
                    <div>已上架</div>
                    <div>库存紧张</div>
                    <div>全部商品</div>
                </div>
            </el-col>
            <el-col :span="11">
                <h2>用户总览</h2>
                <div class="box">
                    <div>100</div>
                    <div>200</div>
                    <div>1000</div>
                    <div>5000</div>
                </div>
                <div class="box">
                    <div>今日新增</div>
                    <div>昨日新增</div>
                    <div>本月新增</div>
                    <div>会员总数</div>
                </div>
            </el-col>
        </el-row>
        <el-row justify="center" type="flex">
            <el-col :span="20">
                <div id="myEchart" style="height:280px;"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
// 引入文件
import Echarts from "echarts";
export default {
    mounted() {
        // 基于准备好的dom，初始化echarts实例
        var myChart = Echarts.init(document.getElementById("myEchart"));

        // 指定图表的配置项和数据
        var option = {
            toolbox: {
                feature: {
                    saveAsImage: {},
                },
                width: 30,
                right: 80,
            },
            legend: {   //图例组件。
                data: ["近一周订单数量", "上一周订单数量"], //  此处的数据对应series中name中设置的value值
            },
            grid: { //  网格
                left: "3%",
                right: "4%",
                bottom: "3%",
                containLabel: true,
            },
            xAxis: {    //  x轴
                type: "category",
                boundaryGap: false,
                data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            },
            yAxis: {    //  y轴
                type: "value",
            },
            series: [   //  曲线配置
                {
                    name: "近一周订单数量",
                    type: "line",
                    stack: "总量",
                    data: ["550", "610", "480", "291", "390", "702", "810"],
                },
                {
                    name: "上一周订单数量",
                    type: "line",
                    stack: "总量",
                    data: ["810", "702", "610", "390", "550", "291", "480"],
                },
            ],
            color: ["blue", "red"], //  设置颜色的属性
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    },
};
</script>


<style  >
.container {
    width: 80%;
    margin: 0 auto;
    border: 1px solid #e5e5e5;
}

.container h2 {
    font-weight: 400;
}
.box {
    margin-top: 10px;
    border: 1px solid #ccc;
    display: flex;
}
.box div {
    flex: 1;
    text-align: center;
}
#myEchart {
    margin-top: 25px;
}
</style>
