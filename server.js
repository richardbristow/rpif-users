const mongoose = require('mongoose');
const app = require('./app');

const port = 3000;

const main = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/rpifusers');

    app.listen(port, () =>
      console.log(`users api listening at http://localhost:${port}`),
    );
  } catch (error) {
    console.error(error);
  }
};

main();
