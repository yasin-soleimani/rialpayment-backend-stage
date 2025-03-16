export function developerReplacer(data, auth) {
  let status, url;
  if (!data || !data.callback) {
    status = false;
    url = '';
  } else {
    (status = data.callback.status), (url = data.callback.url);
  }

  return {
    callback: {
      status: status,
      url: url,
    },
    authorize: auth,
  };
}
