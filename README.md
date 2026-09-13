<div align="center">
  <img align="center" width="600" src="https://github.com/radespratama/pokegames/blob/main/public/static/pokegames-banner.avif?raw=true" />
  <h3 align="center">Pokegames</h3>
  <p align="center">⚡ Pokemon Apps ヾ(≧▽≦*)o</p>
</div>

<hr />

![Typescript](https://img.shields.io/badge/Typescript-3B82F6?style=for-the-badge&logo=Typescript&logoColor=white)
![ReactJS](https://img.shields.io/badge/ReactJs-1F2937?style=for-the-badge&logo=react&logoColor=white)
![ViteJS](https://img.shields.io/badge/ViteJS-1F2937?style=for-the-badge&logo=vite&logoColor=white)
![Emotion](https://img.shields.io/badge/Emotion-352DAC?style=for-the-badge&logo=emotion&logoColor=white)
![Forks](https://img.shields.io/github/forks/radespratama/pokegames?style=for-the-badge)
![Contributors](https://img.shields.io/github/contributors/radespratama/pokegames?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/radespratama/pokegames?style=for-the-badge)

A Pokemon minigame where you can explore, catch, and battle them all. Built with React JS and consumes public <a href="https://pokeapi.co">PokeAPI</a>.🍺

> **⚠️ DISCLAIMER: Fan-Made Educational Project**
>
> This project is created solely for **educational and non-commercial purposes** to demonstrate modern web development skills (React, State Management, Game Logic).
>
> All Pokémon content, including names, images, and related media, are intellectual property of **Nintendo, Game Freak, and Creatures Inc.** This project is not affiliated with, endorsed, sponsored, or specifically approved by Nintendo. No copyright infringement intended.

<hr />

### ⚔️ Battle Mechanics Info (v2.0)

**Pokegames introduces a unique Custom RPG Battle System.**
While we respect the classic **Elemental Type Effectiveness** (e.g., Water is super effective against Fire), the core combat logic is **custom-designed** to fit a web-based mini-RPG experience.

We implemented fresh mechanics such as:

- **Action Set:** Basic Attack, two elemental Skills with cooldowns, and a type-based Ultimate.
- **Combo Chain:** Basic → Skill 1 → Skill 2 in order multiplies damage (x1.0 / x1.2 / x1.5) and refunds +50 Gauge on the finisher. Breaking the order resets the chain.
- **Gauge & Overcharge:** Hits and hits taken charge a 0–150 Gauge. Ultimate unlocks at 100 (x2.0) and scales up to x3.0 at 150. Firing it empties the Gauge.
- **Squad Tactics (3v3):** Pick three Pokemon; one fights while two wait on the bench. Switching costs a turn, fainting forces a switch.
- **Adaptive Difficulty:** Wild Pokemon use a "Stat Clamping" system in the early game to ensure a fair fight, but unleash their full potential after Level 12.
- **Custom Scaling:** Stats are recalculated from base stats each level (~2% compound + flat HP). EXP scales with the level gap; bench members earn 50% of every KO.

## Features💡

By using Pokegames you can:

- [x] Get all list pokemon.
- [x] Catch a pokemon and bring it to inventory.
- [x] Animation pokeball when catching the pokemon.
- [x] Give nickname to a pokemon.
- [x] Release a pokemon.
- [x] **Battle System:** Turn-based combat with Wild Pokemon.
- [x] **Leveling System:** Gain EXP and Level Up to increase stats.
- [x] **Damage System:** Critical hits, Miss chance, and Super Effective multipliers.
- [x] **Squad Tactics (3vs3 Team Match):** Pick a team of three, switch mid-battle, shared EXP.
- [x] **Pokemon Status Information:** Level, EXP, stats and full action set from the Pokedex.

**UPCOMING FEATURES (Roadmap)**

- [ ] **Multiplayer PvP:** Real-time online battles with other players.
- [ ] Online Account & Cloud Save.

## Technology 👨‍💻

Pokegames is created using:

- [Typescript](https://www.typescriptlang.org) - TypeScript is JavaScript with syntax for types.
- [React](https://reactjs.org) - React a JavaScript library for building user interfaces.
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling.
- [Emotion](https://emotion.sh/docs/introduction) - Emotion is a library designed for writing css styles with JavaScript.
- [Vercel](https://vercel.com/) - Vercel is a cloud platform that we use to deploy our apps.

## Requirements 📦

- Node JS 20 or later
- Typescript v5 or later

## Installation 🛠️

#### Run the website locally

```
git clone https://github.com/radespratama/pokegames.git pokegames
```

#### Setting up the project

```bash
cd pokegames

# Install deps
yarn || npm install

# Copy Pokemon API in .env file
# You can visit https://pokeapi.co

VITE_POKEMON_API= <API URL HERE>
VITE_POKEMON_IMAGE=https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/
VITE_POKEMON_TYPE_ICON=https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons
```

#### Starting server

```bash
yarn dev || npm run dev
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎉 Thanks to

- @kuronekony4n [#15] img blurred (heres how to fix it)
