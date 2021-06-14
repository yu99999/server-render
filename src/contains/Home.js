import React from 'react'
import {connect} from 'react-redux'
import {getList} from '../store/action'

class Home extends React.Component {

  componentDidMount(){
    if(this.props.list.length === 0)
      this.props.getList()
  }

  render(){
    return (
      <div>
        <h1>Home!!</h1>
        <ul>
          {
            this.props.list.map(item => (
              <li key={item.id}>{item.title}</li>
            ))
          }
        </ul>
      </div>
    )
  }
}

Home.loadData = (store) => {   // 负责渲染服务端数据
  return store.dispatch(getList())    // promise
}

const mapStateToProps = state => ({
  list: state.list
})

const mapDispatchToProps = dispatch => ({
  getList(){
    dispatch(getList())
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);