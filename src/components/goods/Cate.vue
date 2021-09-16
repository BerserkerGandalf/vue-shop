<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域   -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格区域 ( 使用插件实现 vue-table-with-tree-grid)-->
        <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:blue"></i>
                <i class="el-icon-error" v-else style="color:red"></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag type="warning" size="mini" v-else>三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deletedCate(scope.row.cat_id)">删除</el-button>
            </template>
        </tree-table>
        <!-- 分页区域 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="提示" :visible.sync="addCateDialogVisible" width="50%" @click="addCateDialogClosed" :close-on-click-modal="false">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
             <el-form-item label="父级分类">
                 <!-- options 指定数据源，  props 用来指定配置对象-->
                <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" 
                expand-trigger="hover" clearable change-on-select>
                </el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%" :close-on-click-modal="false">
        <el-form :model="editCateForm" :rules="addCateFormRules" ref="editCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
                <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
        // 查询条件
        queryInfo:{
            type:3,
            pagenum:1,
            pagesize:5
        },
        // 商品分类的数据列表，默认为空
        cateList:[],
        // 总条数
        total:0,
        columns:[
            {
                label: '分类名称',
                prop: 'cat_name'
            },
            {
                label: '是否有效',
                // 表示 将当前列定义为模板
                type: 'template',
                // 表示当前这一类使用模板名称
                template: 'isok'
            },
            {
                label: '排序',
                // 表示 将当前列定义为模板
                type: 'template',
                // 表示当前这一类使用模板名称
                template: 'order'
            },
            {
                label: '操作',
                // 表示 将当前列定义为模板
                type: 'template',
                // 表示当前这一类使用模板名称
                template: 'opt'
            },
        ],
        // 控制添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
         // 控制修改分类对话框的显示与隐藏
        editCateDialogVisible:false,
        editCateForm:{cat_name:'',cat_id:0},
        // 添加分类表单数据对象
        addCateForm:{
            // 将要添加分类的名称
            cat_name:'',
            // 父分类的id 
            cat_pid: 0,
            // 等级分类 0 表示一级分类,默认为一级
            cat_level:0
        },
        addCateFormRules:{
            cat_name:[
                {required:true,message:'请输入分类名称',trigger:'blur'}
            ]
        },
        // 父级分类列表
        parentCateList:[],
        // 用来指定级联选择器配置对象
        cascaderProps:{
            value:'cat_id',
            label:'cat_name',
            children:'children'
        },
        // 选中父级分类的ID数组
        selectedKeys:[],
    }
  },
  created() {
      this.getCateList()
  },
  methods: {
      async getCateList() {
          const {data : res} = await this.$http.get('categories',{params:this.queryInfo})
          if(res.meta.status !== 200) {
              return this.$message.error('获取商品分类失败！');
          }
        //   把数据列表 赋给 cateList
          this.cateList = res.data.result
        //   商品数据总条数
        console.log(this.cateList)
          this.total = res.data.total
      },
    //   监听 pageSize 的改变
      handleSizeChange(newSize) {
          this.queryInfo.pagesize = newSize
          this.getCateList()
      },
    //   监听 pagenum 的改变
      handleCurrentChange(newPage) {
          this.queryInfo.pagenum = newPage
          this.getCateList()
      },
    //   显示添加分类对话框
      showAddCateDialog() {
          this.getParentCateList()
          this.addCateDialogVisible = true
      },
    //   获取父级分类的列表
      async getParentCateList() {
        const {data:res} = await this.$http.get('categories',{params:{type:2}})
        if(res.meta.status !== 200) {
            return this.$message.error('获取父级分类数据失败！')
        }
        console.log(res.data)
        this.parentCateList = res.data
      },
    //   选择项发生变化触发这个函数
      parentCateChanged() {
          console.log(this.selectedKeys)
        // 如果数组 selectedKeys 长度大于 0 证明 有选中父级分类
        // 反之，就说明没有选中任何父级分类
        if(this.selectedKeys.length > 0) {
            // 父级分类的iD
           this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
           // 为当前分类 等级 赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
        } else {
             // 父级分类的iD
           this.addCateForm.cat_pid = 0
            //  为当前分类 等级 赋值
            this.addCateForm.cat_level = 0
        }
      },
    //   点击确定按钮,添加分类
       addCate() {
        console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
            if(!valid) return
           const {data:res} = await this.$http.post('categories',this.addCateForm)

           if(res.meta.status !== 201) {
               this.$message.error('添加分类失败！');
           }
           this.$message.success('添加分类成功！')
           this.getCateList()
           this.addCateDialogVisible = false
        })
      },
    //   监听对话框事件 重置 表单数据
      addCateDialogClosed() {
          this.$refs.addCateFormRef.resetFields()
          this.selectedKeys = []
          this.addCateForm.cat_level = 0
          this.addCateForm.cat_pid = 0
      },
    //   删除商品分类
      async deletedCate(id) {
        
        const resConfirm = await this.$confirm('此操作将永久删除该分类,是否继续?','提示', {
        confirmButtonText: '确定',
        canceButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

        if(resConfirm !== 'confirm'){
            return this.$message.info('已取消删除！')
        }

        const {data:res} = await this.$http.delete('categories/' + id)
        if(res.meta.status !== 200) {
            return this.$message.error('删除失败！')
        }
        this.$message.success(res.meta.msg || '删除成功！')
        this.getCateList()
      },
    // 显示编辑商品弹窗  
    showEditCateDialog(row) {
        this.editCateForm = row
        this.editCateDialogVisible = true
    },
    //   修改商品分类
    editCate() {
        console.log(this.editCateForm.cat_name)
        this.$refs.editCateFormRef.validate(async valid => {
            if(!valid) return
            const {data:res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
            if(res.meta.status !== 200) {
                return this.$message.error('修改失败！')
            }
            this.$message.success(res.meta.msg || '修改成功！')
            this.getCateList()
            this.editCateDialogVisible = false
        })
    }
  }
}
</script>
<style>
.el-cascader__dropdown {
    height: 300px;
    overflow-y: scroll;
}
</style>
<style scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;  
}
/* .el-cascader__dropdownr {
    width: 100%;
    height: 300px !important;
    overflow-y: scroll !important;
} */
</style>
