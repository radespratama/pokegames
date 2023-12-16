import axios from "axios";

import { POKEMON_API } from "../configs/api";
import { IAllPokemonResponse } from "../types/pokemon";

export const getAllPokemon = async (limit: number = 50, offset: number = 0) => {
  try {
    const response = await axios.get<IAllPokemonResponse>(POKEMON_API, {
      params: { limit: limit, offset: offset },
    });

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDetailPokemon = async (name: string = "") => {
  try {
    const response = await axios.get(`${POKEMON_API}/${name}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};
