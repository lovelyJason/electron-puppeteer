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
    const status = typeof response.data.status !== 'undefined' ? response.data.status : UNEXPETED_STATUS;
    if (typeof status !== 'number' || (status !== 0)) {
      const newData = {
        msg: '系统异常',
        status: -1,
      }
      return Promise.reject(newData);
    }
    return response.data || {};
  },
  () => {
    return Promise.reject({
      msg: '网络异常',
      status: -1,
    });
  }
);

export default api;
