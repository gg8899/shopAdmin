import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

// 保存登录的用户数据和token信息
let store = new Vuex.Store({
    state: {
        token: sessionStorage.getItem("token") ? sessionStorage.getItem("token") : "",
        user: JSON.parse(sessionStorage.getItem("user")) ? JSON.parse(sessionStorage.getItem("user")) : {},
    },
    // 修改数据
    mutations: {
        setInfo(state) {
            state.token = sessionStorage.getItem("token");
            state.user = JSON.parse(sessionStorage.getItem("user"));
        },
        clearInfo(state) {
            state.token = "";
            state.user = {};
        }
    }

});

export default store;