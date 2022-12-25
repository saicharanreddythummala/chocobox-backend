export default (asyncErr) => (req, res, next) => {
  Promise.resolve(asyncErr(req, res, next)).catch(next);
};
