import axios from 'axios'

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  baseURL: '/',
  timeout: 1000 * 60 * 5,
  transformResponse: [(data) => {
    if (data) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        // alert('服务器异常,请重试!');
      }
    }
    return data;
  }],
});

api.interceptors.response.use(
  (response) => {
    const { code } = response.data
    if (typeof code !== 'number' || (code !== 0)) {
      const newData = {
        message: response.data && response.data.message,
        code: -1,
      }
      console.log('api出错了', response.data)
      return Promise.reject(newData);
    }
    return response.data || {};
  },
  () => {
    return Promise.reject({
      message: '网络异常',
      code: -1,
    });
  }
);

export default api;
