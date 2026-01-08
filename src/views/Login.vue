<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'
// import { userRegister } from '../api/user'
import { registerService,loginService } from '../api/user'
import { ElMessage } from 'element-plus'
import{useRouter} from 'vue-router'
import {useTokenStore} from '@/stores/token.js'
const tokenStore=useTokenStore()
const router=useRouter()
//控制注册与登录表单的显示， 默认显示注册
const isRegister = ref(false)
const registData=ref({
    username:'',
    password:'',
    repassword:''
})
const checkPassword=(rule,value,callback)=>{
    if(value===''){
        callback(new Error("请再次确认密码"))
    }else if(value!==registData.value.password){
        callback(new Error("确保两次输入密码一致"))
    }else{
        callback()
    }
}
const rules={
    username:[
        {required:true,message:"请输入用户名",tragger:'blur'},
        {min:5,max:16,message:"5到16位字符",tragger:'blur'}
    ],
    password:[
        {required:true,message:"请输入密码",tragger:'blur'},
        {min:5,max:16,message:"5到16位字符",tragger:'blur'}
    ],
    repassword:[
        {validator:checkPassword,message:'请再次输入密码',tragger:'blur'}
    ]
}
// const regist=async()=>{
//     const res= await registerService(registData.value)
//     if(res.code===0){
//         ElMessage.success('注册成功')
//     }else{
//         ElMessage.error('注册失败')
//     }
// }
//用于注册的事件函数
const register = async () => {
    //console.log('注册...');
    const result = await registerService(registData.value);
    if (result.code == 0) {
        ElMessage.success('注册成功')
    } else {
        ElMessage.error('注册失败')
    }
}
// 清空数据
const clearData=()=>{
    registData.value={
        username:'',
        password:'',
        repassword:''
    }
}
//用于登录的事件函数
const login = async () => {
    const result = await loginService(registData.value)
    
    if (result.code == 0) {
        tokenStore.setToken(result.data)
        ElMessage.success('登录成功')
        router.push('/')
    } else {
        ElMessage.error('登录失败')
    }
}
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registData" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registData.username" ></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registData.password"></el-input>
                </el-form-item>
                <el-form-item prop="repassword">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入再次密码" v-model="registData.repassword"></el-input>
                </el-form-item>
                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = false;clearData()">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else :rules="rules" :model="registData">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码" v-model="registData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox>记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = true;clearData()">
                        注册 →
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: #fff;

    .bg {
        background: url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
            url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }
}
</style>