import axios from "axios";

const instance = axios.create({
    baseURL: 'http://localhost:8080'
  // baseURL: process.env.REACT_APP_API_BASE_URL,
});

export default instance;
