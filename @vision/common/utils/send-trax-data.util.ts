import axios,{AxiosInstance} from 'axios';

export async function sendCallbackPost(url, params): Promise<any> {
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  return axios.post(url, params)
  .then(function (response) {
    return response;
  })
  .catch(function (error) {
    console.log(error);
  });
}