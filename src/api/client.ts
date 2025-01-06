import axios from "axios";

const client = axios.create({
  baseURL: "http://app.local:999/api/v1/dj",
});

export default client;