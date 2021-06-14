import axios from 'axios'

export const clientAxios = axios.create({
  baseURL: '/api'   // 客户端需要 node 中间层来代理
})

export const serverAxios = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com'
})

