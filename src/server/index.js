import express from 'express'
import {render} from './render'
import {getStore} from "../store/index"
import {matchRoutes} from 'react-router-config'
import routesConfig from '../routes'
import proxy from 'express-http-proxy'

const app = express();
app.use(express.static('public'))

// 开启代理 
app.use('/api', proxy('https://jsonplaceholder.typicode.com', {
  proxyReqPathResolver(req){
    return req.url
  }
}))

// 劫持所有路由，统一跳转
app.get('*', (req, res) => {
  const store = getStore();		// 获取服务端 store

  // 获取路径匹配到的组件
  const matchedRoutes = matchRoutes(routesConfig, req.path);
  const promises = []
  // 提取组件中需要加载的数据
  matchedRoutes.map(item => {
    if(item.route.loadData){
      promises.push(item.route.loadData(store))
    }
  })
  
  Promise.all(promises).then(() => {  // 全部数据准备好后才返回 html
    res.send(render(store, req))
  })
  
})

const port = 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})