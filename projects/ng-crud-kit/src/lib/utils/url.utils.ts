  //removes all leading and trailing slashes from a string
  // the endpoint might be passed as something like /items/ and the apiUrl as http://api.com/
  function trimSlashes(value: string): string{
    return String(value).replace(/^\/+|\/+$/g, '');
  }

  //if there's an id adds it to the end of the url
  //if not returns the base url
  export function buildUrl(apiUrl: string, urlEndpoint: string, id?: string): string {
    const api = trimSlashes(apiUrl);
    const endpoint = trimSlashes(urlEndpoint);
    return id !== undefined ? `${api}/${endpoint}/${id}` : `${api}/${endpoint}`;
  }