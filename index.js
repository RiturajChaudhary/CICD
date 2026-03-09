const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('<h1>Hello! Node.js app deployed via CI/CD</h1>');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));