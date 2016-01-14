// app
var app = require('express')();
var http = require('http').Server(app);
var parser = require("body-parser");
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

// routes
var wine = require('./routes/wines');
app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);

app.listen(3000);
console.log('Listening on port 3000...');
