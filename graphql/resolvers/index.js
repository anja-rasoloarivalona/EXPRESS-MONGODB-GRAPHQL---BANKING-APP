module.exports = {
    ...require('./auth'),
    ...require('./wallet'),
    ...require('./income'),
    ...require('./expense'),
    ...require('./goal'),
    ...require('./transaction'),
    ...require('./settings')
}