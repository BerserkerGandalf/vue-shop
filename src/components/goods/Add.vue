<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 信息提示区域 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完 成"></el-step>
      </el-steps>

      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <!-- tab栏区域 -->
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave" @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                 <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="addForm.goods_price" type="number"></el-input>
                </el-form-item>
                 <el-form-item label="商品数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number" type="number"></el-input>
                </el-form-item>
                 <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品分类" prop="goods_cat">
                    <el-cascader 
                    v-model="addForm.goods_cat" 
                    :options="cateList" 
                    expand-trigger="hover"
                    :props="cateProps"
                    @change="handleChange"></el-cascader>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
                <!-- 渲染表单itme项目 -->
                <el-form-item :label="item.attr_name" v-for="item in  manyTableData" :key="item.attr_id">
                    <!-- 复选按钮 -->
                    <el-checkbox-group v-model="item.attr_vals">
                        <el-checkbox v-for="(cb,i) in item.attr_vals" :label="cb" :key="i" border size="mini"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
                <el-form-item :label="item.attr_name" v-for="item in  onlyTableData" :key="item.attr_id">
                   <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
                <!--action 表示图片要上传到后台的API地址  -->
                <el-upload
                    :action="uploadUrl"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                    <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
                <!-- 富文本编辑器 -->
                <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
            </el-tab-pane>
        </el-tabs>
      </el-form>

    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
        <img :src="previewPath" alt="" width="100%">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'
export default {
  data() {
    return {
        activeIndex: '0',
        addForm: {
            goods_name:'',
            goods_price:'',
            goods_weight:'',
            goods_name:'',
            // 商品所属分类
            goods_cat:[],
            // 保存上传图片路径
            pics:[],
            goods_introduce:'',
            attrs:[],
        },
        addFormRules:{
            goods_name:[
                {required:true,message:'请输入商品名称',trigger:'blur'}
            ],
            goods_price:[
                {required:true,message:'请输入商品价格',trigger:'blur'}
            ],
            goods_number:[
                {required:true,message:'请输入商品数量',trigger:'blur'}
            ],
            goods_weight:[
                {required:true,message:'请输入商品重量',trigger:'blur'}
            ],
            goods_cat:[
                {required:true,message:'请输选中商品分类',trigger:'blur'}
            ]
        },
        // 商品分类列表
        cateList:[],
        // 级联选项对象
        cateProps:{
            label:'cat_name',
            value:'cat_id',
            children:'children'
        },
        // 动态参数列表数组
        manyTableData:[],
        // 静态产品属性
        onlyTableData:[],
        // 上传地址
        uploadUrl:'http://127.0.0.1:8888/api/private/v1/upload',
        previewPath:'',
        previewVisible:false,
        // 图片上传headers 请求头对象
        headerObj:{
            Authorization: window.sessionStorage.getItem('token')
        },

    }
  },
  created() {
      this.getCateList()
  },
  computed: {
      cateId() {
          if(this.addForm.goods_cat.length === 3) {
              return this.addForm.goods_cat[2]
          }
          return null
      }
  },
  methods: {
      async getCateList() {
        const {data:res} = await this.$http.get('categories') 
        if(res.meta.status !== 200) {
            return this.$massage.error('获取商品分类数据失败')
        } 
        this.cateList = res.data
      },
    //  级联选项选中时 触发的函数
    handleChange() {
        console.log(this.addForm.goods_cat)
        if(this.addForm.goods_cat.length !== 3) {
            this.addForm.goods_cat = []
            this.$message.error('请选中3级菜单')
        }
      },
    beforeLeave(activeName,oldActiveName) {
        // console.log('即将进入的标签页:'+activeName)
        // console.log('即将离开的标签页:'+oldActiveName)
        if(this.addForm.goods_cat.length !== 3 && oldActiveName === '0') {
            this.$message.error('请选择商品分类')
            // 禁止切换
            return false
        }
      },
      async tabClicked() {
        //console.log(this.activeIndex)
        // 点击商品参数时执行的事件
        if(this.activeIndex === '1') {
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})

            if(res.meta.status !== 200){
                return this.$message.error('获取商品列表失败')
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
            }); 

            this.manyTableData = res.data
            
        } else if(this.activeIndex == '2') {
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})

            if(res.meta.status !== 200){
                return this.$message.error('获取静态属性失败')
            }
           
            this.onlyTableData = res.data
        }
      },
    //   处理图片预览效果
      handlePreview(file){
          this.previewPath = file.response.data.url
          this.previewVisible = true
      },
    //   处理移除图片操作
      handleRemove(file) {
        //  1.获取将要上传的图片临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const i = this.addForm.pics.findIndex(x => x.pics === filePath)
        // 3.调用数组 splice 方法 把图片信息对象，从pics数组中移除
        this.addForm.pics.splice(i, 1)
        console.log(this.addForm)
      },
    //   监听图片上传成功的事件
      handleSuccess(response) {
          const picsInfo = {pics:response.data.tmp_path}
          this.addForm.pics.push(picsInfo)
          console.log(this.addForm)
      },
    //  添加商品
      add() {
        this.$refs.addFormRef.validate(async valid => {
            if(!valid) {
                return this.$message.error('请把表单项内容填写完毕!')
            }
            // lodash cloneDeep(obj) 深拷贝操作
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')

            // 处理动态属性
            this.manyTableData.forEach(item => {
                const newInfo = {
                    attr_id: item.attr_id,
                    attr_value: item.attr_vals.join(' ')
                }
                this.addForm.attrs.push(newInfo)
            })

            // 处理静态属性
            this.onlyTableData.forEach(item => {
                const newInfo = {
                    attr_id: item.attr_id,
                    attr_value: item.attr_vals
                }
                this.addForm.attrs.push(newInfo)
            })

            form.attrs = this.addForm.attrs
            console.log(form)

            // 发起请求
            const {data:res} = await this.$http.post(`goods`,form)
            if(res.meta.status !== 201){
                return this.$message.error(res.meta.msg ||'添加商品失败!')
            }
            this.$message.success(res.meta.msg || '添加商品成功!')
            this.$router.push('/goods')
        })
      }
  }
}
</script>
<style scoped>
.el-checkbox {
    margin:0 5px 0 0 !important;
}
.addBtn {
    margin-top: 15px;
}
</style>
