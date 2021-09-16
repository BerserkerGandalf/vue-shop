<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          background-color="#313743"
          text-color="#fff"
          active-text-color="#459afe" unique-opened :collapse-transition="false" :collapse="isCollapse" router
          :default-active="activePath" >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menus" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItme.path" v-for="subItme in item.children" :key="subItme.id" @click="saveNavState('/'+subItme.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItme.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 右侧菜单数据
      menus: [],
      iconObj: {
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '102':'iconfont icon-danju',
        '101':'iconfont icon-shangpin',
        '145':'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath:'',
    }
  },
  created() {
      this.getMenuList()
      this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清空token
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
    const {data : res} = await this.$http.get('menus')
      console.log(res)
      if(res.meta.status != 200) return this.$message.error('获取菜单失败');
      this.menus = res.data
    },
    // 点击按钮 左侧 菜单 折叠 与 展开。
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    },
  }
}
</script>

<style scoped>
.el-header {
  background-color: #363d40;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-aside {
  background-color: #313743;
}
.el-main {
  background-color: #e9edf1;
}
.el-container {
  height: 100%;
}
.iconfont {
  margin: 10px;
}
.el-aside .el-menu {
  border-right: none;
}
.toggle-button {
  background-color: #484f64;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
