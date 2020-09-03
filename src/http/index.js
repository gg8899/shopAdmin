//  安装客户端依赖 
import axios from 'axios'
// 指定请求超时的毫秒数(0 表示无超时时间)
axios.defaults.timeout = 5000;

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
    // 每次请求数据时携带 token信息
    let token = sessionStorage.getItem('token') ? sessionStorage.getItem('token') : "";
    config.headers.Authorization = token;
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});


// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么 
    return response.data;
}, function (error) {
    // 对响应错误做点什么  
    return Promise.reject(error);
});


export default axios;