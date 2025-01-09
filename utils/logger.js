require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = (data, title) => {
  if (NODE_ENV.toLowerCase() === 'development') {
    if (title) {
      console.log(title, data);
    } else {
      console.log(data);
    }
  }
};
