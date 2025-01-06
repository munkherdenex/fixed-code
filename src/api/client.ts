import axios from "axios";
import { BASE_URL } from "../constants";

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1/dj`,
});

export default client;