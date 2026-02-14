/**
 * GAMES DATABASE BACKUP
 * Created: February 13, 2026
 * Contains all original games before clean slate.
 * To restore, copy the GAMES object back into script.js
 */

const GAMES_BACKUP = {
    // === GEOMETRY DASH GAMES (VERIFIED) ===
    'gd-main': {
        name: 'Geometry Dash',
        url: 'https://lolygames.github.io/gd-lit/',
        description: 'The original rhythm-based platformer. Jump, fly and flip your way through dangerous passages.',
        touchscreen: true,
        image: 'https://geodash.org/images/geodash-game-image.webp',
        category: 'rhythm',
        featured: true,
        plays: 125000
    },
    'gd-meltdown': {
        name: 'Geometry Dash Meltdown',
        url: 'https://lolygames.github.io/gd-melt/',
        description: 'Fiery rhythm platformer with intense new levels and music.',
        touchscreen: true,
        image: 'https://geodash.org/images/geometry-dash-meltdown-og.jpg',
        category: 'rhythm',
        plays: 89000
    },
    'gd-subzero': {
        name: 'Geometry Dash Subzero',
        url: 'https://lolygames.github.io/gd-zubero/',
        description: 'Frozen rhythm adventure with cool new mechanics.',
        touchscreen: true,
        image: 'https://geodash.org/images/geometry-dash-subzero-og.jpg',
        category: 'rhythm',
        plays: 76000
    },
    'gd-world': {
        name: 'Geometry Dash World',
        url: 'https://lolygames.github.io/gd-world/',
        description: 'Explore new worlds in this rhythm-based spinoff.',
        touchscreen: true,
        image: 'https://geodash.org/images/geometry-dash-world-og.jpg',
        category: 'rhythm',
        plays: 67000
    },
    'gd-scratch': {
        name: 'Geometry Dash Scratch',
        url: 'https://lolygames.github.io/geometry-dash/',
        description: 'Classic scratch remake of the beloved game.',
        touchscreen: true,
        image: 'https://geodash.org/images/geometry-dash-scratch-og.jpg',
        category: 'rhythm',
        plays: 45000
    },
    'space-waves': {
        name: 'Space Waves',
        url: 'https://marblerun-3d.github.io/game/spacewave/',
        description: 'Rhythm wave space game with neon graphics.',
        touchscreen: true,
        image: 'https://geodash.org/games/thumbs/space-waves-small-thumb-1.webp',
        category: 'rhythm',
        plays: 34000
    },

    // === FNAF GAMES (VERIFIED - fngames.io) ===
    'fnaf-1': {
        name: 'Five Nights at Freddy\'s',
        url: 'https://fngames.io/fnaf.embed',
        description: 'The original horror classic. Survive five nights at Freddy Fazbear\'s Pizza.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-five-nights-at-freddys-m174x170.jpg',
        category: 'horror',
        featured: true,
        plays: 156000
    },
    'fnaf-2': {
        name: 'Five Nights at Freddy\'s 2',
        url: 'https://fngames.io/five-nights-at-freddys-2.embed',
        description: 'More animatronics, more terror. New and improved Freddy Fazbear\'s Pizza.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-2-m174x170.jpg',
        category: 'horror',
        plays: 134000
    },
    'fnaf-3': {
        name: 'Five Nights at Freddy\'s 3',
        url: 'https://fngames.io/five-nights-at-freddys-3.embed',
        description: 'Springtrap awaits in Fazbear\'s Fright horror attraction.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-3-m174x170.jpg',
        category: 'horror',
        plays: 98000
    },
    'fnaf-4': {
        name: 'Five Nights at Freddy\'s 4',
        url: 'https://fngames.io/five-nights-at-freddys-4.embed',
        description: 'The nightmare continues in this terrifying final chapter.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-4-m174x170.jpg',
        category: 'horror',
        plays: 87000
    },
    'fnaf-sister-location': {
        name: 'FNAF Sister Location',
        url: 'https://fngames.io/five-nights-at-freddys-sister-location.embed',
        description: 'Underground horror at Circus Baby\'s Entertainment and Rental.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-sister-location-m174x170.jpg',
        category: 'horror',
        plays: 76000
    },
    'fnaf-6': {
        name: 'FNAF 6: Pizzeria Simulator',
        url: 'https://fngames.io/fnaf-6.embed',
        description: 'Build your pizzeria while surviving the night.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-6-five-nights-at-freddys-6-1-m174x170.jpg',
        category: 'horror',
        plays: 65000
    },
    'fnaf-ucn': {
        name: 'FNAF Ultimate Custom Night',
        url: 'https://fngames.io/fnaf-ultimate-custom-night.embed',
        description: '50+ animatronics in the ultimate FNAF challenge.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-ultimate-custom-night-1-m174x170.jpg',
        category: 'horror',
        featured: true,
        plays: 112000
    },
    'fnaf-world': {
        name: 'FNAF World',
        url: 'https://fngames.io/fnaf-world.embed',
        description: 'RPG adventure with your favorite FNAF characters.',
        touchscreen: true,
        image: 'https://fngames.io/cache/data/image/game/fnaf-world-m174x170.jpg',
        category: 'adventure',
        plays: 54000
    },
    'fnaf-plus': {
        name: 'FNAF Plus',
        url: 'https://fngames.io/fnaf-plus.embed',
        description: 'Enhanced remake with updated graphics and gameplay.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-plus-1-m174x170.jpg',
        category: 'horror',
        plays: 43000
    },
    'fnaf-free-roam': {
        name: 'FNAF Free Roam',
        url: 'https://fngames.io/fnaf-free-roam.embed',
        description: 'Explore the pizzeria in first person.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/fnaf-free-roam-1-m174x170.jpg',
        category: 'horror',
        plays: 38000
    },
    'five-nights-at-candys': {
        name: 'Five Nights at Candy\'s',
        url: 'https://fngames.io/five-nights-at-candys.embed',
        description: 'Popular FNAF fan game with new animatronics.',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/five-nights-at-candys-1-m174x170.jpg',
        category: 'horror',
        plays: 29000
    },

    // === MORE HORROR (VERIFIED - fngames.io) ===
    'backrooms': {
        name: 'Backrooms',
        url: 'https://fngames.io/backrooms.embed',
        description: 'Escape the endless rooms of the backrooms.',
        touchscreen: false,
        image: 'https://fngames.io/data/image/game/backrooms.png',
        category: 'horror',
        plays: 67000
    },
    'granny': {
        name: 'Granny',
        url: 'https://fngames.io/granny.embed',
        description: 'Escape from Granny\'s house before she catches you.',
        touchscreen: false,
        image: 'https://fngames.io/data/image/game/granny.jpeg',
        category: 'horror',
        plays: 89000
    },
    'baldis-basics': {
        name: 'Baldi\'s Basics',
        url: 'https://fngames.io/baldis-basics.embed',
        description: 'Horror education game. Collect notebooks and escape!',
        touchscreen: false,
        image: 'https://fngames.io/cache/data/image/game/baldis-basics-1-m174x170.jpg',
        category: 'horror',
        plays: 78000
    },

    // === OTHER VERIFIED GAMES ===
    'g-switch-3': {
        name: 'G-Switch 3',
        url: 'https://lolygames.github.io/g-switch-3/',
        description: 'Gravity-switching runner game.',
        touchscreen: true,
        image: 'https://geodash.org/games/thumbs/g-switch-3_2.webp',
        category: 'arcade',
        plays: 67000
    },
    'bullet-force': {
        name: 'Bullet Force',
        url: 'https://classroom8.github.io/bullet-force/',
        description: 'Online multiplayer FPS with realistic graphics.',
        touchscreen: false,
        image: 'https://geodash.org/games/thumbs/bullet-force_2.webp',
        category: 'action',
        featured: true,
        plays: 145000
    },
    'kour-io': {
        name: 'Kour.io',
        url: 'https://kour.io/',
        description: 'Fast-paced parkour FPS multiplayer game.',
        touchscreen: false,
        image: 'https://geodash.org/games/thumbs/kour-io_2.webp',
        category: 'action',
        plays: 98000
    },
    'veck-io': {
        name: 'Veck.io',
        url: 'https://veck.io/',
        description: 'Multiplayer IO battle game.',
        touchscreen: true,
        image: 'https://geodash.org/games/thumbs/veckio_2.webp',
        category: 'multiplayer',
        plays: 67000
    },
    'thumb-fighter': {
        name: 'Thumb Fighter Halloween',
        url: 'https://lolygames.github.io/thumb-fighter-halloween/',
        description: 'Thumb wrestling battle game.',
        touchscreen: true,
        image: 'https://geodash.org/games/thumbs/thumb-fighter-halloween_2.webp',
        category: 'fighting',
        plays: 45000
    },
    'drunken-duel': {
        name: 'Drunken Duel',
        url: 'https://lolygames.github.io/drunken-duel/',
        description: 'Physics fighting game with ragdolls.',
        touchscreen: true,
        image: 'https://geodash.org/games/thumbs/drunken-duel_2.webp',
        category: 'fighting',
        plays: 56000
    },

    // === 8GAMES.NET - ACTION & SHOOTERS ===
    'fortzone-battle-royale': {
        name: 'Fortzone: Battle Royale',
        url: 'https://st.8games.net/10/8g/igra-fortzone-korolevskaya-bitva/',
        description: 'Battle royale action inspired by Fortnite. Fight to be the last one standing!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-fortzone-korolevskaya-bitva.jpg',
        category: 'action',
        featured: true,
        plays: 87000
    },
    '3d-tanks-battle-city': {
        name: '3D Tanks 1990: Battle City',
        url: 'https://st.8games.net/7/8g/igra-3d-tanki-1990-boevoj-gorod/',
        description: 'Classic tank battles remade in 3D. Destroy enemies and defend your base!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-3d-tanki-1990-boevoj-gorod.jpg',
        category: 'action',
        plays: 72000
    },
    'range-master-sniper': {
        name: 'Range Master: Sniper Academy',
        url: 'https://st.8games.net/9/8g/igra-master-strelbishcha-snajperskaya-akademiya/',
        description: 'Precision shooting simulator. Train your aim at the sniper academy!',
        touchscreen: false,
        image: 'https://static.8games.net/flash/all/1/igra-master-strelbishcha-snajperskaya-akademiya.jpg',
        category: 'action',
        plays: 45000
    },
    'gunner-master': {
        name: 'Gunner Master',
        url: 'https://st.8games.net/9/8g/igra-master-artillerist/',
        description: 'Master artillery combat in this explosive action game!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-master-artillerist.jpg',
        category: 'action',
        plays: 38000
    },
    'sticky-slaughter': {
        name: 'Sticky Slaughter',
        url: 'https://st.8games.net/12/8g/igra-lipkaya-bojnya',
        description: 'Intense shooting action with sticky mechanics. Eliminate all enemies!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-lipkaya-bojnya.jpg',
        category: 'action',
        plays: 34000
    },
    'jujutsu-battleground': {
        name: 'JuJutsu Battleground',
        url: 'https://st.8games.net/7/8g/igra-magicheskaya-bitva-plejgraund/',
        description: 'Anime-style fighting arena. Battle with cursed techniques!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-magicheskaya-bitva-plejgraund.jpg',
        category: 'fighting',
        featured: true,
        plays: 65000
    },
    'ragdoll-arena': {
        name: 'Ragdoll Playground: Arena',
        url: 'https://st.8games.net/12/8g/igra-regdol-plejgraund-arena-shou',
        description: 'Physics-based ragdoll battles in arena combat!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-regdol-plejgraund-arena-shou.jpg',
        category: 'fighting',
        plays: 52000
    },

    // === 8GAMES.NET - RACING ===
    'car-stunt-mega-ramps': {
        name: 'Car Stunt Races: Mega Ramps',
        url: 'https://st.8games.net/9/8g/igra-gonki-na-avto-s-tryukami-mega-trampliny/',
        description: 'Insane car stunts on massive ramps. Pull off crazy tricks!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-gonki-na-avto-s-tryukami-mega-trampliny.jpg',
        category: 'racing',
        featured: true,
        plays: 78000
    },
    'ace-moto-rider': {
        name: 'Ace Moto Rider',
        url: 'https://st.8games.net/9/8g/igra-luchshij-motogonshchik/',
        description: 'High-speed motorcycle racing. Become the ace rider!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-luchshij-motogonshchik.jpg',
        category: 'racing',
        plays: 56000
    },

    // === 8GAMES.NET - HORROR ===
    'granny-4': {
        name: 'Granny 4',
        url: 'https://st.8games.net/7/8g/igra-grenni-4/',
        description: 'The terrifying Granny returns! Escape her house of horrors.',
        touchscreen: false,
        image: 'https://static.8games.net/flash/all/1/igra-grenni-4.jpg',
        category: 'horror',
        plays: 89000
    },
    'hawkins-rp': {
        name: 'Hawkins RP',
        url: 'https://st.8games.net/7/8g/igra-khokins-rp/',
        description: 'Stranger Things inspired horror roleplay. Explore Hawkins mysteries!',
        touchscreen: false,
        image: 'https://static.8games.net/flash/all/1/igra-khokins-rp.jpg',
        category: 'horror',
        plays: 45000
    },
    'light-through-fog': {
        name: 'Light Through Fog',
        url: 'https://st.8games.net/7/8g/igra-svet-skvoz-tuman/',
        description: 'Atmospheric horror adventure. Find your way through the fog.',
        touchscreen: false,
        image: 'https://static.8games.net/flash/all/1/igra-svet-skvoz-tuman.jpg',
        category: 'horror',
        plays: 38000
    },
    'shawarma-anomaly': {
        name: 'Scary Shawarma: The Anomaly',
        url: 'https://st.8games.net/7/8g/igra-zhutkij-shaverma-kiosk-anomaliya/',
        description: 'Creepy anomaly horror at a shawarma kiosk. Find the anomalies!',
        touchscreen: false,
        image: 'https://static.8games.net/flash/all/1/igra-zhutkij-shaverma-kiosk-anomaliya.jpg',
        category: 'horror',
        plays: 42000
    },

    // === 8GAMES.NET - SURVIVAL & ADVENTURE ===
    'survival-mini-craft': {
        name: 'Survival: Mini Craft',
        url: 'https://st.8games.net/12/8g/igra-vyzhivaniya-mini-kraft',
        description: 'Minecraft-style survival game. Gather, craft, and survive!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-vyzhivaniya-mini-kraft.jpg',
        category: 'adventure',
        featured: true,
        plays: 95000
    },
    'minecraft-murder-mystery': {
        name: 'Minecraft: Murder Mystery',
        url: 'https://st.8games.net/14/igra-majnkraft-tajna-ubijstva/',
        description: 'Find the murderer in this Minecraft mystery mode!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-majnkraft-tajna-ubijstva.jpg',
        category: 'adventure',
        plays: 72000
    },
    'mine-techno-islands': {
        name: 'Mine: Techno Islands 3D',
        url: 'https://st.8games.net/14/igra-majn-tekhno-ostrova-3d/',
        description: 'Explore futuristic tech islands in this Minecraft adventure!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-majn-tekhno-ostrova-3d.jpg',
        category: 'adventure',
        plays: 58000
    },
    'island-survival': {
        name: 'Robbi: Island Survival',
        url: 'https://st.8games.net/14/igra-robbi-vyzhivanie-na-ostrove/',
        description: 'Roblox-style island survival. Gather resources and stay alive!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-robbi-vyzhivanie-na-ostrove.jpg',
        category: 'adventure',
        plays: 67000
    },
    'stranded-island-tycoon': {
        name: 'Stranded Island Tycoon',
        url: 'https://st.8games.net/14/igra-zastryavshij-na-ostrove-tajkun-kraft-i-vyzhivanie/',
        description: 'Build your empire while surviving on a deserted island!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-zastryavshij-na-ostrove-tajkun-kraft-i-vyzhivanie.jpg',
        category: 'adventure',
        plays: 54000
    },
    'jurassic-simulator': {
        name: 'Jurassic World Simulator',
        url: 'https://st.8games.net/7/8g/igra-simulyator-yurskogo-mira/',
        description: 'Become a dinosaur! Explore and survive in the Jurassic world.',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-simulyator-yurskogo-mira.jpg',
        category: 'adventure',
        plays: 76000
    },
    '99-nights-survival': {
        name: '99 Nights Survival Sandbox',
        url: 'https://st.8games.net/7/8g/igra-99-nochej-vyzhivaniya-pesochnitsa/',
        description: 'Survive 99 nights in this intense survival sandbox!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-99-nochej-vyzhivaniya-pesochnitsa.jpg',
        category: 'adventure',
        plays: 48000
    },
    'runic-curse': {
        name: 'Runic Curse',
        url: 'https://st.8games.net/14/igra-runicheskoe-proklyatie/',
        description: 'Dark fantasy RPG adventure. Break the runic curse!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-runicheskoe-proklyatie.jpg',
        category: 'adventure',
        plays: 43000
    },

    // === 8GAMES.NET - PUZZLE & ESCAPE ===
    'escape-room-memories': {
        name: 'Escape Room: Secret of Memories',
        url: 'https://st.8games.net/7/8g/igra-pobeg-iz-komnaty-tajna-vospominanij/',
        description: 'Solve puzzles and uncover the secret of memories!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-pobeg-iz-komnaty-tajna-vospominanij.jpg',
        category: 'puzzle',
        plays: 52000
    },
    'ice-castle-escape': {
        name: 'Ice Castle Escape',
        url: 'https://st.8games.net/7/8g/igra-pobeg-iz-ledyanogo-zamka/',
        description: 'Escape from the frozen ice castle. Solve puzzles to survive!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-pobeg-iz-ledyanogo-zamka.jpg',
        category: 'puzzle',
        plays: 45000
    },
    'prison-master-escape': {
        name: 'Prison Master: Escape Journey',
        url: 'https://st.8games.net/9/8g/igra-tyuremnyj-nadziratel-puteshestvie-k-pobegu/',
        description: 'Plan your prison break! Solve puzzles and escape!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-tyuremnyj-nadziratel-puteshestvie-k-pobegu.jpg',
        category: 'puzzle',
        plays: 48000
    },
    'snake-escape-puzzle': {
        name: 'Snake Escape Puzzle',
        url: 'https://st.8games.net/12/8g/igra-zmeinyj-pobeg-pazl-golovolomka',
        description: 'Guide the snake through tricky escape puzzles!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-zmeinyj-pobeg-pazl-golovolomka.jpg',
        category: 'puzzle',
        plays: 38000
    },
    'legendary-plumber': {
        name: 'The Legendary Plumber',
        url: 'https://st.8games.net/12/8g/igra-legendarnyj-santekhnik',
        description: 'Connect pipes in this classic plumber puzzle game!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-legendarnyj-santekhnik.jpg',
        category: 'puzzle',
        plays: 34000
    },

    // === 8GAMES.NET - ARCADE & CASUAL ===
    'tetro-tower-3d': {
        name: 'Tetro Tower 3D',
        url: 'https://st.8games.net/12/8g/igra-tetro-bashnya-3d',
        description: '3D Tetris tower building. Stack blocks strategically!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-tetro-bashnya-3d.jpg',
        category: 'arcade',
        featured: true,
        plays: 65000
    },
    'tetricraft': {
        name: 'Tetricraft',
        url: 'https://st.8games.net/12/8g/igra-tetrikraft',
        description: 'Minecraft meets Tetris! Creative block stacking fun.',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-tetrikraft.jpg',
        category: 'arcade',
        plays: 48000
    },
    '2048-ultimate': {
        name: '2048 Ultimate',
        url: 'https://st.8games.net/12/8g/igra-absolyutnyj-2048',
        description: 'The ultimate 2048 experience. Merge tiles to 2048!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-absolyutnyj-2048.jpg',
        category: 'puzzle',
        plays: 72000
    },
    'mahjong-zodiac': {
        name: 'Mahjong Zodiac',
        url: 'https://st.8games.net/9/8g/igra-madzhong-zodiak/',
        description: 'Beautiful zodiac-themed Mahjong matching game.',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-madzhong-zodiak.jpg',
        category: 'casual',
        plays: 54000
    },
    'chess-merge': {
        name: 'Chess Merge',
        url: 'https://st.8games.net/12/8g/igra-shakhmatnoe-sliyanie',
        description: 'Unique chess-merging puzzle game. Combine pieces strategically!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-shakhmatnoe-sliyanie.jpg',
        category: 'puzzle',
        plays: 45000
    },
    'solitaire-holiday': {
        name: 'Solitaire Holiday',
        url: 'https://st.8games.net/9/8g/igra-prazdnichnyj-pasyans/',
        description: 'Relaxing holiday solitaire card game.',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-prazdnichnyj-pasyans.jpg',
        category: 'casual',
        plays: 38000
    },
    'tic-tac-toe-evolution': {
        name: 'Tic Tac Toe: Evolution',
        url: 'https://st.8games.net/12/8g/igra-krestiki-noliki-evolyutsiya',
        description: 'Classic Tic Tac Toe with evolution twist!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-krestiki-noliki-evolyutsiya.jpg',
        category: 'casual',
        plays: 32000
    },
    'billy-the-archer': {
        name: 'Billy the Archer',
        url: 'https://st.8games.net/12/8g/igra-billi-luchnik',
        description: 'Aim and shoot targets as Billy the Archer!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-billi-luchnik.jpg',
        category: 'arcade',
        plays: 42000
    },
    'frost-defense': {
        name: 'Frost Defense',
        url: 'https://st.8games.net/12/8g/igra-moroznaya-zashchita',
        description: 'Tower defense in a frozen winter setting!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-moroznaya-zashchita.jpg',
        category: 'arcade',
        plays: 38000
    },
    'merge-duel-io': {
        name: 'MergeDuel.io',
        url: 'https://st.8games.net/12/8g/igra-mergeduel-io',
        description: 'Multiplayer merge battling IO game!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-mergeduel-io.jpg',
        category: 'multiplayer',
        plays: 48000
    },
    'snowballs-battle': {
        name: 'Snowballs: Blue vs Red',
        url: 'https://st.8games.net/7/8g/igra-snezhki-sinie-protiv-krasnykh/',
        description: 'Epic snowball fight! Blue team vs Red team!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-snezhki-sinie-protiv-krasnykh.jpg',
        category: 'multiplayer',
        plays: 45000
    },
    'pocket-army-battle': {
        name: 'Battle of the Pocket Army',
        url: 'https://st.8games.net/12/8g/igra-bitva-karmannoj-armii',
        description: 'Command your pocket-sized army in epic battles!',
        touchscreen: true,
        image: 'https://static.8games.net/flash/all/1/igra-bitva-karmannoj-armii.jpg',
        category: 'action',
        plays: 42000
    }
};
