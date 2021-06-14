

const changeList = (list) => ({
  type: 'change_list',
  list
})

export const getList = () => {
  return (dispatch, getState, axiosInstance) => {
    return axiosInstance.get('/posts')
    .then(res => {
      dispatch(changeList(res.data))
    })
  }
}