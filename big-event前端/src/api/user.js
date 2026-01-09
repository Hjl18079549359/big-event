import request from '@/utils/request'
// 注册
// export const userRegister = ({ username, password, repassword }) => {
//   return request.post('/user/register', {
//     username,
//     password,
//     repassword,
//   })
// }
//注册
export const registerService = (registerData) => {
    var params = new URLSearchParams()
    for (let key in registerData) {
        params.append(key, registerData[key])
    }
    return request.post('/user/register', params)
}
//登录
export const loginService = (loginData)=>{
    var params = new URLSearchParams()
    for(let key in loginData){
        params.append(key,loginData[key])
    }
    return request.post('/user/login',params)
}
//获取个人信息
export const userInfoGetService = ()=>{
    return request.get('/user/userInfo');
}
//修改个人信息
export const userInfoUpdateService = (userInfo)=>{
    return request.put('/user/update',userInfo)
}
//修改头像
export const userAvatarUpdateService=(avatarUrl)=>{
    let params = new URLSearchParams();
    params.append('avatarUrl',avatarUrl)
    return request.patch('/user/updateAvatar',params)
}
// 修改密码
export const userUpdatePassService = ({ old_pwd, new_pwd, re_pwd }) =>{
    return request.patch('/user/updatePwd', { old_pwd, new_pwd, re_pwd })
}
  
