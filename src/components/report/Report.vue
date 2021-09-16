<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 1. 为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 800px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 2.导入 ECharts
import * as echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
        // 需要合并的数据,使用 lodash 的深拷贝
        options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  // mounted() 页面元素渲染完成后才会执行
  async mounted() {
    // 3. 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    const {data:res} = await this.$http.get('reports/type/1')
    if(res.meta.status !== 200) {
        return this.$message.error('获取折线图数据失败')
    }

    // 4. 指定图表的配置项和数据 把服务器返回的数据 options 数据进行合并 （使用lodash提供的merge方法合并）
    const result = _.merge(res.data, this.options)
 
    // 5. 使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  }
}
</script>
<style scoped></style>
