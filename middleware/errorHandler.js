module.exports = function(error, req, res, next) {
    console.log(error);
    const errorObj = {
        error: error.message
    }
    if (process.env.NODE_ENV !== 'production') errorObj.stackTrace = error.stack;
    res.status(500).json(errorObj)
}