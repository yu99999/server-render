
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
      loadData: Home.loadData,
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
