<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row gutter="20">
        <el-col span="8">
          <el-input placeholder="请输入内容" v-model="queryIfon.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- table 表格区 -->
     <el-table :data="goodsList" border stripe>
       <el-table-column type="index" label="序号"> </el-table-column>
       <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
       <el-table-column prop="goods_price" label="商品价格(元)" width="95px"> </el-table-column>
       <el-table-column prop="goods_weight" label="商品重量" width="70px"> </el-table-column>
       <el-table-column prop="add_time" label="创建时间" width="140px">
           <template v-slot="scope">
               {{scope.row.add_time | dataFormat}}
           </template>
       </el-table-column>
       <el-table-column label="操作" width="180px">
           <template v-slot="scope">
               <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
               <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeById(scope.row.goods_id)">删除</el-button>
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
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryIfon: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      goodsList:[],
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryIfon
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      this.total = res.data.total
      console.log(this.total)
      this.goodsList = res.data.goods
    },
    // 监听 page-size 改变事件
    handleSizeChange (newsize) {
        this.queryIfon.pagesize = newsize
        this.getGoodsList()
    },
    // 监听页码值对的改变
    handleCurrentChange(newPage) {
        this.queryIfon.pagenum = newPage
        this.getGoodsList()
    },
    // 删除商品
    async removeById(goods_id) {
        const resConfirm = await this.$confirm('此操作将永久删除该,是否继续?','提示', {
        confirmButtonText: '确定',
        canceButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(resConfirm !== "confirm") {
        return this.$message.info('已取消删除')
      } 
      const {data : res} = await this.$http.delete('goods/' + goods_id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success('删除成功!')
      this.getGoodsList()
    },
    goAddPage() {
        this.$router.push('/goods/add')
    },
  }
}
</script>
<style scoped></style>
