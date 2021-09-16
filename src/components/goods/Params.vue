<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" type="warning" :closable="false"> </el-alert>
      <el-row class="cat_opt">
          <el-col>
              <span>选择商品分类: </span>
              <!-- 选择商品的级联 选择框-->
              <el-cascader expand-trigger="hover" :props="cateProps" :options="cateList" v-model="selectedCateKeys" @change="handleChange"></el-cascader>
          </el-col>
      </el-row>
      <!-- tabs页签区域 -->
      <el-tabs active-name="many" v-model="activeName" type="card" @tab-click="handleTabClick">
          <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
            <!-- 添加参数按钮 -->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-tag closable v-for="(item1,l1) in scope.row.attr_vals" :key="l1" @close="handleDeleted(l1,scope.row)">{{item1}}</el-tag>
                         <!-- 文本输入框 -->
                        <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" 
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope"> 
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
            <!-- 添加属性按钮 -->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- 循环渲染的 tag标签 -->
                        <el-tag closable v-for="(item2,l2) in scope.row.attr_vals" :key="l2" @close="handleDeleted(l2,scope.row)">{{item2}}</el-tag>
                        <!-- 文本输入框 -->
                        <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" 
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)">
                        </el-input>
                        <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope"> 
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 编辑对话框 -->
    <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="addData">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return {
            // 商品分类列表
            cateList:[],
            // 级联选中框 双向绑定到数组
            selectedCateKeys:[],
            // 联级选择框配置对象
            cateProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children'

            },
            // 被激活的 页签 名称
            activeName:'many',
            // 动态参数的数据
            manyTableData:[],
            // 静态属性的数据
            onlyTableData:[],
            // 对话框的显示与隐藏
            addDialogVisible: false,
            editDialogVisible:false,
            // 表单数据绑定
            addForm:{
                attr_name: ''
            },
            // 表单验证对象
            addFormRules:{
                attr_name: [
                    {required: true, message: '请输入参数名称', trigger: 'blur'}
                ]
            },
            
        }
    },
    created() {
        this.getCateList()
    },
    computed:{
        // 
        isBtnDisabled() {
            // 按钮被禁用 返回 true 否则 返回 false
            if(this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        // 选中三级分类的ID
        cateId() {
            if(this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        // 共用对话框标题切换
        titleText() {
            if(this.activeName === 'many') {
                return '动态参数'
            }
            return '静态属性'
        }
    },
    methods: {
        // 获取商品
        async getCateList() {
            const {data : res} = await this.$http.get('categories')
            if(res.meta.status !== 200) {
                return this.$message.error('获取商品失败！')
            }
            this.cateList = res.data 
        },
        // 联级选择框 选中项 变化 会触发这个函数
        handleChange() {
            this.getParamsData()
        },
        // Tbas 页签 点击事件
        handleTabClick() {
            console.log(this.activeName)
            this.getParamsData()
        },
        // 获取参数列表数据
        async getParamsData() {
            // 如果选中不是 三级 
            if(this.selectedCateKeys.length !== 3) {
                this.selectedCateKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return

            }
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params: {sel:this.activeName}})

            if(res.meta.status !== 200) {
                return this.$message.error('获取参数列表失败！')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                // 控制文本框显示与隐藏
                item.inputVisible = false
                item.inputValue = ''

            })

            if(this.activeName === 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
            
        },
        // 重置修改表单
        editDialogClosed() {
            this.$refs.addFormRef.resetFields()
            this.editForm = {}
        },
        // 点击按钮显示修改对话框
        async showEditDialog(attr_id) {
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName  }})
            this.editDialogVisible = true
            if(res.meta.status !== 200) {
                return this.$message.error('获取信息失败！')
            }
            this.addForm = res.data

        },
        // 点击按钮，修改参数信息
        editParams() {
            
            this.$refs.addFormRef.validate(async valid => {
                if(!valid) return
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.addForm.attr_id}`,{
                    attr_name:this.addForm.attr_name,
                    attr_sel:this.activeName
                })
                if(res.meta.status !== 200) {
                    console.log(this.activeName)
                    return this.$message.error('更新信息失败！')
                }
                this.getParamsData()
                this.editDialogVisible = false
                this.$message.success('更新信息成功！')
            })
        },
        // 点击删除按钮，删除操作
        async removeParams(attr_id) {
            const resConfirm = await this.$confirm('此操作将永久删除,是否继续?','提示', {
            confirmButtonText: '确定',
            canceButtonText: '取消',
            type: 'warning'
      }).catch(err => err)
            if(resConfirm !== 'confirm') {
                return this.$message.info('取消操作')
            } 
            console.log(this.addForm)
            const {data:res} = await this.$http.delete(`categories/${attr_id}/attributes/${this.addForm.attr_id}`)
            if(res.meta.status !== 200) {
                return this.$message.error('删除失败！')
            }
            this.$message.success('删除成功！')
            this.getParamsData()
        },
        // 添加动态参数或者静态属性
        addData() {
            this.$refs.addFormRef.validate(async vaalid => {
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name,attr_sel:this.activeName})
                if(res.meta.status !== 201) {
                    return this.$message.error('添加失败！')
                }
                this.addDialogVisible = false
                this.$message.success('添加成功！')
                this.getParamsData()
            })
        },
        // 文本框失去焦点 或者 按下 enter键触发
        async handleInputConfirm(row) {
            if(row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`
            ,{
                attr_name:row.attr_name,
                attr_sel:this.activeName,
                attr_vals:row.attr_vals.join(',')
            })

            if(res.meta.status !== 200) {
                return this.$message.error('添加失败！')
            }
            this.$message.success('添加成功！')
           
        },
        showInput(row) {
            row.inputVisible = true
            // $nextTick 方法的作用，当页面上元素 被重新渲染之后 
            // 才会执行回调函数中的代码
            this.$nextTick(_ => {
            this.$refs.saveTagInput.$refs.input.focus()
            })
        },
        // 删除tag标签
        async handleDeleted(i,row) {
            row.attr_vals.splice(i,1)
           const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)

            if(res.meta.status !== 200) {
                return this.$message.error( '删除失败！')
            }
            this.$message.success('删除成功！')
        },
    }
}
</script>
<style scoped>
.cat_opt {
    margin-top: 15px;
}
.el-tabs {
    margin-top: 15px;
}
.el-tag {
    margin: 10px;
}
.input-new-tag {
    width: 100px;
}
</style>
