import axios from "axios";
import { POKEMON_API } from "@/configs/api";

const instance = axios.create({
  baseURL: POKEMON_API,
  validateStatus: (status) => {
    if (status >= 200 && status < 300) {
      return true;
    }

    return false;
  },
});

axios.defaults.headers.common.Accept = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

export default instance;
