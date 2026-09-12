# Battle v2: Skill, Combo Chain, Overcharge, Squad Tactics 3v3

Tanggal: 2026-09-13
Status: menunggu review

## 1. Tujuan

Menyempurnakan mini game battle supaya fungsional penuh sebagai turn-based RPG:

1. Mekanisme pertarungan baru: Basic, Skill 1, Skill 2, Ultimate. Gauge 0-150 dengan Overcharge. Combo Chain.
2. Mode Squad Tactics 3v3: pilih 3 Pokemon, 1 aktif per sisi, 2 cadangan terlihat, aksi Switch.
3. Leveling dirapikan: EXP scaling ikut selisih level, pembagian EXP tim, stat selalu dihitung ulang dari base stat.
4. Pokemon Status Information di Pokedex (MyPokemon).
5. Polish StartScreen: performa aset dan animasi masuk.
6. README: centang dua fitur roadmap.

Di luar scope: efek status (burn, poison), PvP, cloud save, item.

## 2. Keputusan desain yang sudah disetujui

| Topik        | Keputusan                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Format 3v3   | 1 aktif per sisi, 2 cadangan terlihat, aksi Switch memakai giliran, auto-switch saat tumbang tanpa biaya giliran |
| Skill        | Cooldown giliran, digabung Combo Chain dan Momentum + Overcharge                                                 |
| Sumber skill | Move pool PokeAPI via `pickRandomMoves` dan `powerFromMoveName`. Tipe ikut tipe Pokemon                          |
| EXP 3v3      | Aktif saat KO 100%, cadangan 50%                                                                                 |

## 3. Aturan pertarungan (engine)

Semua angka di bawah jadi konstanta di satu file `rules.ts` agar mudah di-tune.

### 3.1 Aksi

| Aksi     | Power                                             | Tipe                                          | Cooldown  | Miss | Crit | Gauge saat kena                                 |
| -------- | ------------------------------------------------- | --------------------------------------------- | --------- | ---- | ---- | ----------------------------------------------- |
| Basic    | 20                                                | tidak ada (netral, tanpa STAB, efektivitas 1) | 0         | 0%   | 12%  | +20                                             |
| Skill 1  | 45                                                | elemen (types[0])                             | 2 giliran | 10%  | 12%  | +10                                             |
| Skill 2  | 65                                                | elemen (types[1] atau types[0])               | 3 giliran | 5%   | 22%  | +10                                             |
| Ultimate | power move dari pool (30-65) x pengali Overcharge | elemen                                        | 0         | 0%   | 12%  | 0, gauge habis                                  |
| Switch   | tidak ada                                         |                                               |           |      |      | 0. Prioritas: selalu terjadi sebelum aksi musuh |

Cooldown dihitung per Pokemon dalam giliran Pokemon itu sendiri. Cooldown berkurang 1 setiap kali Pokemon itu selesai beraksi. Cadangan tidak mengurangi cooldown.

Miss menghasilkan damage 0, tidak mengisi gauge penyerang, tetap mengurangi cooldown.

### 3.2 Gauge (Momentum + Overcharge)

- Rentang 0-150. Ultimate tersedia saat gauge >= 100.
- Sumber isi: Basic kena +20, Skill kena +10, kena pukul +10 (comeback), Chain penuh selesai +50 bonus.
- Ultimate menghabiskan seluruh gauge. Pengali damage: 2.0 pada 100, naik linear sampai 3.0 pada 150. Rumus: `2 + (gauge - 100) / 50`.
- Gauge, cooldown, dan posisi chain melekat per Pokemon. Tetap saat Switch.

### 3.3 Combo Chain

- Urutan Basic, Skill 1, Skill 2 pada tiga giliran berturut-turut Pokemon yang sama.
- Pengali per langkah: Basic x1.0, Skill 1 x1.2, Skill 2 x1.5.
- Chain putus (kembali ke langkah 0) jika: aksi tidak sesuai urutan, miss, Ultimate, Switch, atau Pokemon tumbang.
- Menyelesaikan langkah ke-3 (Skill 2 kena): gauge +50 bonus, chain reset ke 0, log `>>> COMBO FINISHER! <<<`.
- Basic saat chain di langkah 0 selalu memulai chain baru. Basic saat chain di langkah 1 atau 2 memutus chain lalu memulai lagi dari langkah 1.
- Skill 1 saat cooldown aktif tidak bisa dipilih. Chain tidak "menunggu". Kalau Skill 1 masih cooldown saat chain di langkah 1, pemain harus memilih aksi lain dan chain putus.

### 3.4 Damage

Rumus yang ada di `useBattleMechanics.ts` dipertahankan, dipindah ke fungsi murni:

```
raw       = attack * (power / 85)
defMul    = 100 / (100 + defense)
variance  = 0.90..1.10
total     = raw * defMul * effectiveness * stab * crit * chainMul * overchargeMul * variance
damage    = max(1, floor(total))
```

- STAB 1.2 jika tipe move sama dengan salah satu tipe penyerang (sebelumnya hanya types[0]).
- Efektivitas dari `TYPE_CHART` terhadap semua tipe bertahan. Efektivitas 0 berarti damage 0 dan log "It had no effect".
- Crit 1.5x.
- `special_attack`, `special_defense` tetap tidak dipakai. Ditandai `ponytail:` di kode, upgrade path: kategori fisik atau spesial per move.

### 3.5 Urutan giliran

- Satu ronde = pemain memilih aksi, lalu kedua sisi beraksi berurutan sesuai `speed` Pokemon aktif. Speed sama: acak.
- Switch selalu diproses lebih dulu, lalu musuh beraksi terhadap Pokemon yang baru masuk.
- Kalau Pokemon tumbang sebelum giliran tibanya, aksinya batal.
- Auto-switch saat tumbang: pemain memilih pengganti dari cadangan (modal), musuh mengganti otomatis ke cadangan pertama yang masih hidup. Tidak memakai giliran.

### 3.6 AI musuh

Deterministik sederhana, satu fungsi murni `chooseEnemyAction(state)`:

1. Gauge >= 150: Ultimate.
2. Gauge >= 100: 60% Ultimate, 40% lanjut menabung.
3. Chain bisa dilanjutkan (langkah berikut tersedia, cooldown 0): lanjutkan chain.
4. Skill 2 tersedia: 50% pakai.
5. Skill 1 tersedia: 50% pakai.
6. Selain itu: Basic.

Musuh tidak melakukan Switch sukarela.

### 3.7 Kondisi akhir

- 1v1: sisi yang HP aktifnya 0 kalah.
- 3v3: sisi yang ketiga Pokemonnya tumbang kalah.
- Menyerah dan Run Away: pemain kalah, EXP kalah tidak diberikan.

## 4. Leveling

Pindah ke fungsi murni di `src/utils/leveling.ts`. Hook `usePokemonExperience` tetap ada sebagai pembungkus store.

- EXP untuk naik ke level berikut: `(level + 1) ^ 3`. Tidak berubah.
- Level maksimum 100.
- EXP per KO: `floor(baseExp * enemyLevel / 5) * levelMod`, `levelMod = clamp(1 + (enemyLevel - receiverLevel) * 0.1, 0.5, 1.5)`. Musuh lebih tinggi memberi lebih banyak, musuh lebih rendah lebih sedikit.
- Pembagian 3v3: Pokemon aktif saat KO 100%, cadangan hidup 50%, cadangan tumbang 0%. Diberikan per KO, langsung ke store, bukan hanya di akhir battle.
- 1v1 kalah: 25% EXP musuh. 3v3 kalah: 25% untuk semua yang sempat bertarung.
- Naik level berkali-kali dalam satu kali pemberian EXP menghasilkan satu log per level.
- Stat selalu dihitung ulang dari `base_stats` dengan `scaleStat(base, level)` dan bonus HP `level * 5 + 30`. Cabang `else` yang memakai rasio dari `stats` lama dihapus. Pokemon lama tanpa `base_stats` mendapat `base_stats` dari migrasi store (lihat 6.2).
- Wild Pokemon: aturan Stat Clamping dan `getDifficultyParams` tidak berubah. Ketiga musuh di 3v3 memakai level pemain rata-rata tim sebagai acuan.

## 5. UI

### 5.1 MyPokemon (Pokedex)

- Toggle mode di `ControlPanel`, kiri tombol WILD BATTLE: dua segmen bergaya kabinet fighting game, ikon `1v1` (satu Pokeball) dan `3v3` (tiga Pokeball bertumpuk), segmen aktif menyala hijau `POKE_COLORS.screenOn`, bunyi klik visual (transform scale). Pilihan mode disimpan di `localStorage` key `pokegames@battle-mode`.
- Mode 1v1: perilaku pilih satu kartu seperti sekarang.
- Mode 3v3: klik kartu menambah ke urutan pick (badge angka 1, 2, 3 di pojok kartu, warna berbeda). Klik lagi melepas. Maksimum 3, klik ke-4 diabaikan dengan getar kecil pada kartu. Pick pertama jadi lead.
- Tombol WILD BATTLE aktif jika 1v1 punya 1 pilihan, atau 3v3 punya tepat 3. Label berubah `WILD BATTLE` atau `SQUAD BATTLE 3v3`.
- Tombol bulat baru `STATUS` (ikon `i`) di sebelah HELP: aktif jika ada pilihan, membuka modal Status Pokemon terpilih (yang terakhir dipilih).
- Modal Status: sprite, nickname, nama, level, EXP bar, tipe (`TypeCard`), enam stat dengan bar, daftar aksi: Basic, Skill 1, Skill 2, Ultimate beserta power, tipe, cooldown.
- Modal HELP: teks manual diperbarui ke mekanik v2 (chain, overcharge, switch, EXP tim). Versi label `TRAINER MANUAL v.2.0`.
- Navigasi: `/vs-battle?mode=1v1&team=nick` atau `/vs-battle?mode=3v3&team=nick1,nick2,nick3`. Param `pokemon` lama tetap diterima sebagai alias 1v1.

### 5.2 VSBattle

Layout dasar dipertahankan. Tambahan:

- **Panel aksi**: grid 2x2: Basic, Skill 1, Skill 2, Ultimate. Tiap tombol menampilkan ikon tipe, nama, power. Cooldown tampil sebagai badge angka dan tombol berwarna abu. Ultimate abu sampai gauge 100, berkedip emas saat 100-149, merah menyala saat 150 (`OVERCHARGE`).
- **Gauge bar**: 0-150 dengan garis penanda di 100. Label teks `GAUGE 120/150` dan pengali Ultimate `x2.4` saat >= 100.
- **Chain indicator**: tiga pip bertuliskan `BASIC`, `SKILL 1`, `SKILL 2`. Pip menyala sesuai langkah chain saat ini, pip berikutnya berkedip sebagai petunjuk. Putus: semua pip mati dengan animasi flash merah.
- **Musuh**: gauge bar kecil di bawah HP musuh supaya pemain bisa mengantisipasi Ultimate.
- **Bench (3v3 saja)**: strip cadangan di sisi kiri bawah (pemain) dan kanan atas (musuh). Tiap slot: sprite kecil, `Lv.`, HP bar mini. Tumbang: grayscale dan ikon X. Aktif: dibingkai.
- **Switch (3v3 saja)**: tombol kelima di bawah grid, membuka modal pilih cadangan hidup. Modal yang sama dipakai untuk forced switch saat tumbang, dengan judul berbeda dan tanpa tombol batal.
- **Log**: format sekarang dipertahankan. Baris dengan `>>>` tetap emas.
- **Intro**: `BattleIntro` menerima `player` dan `enemy` sebagai array. 1v1 tampil satu vs satu seperti sekarang. 3v3 tampil tiga sprite bertingkat per sisi dengan level.
- **Akhir battle**: panel hasil menampilkan EXP per Pokemon dan level up per Pokemon. Tombol `Find New Opponent` dan `Back to My Pokemon`.
- `hit-effects.gif` di-preload seperti sekarang.

### 5.3 StartScreen

- `poke-group.gif` (504 KB, 469x293) diganti `poke-group.webm` loop muted autoplay playsinline, dengan poster `poke-group.avif` sebagai fallback dan sebagai satu-satunya tampilan saat `prefers-reduced-motion: reduce`. Konversi pakai `ffmpeg` dari gif yang ada. Gif lama dihapus.
- Animasi masuk dengan `framer-motion`: judul turun dari atas, tombol muncul dengan delay, footer fade. Tombol `Press Start` berkedip pelan dengan CSS keyframes.
- `minWidth: 100vw` diganti `width: 100%` untuk mencegah scroll horizontal.
- Footer inline style dipindah ke styled component `Footer`.
- Link eksternal mendapat `rel="noopener noreferrer"`. Teks link "here" diganti "PokeAPI".
- Container mendapat `imageRendering: pixelated`.

## 6. Data dan persistensi

### 6.1 Tipe

```ts
interface ISkill {
  name: string;
  power: number;
  type: string;
  cooldown: number; // 2 untuk skill1, 3 untuk skill2
}

interface IMyPokemon {
  // ...field lama tetap
  skills: [ISkill, ISkill]; // baru
  moves: Array<IMove>; // tetap: pool ultimate, 1 per tipe
}
```

Dibuat saat catch di `DetailPokemon.onNicknameSave` lewat `buildSkills(movePool, types)` di `pokemon-utils.ts`: ambil 2 move acak yang belum dipakai sebagai ultimate, power diambil dari `powerFromMoveName` lalu dipetakan ke rentang skill (Skill 1: 40-50, Skill 2: 60-70) supaya tabel 3.1 tetap berlaku sebagai nilai tengah.

### 6.2 Migrasi store

`persist` mendapat `version: 2` dan `migrate`:

- `skills` tidak ada: diisi placeholder `{ name: "Quick Strike", power: 45, type: types[0], cooldown: 2 }` dan `{ name: "Power Blast", power: 65, type: types[1] ?? types[0], cooldown: 3 }`.
- `base_stats` tidak ada: dihitung balik dari `stats` dan level dengan invers `scaleStat`.
- Setelah migrasi, `MyPokemon` menjalankan backfill sekali: untuk Pokemon dengan skill placeholder, `getDetailPokemon(name)` lalu `buildSkills` dan `updatePokemon`. Gagal fetch: placeholder tetap dipakai. Ditandai `ponytail:`.

### 6.3 Sesi battle

Satu key `pokegames@battle-session` berisi seluruh `BattleState` (serializable). Menggantikan `pokegames@battle-player-hp` dan `pokegames@vs-battle-enemy`. Dihapus saat battle berakhir atau pemain keluar. Reload di tengah battle memulihkan HP, gauge, cooldown, chain, bench, dan log.

## 7. Arsitektur kode

Inti battle dipindah ke reducer murni supaya bisa dites tanpa React dan bebas dari bug closure basi di `useBattleController` saat ini.

```
src/features/vs-battle/engine/
  rules.ts        konstanta angka dari bagian 3
  types.ts        BattleState, Combatant, BattleAction, BattleEvent
  damage.ts       calculateDamage (pindahan dari useBattleMechanics)
  ai.ts           chooseEnemyAction
  reducer.ts      battleReducer + resolveRound (urutan speed, faint, switch, akhir)
  engine.test.ts  vitest: chain, overcharge, cooldown, urutan speed, EXP split
src/hooks/common/battle/
  useBattleEngine.ts   useReducer + urutan animasi (setTimeout) + persist sesi. Menggantikan useBattleController.
  useSpawnEnemies.ts   buildEnemy(detail, refLevel) murni + hook spawn N musuh via Promise.all. Menggantikan useSpawnEnemy.
  usePokemonExperience.ts   pembungkus store, logika pindah ke src/utils/leveling.ts
src/utils/leveling.ts      expForNext, expGain, distributeExp, statsAtLevel
```

`BattleState` (ringkas):

```ts
interface Combatant extends IMyPokemon {
  currentHp: number;
  gauge: number;
  chainStep: 0 | 1 | 2;
  cooldowns: { skill1: number; skill2: number };
  fainted: boolean;
}
interface BattleState {
  mode: "1v1" | "3v3";
  player: { team: Combatant[]; active: number };
  enemy: { team: Combatant[]; active: number };
  phase: "intro" | "select" | "resolving" | "forced-switch" | "over";
  winner: "player" | "enemy" | null;
  log: string[];
  events: BattleEvent[]; // antrean animasi untuk UI: hit, damage, faint, switch, levelup
}
```

`BattleEvent` dikonsumsi `useBattleEngine` satu per satu dengan jeda, supaya UI (hit effect, damage text, HP bar) tetap berurutan seperti sekarang. Reducer sendiri sinkron.

Komponen UI baru di `src/features/vs-battle/components/`: `ActionPanel`, `GaugeBar`, `ChainIndicator`, `Bench`, `SwitchModal`, `ResultPanel`. `VSBattle/index.tsx` menjadi komposisi.

File yang dihapus: `useBattleController.ts`, `useBattleMechanics.ts`, `useSpawnEnemy.ts`.

## 8. Testing

- `engine.test.ts` dengan vitest (sudah terpasang, script `test`). `Math.random` di-inject lewat parameter `rng` supaya deterministik.
- Kasus minimum: chain penuh memberi +50 dan pengali 1.5, chain putus saat urutan salah, Ultimate di 150 memberi x3, cooldown berkurang hanya saat pemilik beraksi, Switch diproses sebelum aksi musuh, faint memicu `forced-switch` di 3v3 dan `over` di 1v1, `distributeExp` aktif 100% cadangan 50%.
- `leveling.test.ts`: `expGain` dengan levelMod, multi level up, cap 100.
- Verifikasi manual: 1v1 dan 3v3 penuh sampai akhir, reload di tengah battle, Pokemon lama termigrasi.

## 9. README

- `Squad Tactics (3vs3 Team Match)` dan `Pokemon Status Information (Detail View Update)` dicentang dan dipindah ke daftar fitur.
- Bagian Battle Mechanics naik ke v2.0: Skill 1/2, Combo Chain, Overcharge, Switch.

## 10. Urutan pengerjaan (untuk plan)

1. Engine murni + tes (rules, types, damage, ai, reducer, leveling).
2. Tipe dan migrasi store, `buildSkills`, catch flow.
3. `useSpawnEnemies` dan `useBattleEngine` dengan persist sesi.
4. UI VSBattle 1v1 dengan panel aksi baru, gauge, chain.
5. UI 3v3: bench, switch, intro, result.
6. MyPokemon: toggle mode, multi pick, modal status, help v2, backfill.
7. StartScreen polish dan konversi aset.
8. README.
