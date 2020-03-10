const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(`mongodb+srv://anja:anjanirina@cluster0-wijrw.mongodb.net/bank`, { useNewUrlParser: true, useUnifiedTopology: true } )
  .then(result => {
    app.listen(8000)
    console.log('connected')
  })
  .catch(err => console.log(err));
