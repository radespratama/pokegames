# Battle v3: Hybrid Moves and Tactical AI

Tanggal: 2026-09-13
Status: disetujui untuk perencanaan

## 1. Tujuan

Meningkatkan kedalaman battle v2 tanpa mengubah identitas mini game:

1. Move memakai metadata asli PokeAPI untuk tipe, kategori physical/special, accuracy, dan priority.
2. Power tetap dinormalisasi ke rentang balance battle v2 agar data ekstrem PokeAPI tidak mendominasi.
3. Damage physical dan special memakai pasangan stat yang benar.
4. AI musuh menilai seluruh kondisi battle, dapat melakukan voluntary switch, dan memilih aksi berdasarkan nilai taktis.
5. UI menjelaskan kategori serta accuracy move agar keputusan pemain dapat dipahami.

## 2. Scope

### Termasuk

- REST endpoint PokeAPI `/move/{id-or-name}`.
- Enrichment maksimal delapan kandidat move per Pokemon.
- Cache detail move selama 24 jam melalui TanStack Query.
- Store schema v3 dan kompatibilitas data Pokemon lama.
- Physical/special damage, accuracy, dan move priority.
- Tactical enemy action scoring dan voluntary switch pada mode 3v3.
- Badge `PHY`/`SP` serta label accuracy pada ActionPanel.
- Fallback yang tetap membuat Pokemon playable ketika PokeAPI move request gagal.

### Tidak termasuk

- BGM dan sound effect.
- Status move, ailment, stat stage, buff/debuff, healing, drain, recoil, flinch, weather, terrain, ability, item, dan PP.
- Meniru formula damage game Pokemon resmi secara penuh.
- Mengubah Combo Chain, Momentum, Overcharge, EXP, atau aturan forced switch v2 kecuali integrasi yang diperlukan oleh category/priority baru.

Move dengan `damage_class.name === "status"` atau `power == null || power <= 0` tidak masuk battle pool v3. Data terstrukturnya tersedia di PokeAPI, tetapi eksekusinya ditunda hingga sistem effect memiliki scope sendiri.

## 3. Keputusan arsitektur

### 3.1 Model move ter-normalisasi

```ts
export type MoveDamageClass = "physical" | "special";

export interface IBattleMove {
  name: string;
  power: number;
  type: string;
  damageClass: MoveDamageClass;
  accuracy: number;
  priority: number;
}

export interface ISkill extends IBattleMove {
  cooldown: number;
}
```

`IMyPokemon.moves` menjadi `Array<IBattleMove>` dan tetap berarti daftar Ultimate. `IMyPokemon.skills` tetap tuple `[ISkill, ISkill]`. Basic tidak disimpan sebagai move: Basic selalu neutral physical, power 20, accuracy 100, priority 0.

### 3.2 Seam data move

Pemisahan module:

- `src/services/api/moves.ts`: tipe response REST dan `getMoveDetail(name)` saja.
- `src/features/vs-battle/data/movePool.ts`: memilih kandidat, memfilter damaging move, normalisasi power, dan fallback. Module menerima `loadMove` sebagai dependency sehingga test tidak melakukan network.
- Caller React menyediakan cached loader melalui `queryClient.fetchQuery` dengan query key `["move-detail", name]` dan `staleTime` 24 jam.

Interface module:

```ts
export type MoveDetailLoader = (
  name: string,
) => Promise<IPokeMoveDetailResponse | undefined>;

export function loadBattleMovePool(
  refs: IPokemonDetailResponse["moves"],
  count: number,
  rng: Rng,
  loadMove: MoveDetailLoader,
): Promise<Array<IBattleMove>>;
```

Urutan hasil mengikuti urutan kandidat, bukan waktu response network. `Promise.allSettled` memastikan satu request gagal tidak menggagalkan seluruh pool.

### 3.3 Pemilihan dan normalisasi

1. Shuffle move refs dengan injected `rng`.
2. Ambil maksimal delapan kandidat unik.
3. Fetch detail kandidat secara paralel.
4. Pertahankan hanya `physical`/`special` dengan `power > 0`.
5. Map tipe, damage class, `accuracy ?? 100`, dan `priority` asli.
6. Normalisasi raw power ke 30–65:

```ts
clamped = clamp(rawPower, 20, 150);
normalized = round(30 + ((clamped - 20) / 130) * 35);
```

7. Jika hasil kurang dari jumlah yang diminta, isi dari kandidat lama menggunakan hash power v2 dengan default `physical`, accuracy 100, priority 0.

Skill slot tetap memakai power band v2:

- Skill 1: 40–50, cooldown 2.
- Skill 2: 60–70, cooldown 3.
- Ultimate: normalized power 30–65 lalu dikalikan Overcharge.

Tipe move berasal dari response move, tidak lagi dipaksa menjadi tipe Pokemon. STAB tetap dihitung bila tipe move cocok dengan salah satu tipe Pokemon.

### 3.4 Data loading

#### Pokemon baru

Saat nickname disimpan, halaman DetailPokemon memuat pool ter-normalisasi sebelum `addPokemon`. Jika seluruh detail move gagal, fallback v2 digunakan sehingga proses catch tetap berhasil.

#### Pokemon tersimpan

Store naik dari version 2 ke version 3. Migrasi sinkron menambahkan nilai aman pada move lama:

```ts
damageClass: "physical";
accuracy: 100;
priority: 0;
moveDataVersion: 2;
```

MyPokemon melakukan background backfill hanya untuk Pokemon dengan `moveDataVersion < 3`. Backfill berhasil mengganti Ultimate dan skill dengan pool ter-normalisasi serta menetapkan `moveDataVersion: 3`. Kegagalan network dibiarkan memakai fallback hasil migrasi dan dapat dicoba ulang pada mount berikutnya.

#### Musuh

Setiap query enemy mengambil Pokemon detail lalu memuat maksimal delapan move detail menggunakan cached loader yang sama. Seed battle membuat pemilihan kandidat deterministik. `buildEnemy` tetap fungsi murni dan menerima pool yang sudah ter-normalisasi.

## 4. Damage engine

`DamageInput` mendapat `damageClass` dan `accuracy`; caller tidak lagi mengambil miss chance Skill 1/2 dari slot rule.

```ts
const attackStat =
  input.damageClass === "special"
    ? attacker.stats.special_attack
    : attacker.stats.attack;

const defenseStat =
  input.damageClass === "special"
    ? defender.stats.special_defense
    : defender.stats.defense;

const isMiss = rng() >= input.accuracy / 100;
```

Formula lain tetap:

```text
raw      = attackStat * (power / 85)
defMul   = 100 / (100 + defenseStat)
variance = 0.90..1.10
total    = raw * defMul * effectiveness * stab * crit * chain * overcharge * variance
```

Ultimate mengikuti accuracy move PokeAPI. Basic selalu accuracy 100. Nilai accuracy divalidasi ke rentang 1–100 saat normalisasi.

## 5. Urutan aksi

Priority ditentukan sebelum speed:

1. Switch: internal priority 100, intentionally above PokeAPI move priority.
2. Ultimate/Skill: `move.priority`.
3. Basic: priority 0.
4. Priority sama: speed aktif lebih tinggi.
5. Priority dan speed sama: injected RNG.

Dengan aturan ini voluntary switch musuh selalu masuk sebelum attack pemain, sama seperti switch pemain. Pokemon baru menerima attack pada ronde tersebut.

## 6. Tactical AI

Interface berubah dari combatant tunggal menjadi state lengkap:

```ts
export function chooseEnemyAction(
  state: BattleState,
  rng: Rng = Math.random,
): BattleAction;
```

AI tidak memanggil `calculateDamage` karena fungsi itu mengonsumsi RNG. `estimateDamage` merupakan fungsi murni dengan variance 1.0, expected critical multiplier, dan hit probability `accuracy / 100`.

### 6.1 Kandidat attack

AI membuat kandidat Basic, Skill yang cooldown-nya nol, dan setiap Ultimate ketika gauge memenuhi threshold. Nilai attack:

```text
score = expectedDamage
      + KO bonus
      + chain continuation bonus
      + overcharge readiness bonus
      + small seeded jitter
```

Konstanta awal di `RULES.AI`:

```ts
KO_BONUS: 1000;
CHAIN_CONTINUE_BONUS: 18;
OVERCHARGE_READY_BONUS: 12;
SWITCH_MARGIN: 35;
LOW_HP_RATIO: 0.35;
BAD_EFFECTIVENESS: 0.5;
JITTER: 4;
```

Jitter menggunakan injected RNG agar pilihan dengan skor dekat tidak selalu identik tetapi test tetap deterministik.

### 6.2 Kandidat switch

Switch hanya dipertimbangkan pada 3v3 ketika ada bench hidup dan salah satu kondisi berikut benar:

- HP aktif <= 35%; atau
- effectiveness terbaik move aktif terhadap pemain <= 0.5.

Nilai Pokemon bench:

```text
switchScore = bestExpectedDamageAfterSwitch
            - expectedIncomingDamage * 0.5
            + hpRatio * 25
```

AI switch bila kandidat bench terbaik memiliki skor minimal `SWITCH_MARGIN` di atas kandidat attack aktif. Margin/hysteresis ini mencegah switch bolak-balik tanpa menambah state cooldown baru.

AI tetap memakai action yang valid jika enrichment gagal: fallback move menjamin setiap combatant mempunyai dua skill dan setidaknya satu Ultimate; Basic selalu tersedia.

## 7. UI

ActionPanel mempertahankan layout pixel-art saat ini. Setiap Skill dan Ultimate mendapat:

- Badge `PHY` atau `SP`.
- Label `ACC n`.
- `aria-label` yang menyebut nama, category, power, dan accuracy.

Basic menampilkan badge `PHY` dan `ACC 100`. Cooldown, locked Ultimate, Overcharge, warna type, serta disabled state tidak berubah.

Battle log tidak mendapat baris tambahan untuk category. Log miss, critical, effectiveness, switch, dan damage yang sudah ada tetap menjadi feedback utama.

## 8. Error handling dan performa

- Move request memakai `Promise.allSettled`; partial failure menghasilkan partial enriched pool ditambah fallback.
- Detail Pokemon yang gagal tetap memakai error behavior `useSpawnEnemies` saat ini.
- Query detail move memakai cache 24 jam dan retry 1.
- Maksimum request baru per Pokemon per enrichment adalah delapan.
- Tidak ada fetch move detail di dalam reducer atau selama action playback.
- Session battle menyimpan data move ter-normalisasi sebagai bagian dari `BattleState`; reload tidak melakukan enrichment ulang.

## 9. Testing

Vitest menguji module melalui interface publik:

1. Normalisasi physical/special, accuracy, priority, power band, urutan response, partial failure, dan fallback.
2. Migrasi store v2 ke v3 tanpa merusak nama/power/type lama.
3. Damage physical memakai attack/defense; special memakai special_attack/special_defense; accuracy menyebabkan hit/miss deterministik.
4. Priority switch/move mengalahkan speed dan tie memakai RNG.
5. AI memilih KO, mengeksploitasi defense yang lemah, meneruskan chain ketika bernilai, menahan move cooldown, dan voluntary switch pada matchup buruk.
6. AI tidak switch di 1v1, tidak memilih Pokemon fainted, dan tidak switch ketika keunggulan bench di bawah margin.
7. Build enemy dan catch/backfill menghasilkan `moveDataVersion: 3` dengan move valid.

Verification akhir:

```bash
npm test
npx tsc --noEmit
npm run lint -- --no-fix
npm run build
```

## 10. Status/buff upgrade path

PokeAPI sudah menyediakan `meta.ailment`, `ailment_chance`, `stat_changes`, `stat_chance`, `target`, healing, drain, dan flinch. Upgrade berikutnya dapat menambah union `MoveEffect` dari field terstruktur tersebut tanpa parsing `effect_entries`.

Move kompleks seperti Protect, Substitute, Leech Seed, transform, atau multi-turn tetap membutuhkan adapter lokal per effect. Tidak ada bagian battle v3 yang menjalankan effect tersebut; status move sengaja difilter agar physical/special dan AI dapat selesai serta seimbang lebih dahulu.
