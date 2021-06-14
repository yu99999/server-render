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