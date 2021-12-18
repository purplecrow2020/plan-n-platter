const config = require('./config/config');
const app = require('./config/express');

app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
});
