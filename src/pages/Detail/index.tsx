import React, {
  FormEvent,
  ChangeEvent,
  useEffect,
  useState,
  createRef,
} from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

import {
  Button,
  Navbar,
  Text,
  Loading,
  TypeCard,
  Input,
} from "../../components";
import { units, colors } from "../../libs/utils";
import { useGlobalContext } from "../../libs/context";
import { generatePokeSummary } from "../../libs/helpers";
import { IPokemonDetailResponse } from "../../libs/types/pokemon";

import * as T from "./index.style";

const DetailPokemon: React.FC = () => {
  const { name } = useParams();

  const [types, setTypes] = useState<string[]>([]);
  const [moves, setMoves] = useState<string[]>([]);
  const [sprite, setSprite] = useState<string>("");
  const [isCatching, setIsCatching] = useState<boolean>(false);
  const [isEndPhase, setIsEndPhase] = useState<boolean>(false);
  const [isCaught, setIsCaught] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [nicknameModal, setNicknameModal] = useState<boolean>(false);
  const [nicknameIsValid, setNicknameIsValid] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [navHeight, setNavHeight] = useState<number>(0);

  const { setState } = useGlobalContext();
  const navRef = createRef<HTMLDivElement>();

  async function loadPokemon() {
    try {
      setIsLoading(true);
      const {
        data: { types, sprites, moves },
      } = await axios.get<IPokemonDetailResponse>(
        `${import.meta.env.VITE_POKEMON_API}/${name}`
      );
      setTypes(types.map((type: any) => type.type.name));
      setMoves(moves.map((move: any) => move.move.name));
      setSprite(sprites.front_default);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }

  async function catchPokemon() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() < 0.5 ? false : true);
      }, 2000);
    });
  }

  async function throwPokeball() {
    setIsCatching(true);
    const isCaught = await catchPokemon();
    setIsCatching(false);
    setIsEndPhase(true);

    if (isCaught) {
      setIsCaught(true);
    } else {
      setIsCaught(false);
    }
    setTimeout(() => {
      setIsEndPhase(false);
      isCaught && setNicknameModal(true);
    }, 1200);
  }

  async function onNicknameSave(e: FormEvent) {
    e.preventDefault();

    const currentCollection = localStorage.getItem("pokegames@myPokemon");
    const parsed: { name: string; nickname: string; sprite: string }[] =
      JSON.parse(currentCollection!) || [];

    let isUnique = true;
    for (let collection of parsed) {
      if (collection.nickname === nickname) {
        setNicknameIsValid(false);
        isUnique = false;
        return;
      } else {
        !nicknameIsValid && setNicknameIsValid(true);
        isUnique = true;
      }
    }

    if (isUnique) {
      parsed.push({
        name: name!.toUpperCase(),
        nickname,
        sprite,
      });
      localStorage.setItem("pokegames@myPokemon", JSON.stringify(parsed));
      setState({ pokeSummary: generatePokeSummary(parsed) });
      setIsSaved(true);
    }
  }

  useEffect(() => {
    setNavHeight(navRef.current?.clientHeight!);
    loadPokemon();
  }, []);

  return <div>DetailPokemon</div>;
};

export default DetailPokemon;
