
## 什么是服务端渲染

与服务端渲染（SSR）相对立的是客户端渲染（CSR）

### 客户端渲染 CSR

我们编写的 Vue、React 应用一般都是 CSR，当我们打开网页源代码后呈现的 html 都是下面这种样子，由一个根容器加上核心 js 代码简单组成。

![image-20210613014315046](\public\image\image-20210613014315046.png)

当请求完 html 页面后会去加载核心 js 代码文件，当 js 加载完成后页面才会展现出来，否则页面会一直处于白屏

<img src="\public\image\image-20210613021618543.png" alt="image-20210613021618543" style="zoom:80%;" />

### 服务端渲染 SSR

简单来说就是由服务器生成 html 字符串后，再发送到浏览器，此时浏览器拿到的是能够完全显示的 html 页面。打开网页源代码后是多姿多彩的 html。一般我们会利用到 node 服务器来作为数据传输的中间层

<img src="\public\image\6522842-ee4752e9500e9976.png" alt="6522842-ee4752e9500e9976" style="zoom:67%;" />

### 服务端渲染的利与弊

服务端渲染的优势有两点：

1. 更利于 SEO（搜索引擎优化），因为搜索引擎的基于爬虫实现的，而它只会爬取源码，不会执行网站的任何脚本。所以当使用客户端渲染时，可供爬虫抓取的页面源码内容远远少于服务端渲染。服务端渲染返回给客户端的已经获取到异步数据后的最终 html，爬虫也能抓取到完整的页面信息
2. 首屏渲染时间相对较快，当然这不是绝对的，要取决于服务器的性能。首屏渲染的是完整的 html，与客户端渲染不同，不需要再去等待核心 js 文件加载完成后才能渲染完首屏

服务端渲染的劣势也是有的：

1. 对服务端的压力很大，本来由客户端完成渲染，而现在需要统一到服务端进行。当访问量非常大时，会大大量占用服务端CPU资源
2. 开发条件受限，以 React 为例，服务端渲染中只会执行到 componentDidMount 之前的生命周期钩子（因为服务端渲染没有挂载到 DOM 的阶段）。因此对于某些使用到此类生命周期钩子的第三方库会有很大的限制



## SSR 项目搭建

这里以 React 为例搭建一个 SSR 项目

### 1. 初始化项目

利用 express 来搭建服务器，并劫持路由，统一返回 html 代码

```js
// server/index.js
import express from 'express'
import {render} from './render'

const app = express();

// 劫持所有路由，统一跳转
app.get('*', (req, res) => {
  res.send(render(req))
})

const port = 3000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`)
})
```

```js
// render.js
import React from 'react'
import {renderToString} from 'react-dom/server'

export const render = (req) => {

  const content = renderToString((
    <div>
      hello
    </div>
  ))

  return `
    <html>
      <head>
        <title>ssr</title>
      </head>
      <body>
        <div id="app">${content}</div>
      </body>
    </html>
  `
}
```

### 2. 同构

其实上面的代码是有问题的，当你引用点击事件时，会发现没有效果。原因是 renderToString 没有做事件的相关处理，因此返回给浏览器的内容中不会有 js 相关的逻辑。

要处理这种问题就需要**同构**，同构就是一套 React 代码在服务器上运行一遍后返回相关 html 代码，代码中携带核心 js 文件，浏览器加载时又会去运行一遍，这样一来就能够拥有事件的相关逻辑。

所以我们需要准备客户端渲染的代码

```js
// client/index.js
import React from 'react'
import ReactDom from 'react-dom'

const App = () => {
  return (
    <div>
      	hello
    </div>
  )
}

ReactDom.hydrate(<App />, document.getElementById('app'))
```

利用 webpack 将客户端代码打包为 js 文件

```js
// webpack.base.js
module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}

// webpack.client.js
const path = require('path')
const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base')

const config = {
  entry: './src/client/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public')		// 打包至 public 文件夹中，文件为 main.js
  }
}

module.exports = merge(baseConfig, config)

// webpack.serve.js
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const {merge} = require('webpack-merge')
const baseConfig = require('./webpack.base')

const config = {
  target: 'node',
  entry: './src/server/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: [nodeExternals()]
}

module.exports = merge(baseConfig, config)
```

然后借助 npm-run-all 来简化打包流程

```json
// package.json
{
    ...
    "script": {
        "build:client": "webpack --config webpack.client.js --watch",
        "start": "nodemon ./dist/main.js",
        "build:server": "webpack --config webpack.serve.js --watch",
        "dev": "npm-run-all --parallel build:client start build:server"
    }
}
```

当然还需要修改服务端渲染的代码，即返回的 html 代码需要加上 script 标签去引用 main.js，还需要 public 托管为静态资源目录

```js
// serve/index.js
// ...
app.use(express.static('public'))
```

### 3. 引入路由

创建路由匹配文件（这里路由借助 react-router-config 开发）

```js
// routes.js
import Home from './contains/Home'
import Login from './contains/Login'
import App from './App'

export default [{
  path: '/',
  component: App,
  routes: [
    {
      path: '/',
      component: Home,
      exact: true,
      key: 'home',
    },
    {
      path: '/login',
      component: Login,
      exact: true,
      key: 'login'
    }
  ]
}]
```

组件内容可去 github 上查看

````js
// client/index.js
import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import routes from '../routes'
import { renderRoutes } from 'react-router-config'

const App = () => {
  return (
      <BrowserRouter>
        <div>
          {renderRoutes(routes)}
        </div>
      </BrowserRouter>
  )
}

ReactDom.hydrate(<App />, document.getElementById('app'))

// server/index.js
import React from 'react'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import { renderRoutes } from 'react-router-config'
import routes from '../routes'

export const render = (store, req) => {

  const content = renderToString((
    // 服务端渲染要使用 StaticRouter
      <StaticRouter context={{}} location={req.path}>
        <div>
          {renderRoutes(routes)}
        </div>
      </StaticRouter>
  ))

  return `
    <html>
      <head>
        <title>ssr</title>
      </head>
      <body>
        <div id="app">${content}</div>
        <script src="./main.js"></script>
      </body>
    </html>
  `
}
````

### 4. 创建 Redux

在这里我们引用 axios 来请求一个接口，并将接口返回的数据存储到 Redux 中。因为利用到 node 中间层，我们将请求进行代理，客户端发起的请求也要经过我们的 node 中间层。所以创建 clientAxios 和 serverAxios 来分别处理客户端和服务端的请求

```js
// api/index.js
import axios from 'axios'
export const clientAxios = axios.create({
  baseURL: '/api'   // 客户端需要 node 中间层来代理
})
export const serverAxios = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com'
})
```

```js
// server/index.js
import express from 'express'
import {render} from './render'
import {getStore} from "../store/index"
import {matchRoutes} from 'react-router-config'
import routesConfig from '../routes'
import proxy from 'express-http-proxy'

const app = express();
app.use(express.static('public'))

// 利用 express-http-proxy 开启代理 
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

// client/index.js
import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {getClientStore} from '../store/index'
import routes from '../routes'
import { renderRoutes } from 'react-router-config'

const store = getClientStore();		// 获取客户端 store，当服务端有数据时，这里会有通过数据注水生成的默认 state

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          {renderRoutes(routes)}
        </div>
      </BrowserRouter>
    </Provider>
  )
}

ReactDom.hydrate(<App />, document.getElementById('app'))
```

```js
import React from 'react'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import { renderRoutes } from 'react-router-config'
import routes from '../routes'

export const render = (store, req) => {
  
  const content = renderToString((
    // 服务端渲染要使用 StaticRouter
    <Provider store={store}>
      <StaticRouter context={{}} location={req.path}>
        <div>
          {renderRoutes(routes)}
        </div>
      </StaticRouter>
    </Provider>
  )
  return `
    <html>
      <head>
        <title>ssr</title>
        <style>${context.css.join('\n')}</style>
      </head>
      <body>
        <div id="app">${content}</div>
        <script>
		  // 这是数据注水，将 store 内容传递给客户端，客户端不必再去请求数据
          window.context = {state: ${JSON.stringify(store.getState())}}
        </script>
        <script src="./main.js"></script>
      </body>
    </html>
  `
}
```

利用 redux-thunk 可以在 dispatch action 时使用对应的请求

```js
// store/index.js
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {clientAxios, serverAxios} from '../api'

const defalutState = {list: []}
const reducer = (state = defalutState, action) => {
  switch(action.type){
    case 'change_list':
      return {
        ...state,
        list: action.list
      }
    default: 
      return state;
  }
}

export const getStore = () => {   // 服务端 store
  return createStore(reducer, applyMiddleware(thunk.withExtraArgument(serverAxios)))
}

export const getClientStore = () => {	// 客户端的根 store
  const defalutState = window.context.state   // 从数据注水中提取服务端渲染产生的 store
  return createStore(reducer, defalutState, applyMiddleware(thunk.withExtraArgument(clientAxios)))
}

// store/action.js
const changeList = (list) => ({
  type: 'change_list',
  list
})

export const getList = () => {
  return (dispatch, getState, axiosInstance) => {
    // 根据 store 的不同，使用不同的请求实例，让所有请求都通过 node 中间层
    return axiosInstance.get('/posts')
    .then(res => {
      dispatch(changeList(res.data))
    })
  }
}
```

### 5. 样式的处理

为了处理 css 文件，webpack 要添加 loader 来识别 css 文件。对于服务端渲染我们不能用 style-loader，因为 style-loader 是将产生的样式以 style 标签的形式注入到 html 页面中，而服务端渲染的 html 代码是我们手动编写的。这里我们利用  isomorphic-style-loader

```js
// webpack.server.js
const config = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['isomorphic-style-loader', {
          loader: 'css-loader',
          options: {
            modules: true	// 开启模块化
          }
        }]
      }
    ]
  }
}

// webpack.client.js
const config = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            modules: true	// 开启模块化
          }
        }]
      }
    ]
  }
}
```

而后，为方便复用，我们编写一个高阶组件来对样式的添加。将样式添加到 context 中，最后在返回的 html 代码中统一加上我们收集到的样式信息

```js
import React from 'react'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import { renderRoutes } from 'react-router-config'
import routes from '../routes'

export const render = (store, req) => {
  
  const context = {
    css: []
  }

  const content = renderToString((
    // 服务端渲染要使用 StaticRouter
    <Provider store={store}>
      <StaticRouter context={context} location={req.path}>
        <div>
          {renderRoutes(routes)}
        </div>
      </StaticRouter>
    </Provider>
  ))

  return `
    <html>
      <head>
        <title>ssr</title>
        <style>${context.css.join('\n')}</style>
      </head>
      <body>
        <div id="app">${content}</div>
        <script>
          window.context = {state: ${JSON.stringify(store.getState())}}
        </script>
        <script src="./main.js"></script>
      </body>
    </html>
  `
}
```

```js
// WithStyle.js
import React from 'react'

export default (DecoratedComponent, styles) => {
  return (props) => {
    if(props.staticContext){
      props.staticContext.css.push(styles._getCss())  // 将传入的样式信息收集到 context 中
    }
    return (
      <DecoratedComponent {...props} />
    )
  }
}
```

要注意一下第三方库的版本问题，我这里的 css-loader 版本是 3.0.0，对于其他版本的 css-loader 可能会有问题

```js
import React from 'react'
import Header from './contains/components/Header'
import {renderRoutes} from 'react-router-config'
import styles from './index.css'
import WithStyle from './WithStyle'

const App = (props) => {
  return (
    <div>
      <Header />
      {renderRoutes(props.route.routes)}
    </div>
  )
}

export default WithStyle(App, styles);	// 传入组件以及样式发，返回一个全新的组件
```
