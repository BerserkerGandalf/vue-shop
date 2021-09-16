<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
          <el-col :span="8">
            <el-input placeholder="请输入内容" v-model=" queryIfon.query" clearable>
                 <el-button slot="append" icon="el-icon-search">搜索</el-button>
            </el-input>
          </el-col>
      </el-row>
      <!-- -table表格 -->
      <el-table :data="ordersList" border stripe>
          <!-- 索引列 -->
          <el-table-column type="index" label="序号"></el-table-column>
          <el-table-column label="订单编号" prop="order_number"></el-table-column>
          <el-table-column label="订单价格(元)" width="100px" prop="order_price"></el-table-column>
          <el-table-column label="是否付款" width="100px">
              <template v-slot="scope">
                  <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                  <el-tag type="danger"  v-else>未付款</el-tag>
              </template>
          </el-table-column>
          <el-table-column label="是否发货" width="100px" prop="is_send"></el-table-column>
          <el-table-column label="下单时间" width="200px" prop="create_time">
              <template v-slot="scope">
                  {{scope.row.create_time | dataFormat}}
              </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
              <template v-slot="scope">
                  <el-button type="primary" size="mini" icon="el-icon-edit" @click="showBox"></el-button>
                  <el-button type="success" size="mini" icon="el-icon-location" @click="showProgressBox"></el-button>
              </template>
          </el-table-column>
      </el-table>
       <!-- 分页区域 -->
     <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryIfon.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="queryIfon.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total" background>
    </el-pagination>
    </el-card>
    <!-- 修改底子对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
            <el-form-item label="省/市/区/县" prop="address1">
                <el-cascader :options="cityData" v-model="addressForm.address1" expand-trigger="hover"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressVisible = false">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 展示物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="ProgressVisible" width="50%">
        <!-- 时间线，渲染物流进度 -->
        <el-timeline>
            <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
                {{activity.context}}
            </el-timeline-item>
        </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './citydata'
export default {
    data() {
        return {
            cityData,
            ordersList:[],
            total:0,
            queryIfon: {
                query:'',
                pagenum: 1,
                pagesize:10,
            },

            addressVisible:false,
            ProgressVisible:false,
            progressInfo:[],

            addressForm:{
                address1:[],
                address2:''
            },
            addressFormRules:{
                address1:[
                    {required:true,message:'请选择省市区',trigger:'blur'}
                ],
                 address2:[
                    {required:true,message:'请输入详细地址',trigger:'blur'}
                ]
            },
            
        }
    },
    created() {
        this.getOrdersList()
    },
    methods: {
        async getOrdersList() {
            const {data:res} = await this.$http.get('orders',{params:this.queryIfon})
            if(res.meta.status !== 200) {
                return this.$message.error('获取订单数据列表失败！')
            } 
            this.ordersList = res.data.goods
            this.total = res.data.total

        },handleSizeChange(newSize) {
            this.queryIfon.pagesize = newSize
            this.getOrdersList()
        },
        handleCurrentChange(newPage) {
            this.queryIfon.pagenum = newPage
            this.getOrdersList()
        },
        showBox() {
            this.addressVisible = true
        },
        addressDialogClosed() {
            this.$refs.addressFormRef.resetFields()
        },
        async showProgressBox() {
            const {data:res} = await this.$http.get('/kuaidi/1106975712662')
            if(res.meta.status !== 200) {
                this.$message.error('获取物流信息失败')
            }
            this.progressInfo = res.data
            this.ProgressVisible = true
        },
    }
}
</script>
<style scoped>
.el-cascader {
    width: 100%;
}
</style>
