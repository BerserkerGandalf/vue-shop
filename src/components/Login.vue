<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="userName">
                    <el-input v-model="loginForm.username"  prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
                </el-form-item>
                 <!-- 按钮区 -->
                <el-form-item class="btns">
                     <el-button type="primary" @click="login()">登录</el-button>
                      <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
     data() {
      return {
        // 表单数据绑定
        loginForm: {
            username:'admin',
            password:'123456'
        },
        // 表单验证规则
        loginFormRules: {
            // 验证用户名
            username: [
                { required: true, message: '请输入用户名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
            ],
            // 验证密码
            password: [
                { required: true, message: '请输入登录密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
            ]
        }
      }
    },
    methods: {
        // 重置表单
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields()
        },
        // 登录表单验证，valid 等于true时验证通过
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                if(!valid) return;
                // {data : result}:获取服务器返回的data数据,赋给result. await async:异步操作 
                const {data : result} = await this.$http.post('login',this.loginForm);
                console.log(result.meta.status)
                if(result.meta.status != 200) return this.$message.error('登录失败')
                this.$message.success('登录成功');
                // 1.登录成功之后的 token 保存到 客户端 的 sessionStorage 中
                // 1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
                // 1.2 token 之应在当前网站打开期间生效，所以将token保存在 sessionStorage 中
                window.sessionStorage.setItem('token',result.data.token);
                // 跳转网页
                this.$router.push('/home')
            })
        }
    }
};
</script>

<style  scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.login_box .avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.login_box .avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #d6d9db;
}
.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 15px;
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}
</style>
