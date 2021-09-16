<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表 区-->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
            <template slot-scope="scope">
                <el-row :class="['bdbottom',i1 === 0 ? 'bdtop' : '' ,'vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                    <!-- 渲染一级权限 -->
                    <el-col :span="5">
                        <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染二、三级级权限 -->
                    <el-col :span="19">
                        <!--通过 for循环 嵌套渲染第二层 -->
                        <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2 ,i2) in item1.children" :key="item2.id">
                            <el-col :span="6">
                                <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="18">
                                 <!--通过 for循环 嵌套渲染第三层 -->
                                <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-s-tools" @click="showSetRightDialog(scope.row)">分配权限</el-button >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="添加角色"
      width="50%"
      @close="addDialogClosed"
      :close-on-click-modal="false"
    >
      <!-- 主体内容 -->
      <span>
        <el-form
          :model="addForm"
          :rules="addFormRoles"
          label-width="70px"
          ref="addFormRef"
        >
          <el-form-item label="角色名称" prop="roleName" label-width="80px">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" label-width="80px">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setDialogClosed">
        <!-- 树形控件 -->
     <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
     <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],
      rightsList:[],
      dialogVisible: false,
      setRightDialogVisible:false,
    //   当前即将分配角色的Id
      roleId:'',
    //   树形控件的属性绑定对象
      treeProps:{
          children:'children',
          label:'authName'
      },
    //   默认选中的节点Id值数组
      defKeys:[],
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRoles: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    addRoles() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        this.getRolesList()
        this.dialogVisible = false
      })
    },
    async deleteRole(id) {
        const resConfirm = await this.$confirm('此操作将永久删除该角色,是否继续?','提示', {
        confirmButtonText: '确定',
        canceButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如何用户确认删除,则返回字符串 confirm ,取消删除返回 cance
      if(resConfirm !== "confirm") {
        return this.$message.info('已取消删除')
      }
      const {data : res} = await this.$http.delete('roles/' + id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('删除角色成功!')
      this.getRolesList()
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 根据对应Id删除对应权限
    async removeRightById(role,rightId) {
        const resConfirm = await this.$confirm('此操作将永久删除,是否继续?','提示', {
        confirmButtonText: '确定',
        canceButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // 如何确认删除,则返回字符串 confirm ,取消删除返回 cance
      if(resConfirm !== "confirm") {
        return this.$message.info('已取消删除')
      }
      const {data : res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除失败!')
      }
      this.$message.success('删除成功!')
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
        this.roleId = role.id
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200){
          return this.$message.error('获取数据失败')
      }
    //   把数据保存到权限列表 rightsList 中
      this.rightsList = res.data
    //   递归获取三级节点的ID
    console.log(role)
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true

    },
    // 通过递归的形式，获取角色下所有三级权限
    getLeafKeys(node, arr) {
        // 如果当前node节点不包含children
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item => {
            this.getLeafKeys(item,arr)
        })
    },
    // 监听 分配权限对话框 关闭事件
    setDialogClosed() {
        this.defKeys = []
    },
    // 为角色分配权限
    async allotRights() {
        const keys = [
            // 返回目前被选中的节点的 key 所组成的数组
            ...this.$refs.treeRef.getCheckedKeys(),
            // 返回目前半选中的节点的 key 所组成的数组
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
        if(res.meta.status !== 200){
          return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style scoped>
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
