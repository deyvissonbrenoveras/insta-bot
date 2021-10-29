const axios = require("axios");
require("dotenv").config();

const api = axios.create({
  baseURL: process.env.GANHAR_NO_INSTA_URL,
});

module.exports = api;
