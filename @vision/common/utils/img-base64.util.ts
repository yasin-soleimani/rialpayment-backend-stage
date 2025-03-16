export async function base64ImageUpload( data ): Promise<any> {
  let matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
  response['type'] = matches[1];
  response['data'] = Buffer.from(matches[2], 'base64');
  return response;
}