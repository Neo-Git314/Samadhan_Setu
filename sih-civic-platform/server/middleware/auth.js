// TODO: Verify JWT and attach authenticated user details to requests.
export function auth(req, _res, next) {
  req.user = req.user || { id: 'demo-user-id', role: 'citizen' };
  next();
}
