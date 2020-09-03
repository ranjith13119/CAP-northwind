const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
    this.on('getGreeting', async(req) => {
        const { user } = req 
        const { msg } = "₹"
        return `${msg} ${user.id}`
    })
})