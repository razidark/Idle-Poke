let Poke = function(pokeModel, initialLevel, initialExp, shiny, caughtAt, gender, equippedMovesNames = null) {
    this.poke = cloneJsonObject(pokeModel);
    this.expTable = EXP_TABLE[this.poke.stats[0]["growth rate"]];
    this.exp = initialLevel && this.expTable[initialLevel - 1] || initialExp;
    this.isShiny = (shiny === true);
    this.caughtAt = caughtAt || Date.now();
    this.hp = this.setHpValue(this.poke.stats[0].hp) * 3;
    this.gender = gender || (Math.random() < 0.5 ? 'male' : 'female');
    this.equippedMovesNames = equippedMovesNames; // Custom equipped moves loadout names list
};
Poke.prototype.currentLevel = function() {
    return this.expTable
        .filter((xp_requirement) => xp_requirement <= this.exp)
        .length;
};
Poke.prototype.statValue = function(raw) {
    return Math.floor((((raw + 50) * this.currentLevel()) / 150))
};
Poke.prototype.setHpValue = function(rawHp) {
    return Math.floor(((rawHp * this.currentLevel()) / 40))
};
Poke.prototype.tryEvolve = function(shiny) {
    const pokemonHasEvolution =
        EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined;
    if (pokemonHasEvolution) {
        const oldPokemon = this.poke.pokemon[0].Pokemon;
        const evolution = EVOLUTIONS[this.poke.pokemon[0].Pokemon].to;
        const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
        if (this.currentLevel() >= levelToEvolve) {
            this.poke = cloneJsonObject(pokeByName(evolution));
            player.addPokedex(evolution, (shiny ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
            if (!player.hasPokemon(oldPokemon, shiny)) {
                player.addPokedex(oldPokemon, (shiny ? POKEDEXFLAGS.ownedShiny : POKEDEXFLAGS.ownedNormal))
            }
        }
    }
};
Poke.prototype.canEvolve = function() {
    // pokemon Has Evolution
    if (EVOLUTIONS[this.poke.pokemon[0].Pokemon] !== undefined) {
        const levelToEvolve = Number(EVOLUTIONS[this.poke.pokemon[0].Pokemon].level);
        if (this.currentLevel() >= levelToEvolve) {
            return true;
        }
    }
    return false;
};

Poke.prototype.setHp = function(hp) { this.hp = hp; };
Poke.prototype.getHp = function() { return this.hp; };
Poke.prototype.maxHp = function() { return this.setHpValue(this.poke.stats[0].hp) * 3; };
Poke.prototype.attack = function() { return this.statValue(this.poke.stats[0].attack); };
Poke.prototype.defense = function() { return this.statValue(this.poke.stats[0].defense); };
Poke.prototype.spAttack = function() { return this.statValue(this.poke.stats[0]['sp atk']); };
Poke.prototype.spDefense = function() { return this.statValue(this.poke.stats[0]['sp def']); };
Poke.prototype.speed = function() { return this.statValue(this.poke.stats[0].speed); };
Poke.prototype.avgDefense = function() { return (this.defense() + this.spDefense())/2; };

Poke.prototype.pokeName = function() {
    return this.poke.pokemon[0].Pokemon;
};
Poke.prototype.image = function() {
    const imageType = (this.isShiny ? 'shiny' : 'normal');
    return {
        front: this.poke.images[imageType].front,
        back: this.poke.images[imageType].back
    }
};
Poke.prototype.shiny = function() {
    return this.isShiny
};
Poke.prototype.types = function() { return this.poke.stats[0].types; };
Poke.prototype.catchRate = function() { return Number(this.poke.stats[0]['catch rate']); };
Poke.prototype.lifeAsText = function() { return '' + (this.getHp() < 0 ? 0 : this.getHp()) + ' / ' + this.maxHp(); };
Poke.prototype.alive = function() { return this.getHp() > 0; };
Poke.prototype.giveExp = function(amount) {
    this.exp += amount;
};
Poke.prototype.currentExp = function() { return this.exp; };
Poke.prototype.nextLevelExp = function() { return this.expTable[this.currentLevel()]; };
Poke.prototype.thisLevelExp = function() { return this.expTable[this.currentLevel() - 1] || 10; };
Poke.prototype.level = function() { return this.currentLevel(); };
Poke.prototype.attackSpeed = function() {
    const baseSpeed = Math.floor(1000 / (500 + this.speed()) * 800);
    let speed = baseSpeed <= 300 ? 300 : baseSpeed;
    
    if (typeof UpgradeManager !== 'undefined') {
        const shoesBenefit = UpgradeManager.getBenefit('shoes') || 0;
        speed = Math.floor(speed * (1 - shoesBenefit));
    }
    
    const battleSpeedSetting = (player && player.settings && player.settings.battleSpeed) || 'slow';
    if (battleSpeedSetting === 'slow') {
        return speed * 2.0;
    } else if (battleSpeedSetting === 'normal') {
        return speed * 1.4;
    } else {
        return speed;
    }
};
Poke.prototype.avgAttack = function() { return (this.attack() + this.spAttack())/2; };
Poke.prototype.takeDamage = function(enemyAttack) {
    const damageToTake = (enemyAttack - this.avgDefense() / 10) > 0
        && Math.ceil((enemyAttack - this.avgDefense() / 10) * ((Math.random() + 0.1) * 2) / 100)
        || 0;
    this.setHp(this.getHp() - damageToTake);
    return damageToTake;
};
Poke.prototype.baseExp = function() { return Number(this.poke.exp[0]['base exp']); };
Poke.prototype.heal = function() { return this.setHp(this.maxHp()); };
Poke.prototype.save = function() { return [this.poke.pokemon[0].Pokemon, this.exp, this.isShiny, this.caughtAt, this.gender, this.equippedMovesNames]; };

const makeRandomPoke = (level) => new Poke(randomArrayElement(POKEDEX), level);

const TYPE_MOVES = {
    fire: [
        { name: 'Scratch', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Growl', power: 0, type: 'normal', pp: 40, level: 1 },
        { name: 'Ember', power: 40, type: 'fire', pp: 25, level: 4 },
        { name: 'Metal Claw', power: 50, type: 'steel', pp: 35, level: 8 },
        { name: 'Fire Spin', power: 35, type: 'fire', pp: 15, level: 12 },
        { name: 'Flame Wheel', power: 60, type: 'fire', pp: 25, level: 22 },
        { name: 'Flamethrower', power: 90, type: 'fire', pp: 15, level: 36 }
    ],
    water: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Growl', power: 0, type: 'normal', pp: 40, level: 1 },
        { name: 'Water Gun', power: 40, type: 'water', pp: 25, level: 4 },
        { name: 'Bubble', power: 40, type: 'water', pp: 30, level: 8 },
        { name: 'Water Pulse', power: 60, type: 'water', pp: 20, level: 15 },
        { name: 'Surf', power: 90, type: 'water', pp: 15, level: 28 },
        { name: 'Hydro Pump', power: 110, type: 'water', pp: 5, level: 40 }
    ],
    grass: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Growl', power: 0, type: 'normal', pp: 40, level: 1 },
        { name: 'Vine Whip', power: 45, type: 'grass', pp: 25, level: 5 },
        { name: 'Razor Leaf', power: 55, type: 'grass', pp: 25, level: 10 },
        { name: 'Mega Drain', power: 40, type: 'grass', pp: 15, level: 16 },
        { name: 'Seed Bomb', power: 80, type: 'grass', pp: 15, level: 25 },
        { name: 'Solar Beam', power: 120, type: 'grass', pp: 10, level: 45 }
    ],
    electric: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Growl', power: 0, type: 'normal', pp: 40, level: 1 },
        { name: 'Thunder Shock', power: 40, type: 'electric', pp: 30, level: 4 },
        { name: 'Quick Attack', power: 40, type: 'normal', pp: 30, level: 8 },
        { name: 'Spark', power: 65, type: 'electric', pp: 20, level: 15 },
        { name: 'Thunderbolt', power: 90, type: 'electric', pp: 15, level: 26 },
        { name: 'Thunder', power: 110, type: 'electric', pp: 10, level: 42 }
    ],
    normal: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Growl', power: 0, type: 'normal', pp: 40, level: 1 },
        { name: 'Scratch', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Pound', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Quick Attack', power: 40, type: 'normal', pp: 30, level: 5 },
        { name: 'Slash', power: 70, type: 'normal', pp: 20, level: 18 },
        { name: 'Double-Edge', power: 120, type: 'normal', pp: 15, level: 35 }
    ],
    flying: [
        { name: 'Gust', power: 40, type: 'flying', pp: 35, level: 1 },
        { name: 'Wing Attack', power: 60, type: 'flying', pp: 35, level: 12 },
        { name: 'Air Slash', power: 75, type: 'flying', pp: 15, level: 28 }
    ],
    poison: [
        { name: 'Poison Sting', power: 15, type: 'poison', pp: 35, level: 1 },
        { name: 'Acid', power: 40, type: 'poison', pp: 30, level: 10 },
        { name: 'Sludge', power: 65, type: 'poison', pp: 20, level: 24 }
    ],
    psychic: [
        { name: 'Confusion', power: 50, type: 'psychic', pp: 25, level: 1 },
        { name: 'Psybeam', power: 65, type: 'psychic', pp: 20, level: 14 },
        { name: 'Psychic', power: 90, type: 'psychic', pp: 10, level: 35 }
    ],
    bug: [
        { name: 'String Shot', power: 20, type: 'bug', pp: 40, level: 1 },
        { name: 'Bug Bite', power: 60, type: 'bug', pp: 20, level: 9 },
        { name: 'Signal Beam', power: 75, type: 'bug', pp: 15, level: 25 }
    ],
    rock: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Rock Throw', power: 50, type: 'rock', pp: 15, level: 8 },
        { name: 'Rock Slide', power: 75, type: 'rock', pp: 10, level: 22 }
    ],
    ground: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Mud-Slap', power: 20, type: 'ground', pp: 10, level: 5 },
        { name: 'Bone Club', power: 65, type: 'ground', pp: 20, level: 15 },
        { name: 'Earthquake', power: 100, type: 'ground', pp: 10, level: 36 }
    ],
    ice: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Powder Snow', power: 40, type: 'ice', pp: 25, level: 6 },
        { name: 'Ice Beam', power: 90, type: 'ice', pp: 10, level: 32 }
    ],
    ghost: [
        { name: 'Lick', power: 30, type: 'ghost', pp: 30, level: 1 },
        { name: 'Shadow Punch', power: 60, type: 'ghost', pp: 20, level: 15 },
        { name: 'Shadow Ball', power: 80, type: 'ghost', pp: 15, level: 30 }
    ],
    dragon: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Dragon Rage', power: 40, type: 'dragon', pp: 10, level: 15 },
        { name: 'Dragon Claw', power: 80, type: 'dragon', pp: 15, level: 33 }
    ],
    steel: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Metal Claw', power: 50, type: 'steel', pp: 35, level: 8 },
        { name: 'Iron Head', power: 80, type: 'steel', pp: 15, level: 30 }
    ],
    fighting: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Karate Chop', power: 50, type: 'fighting', pp: 25, level: 6 },
        { name: 'Double Kick', power: 30, type: 'fighting', pp: 30, level: 12 },
        { name: 'Submission', power: 80, type: 'fighting', pp: 20, level: 28 }
    ],
    dark: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Bite', power: 60, type: 'dark', pp: 25, level: 10 },
        { name: 'Faint Attack', power: 60, type: 'dark', pp: 20, level: 18 },
        { name: 'Dark Pulse', power: 80, type: 'dark', pp: 15, level: 32 }
    ],
    fairy: [
        { name: 'Tackle', power: 40, type: 'normal', pp: 35, level: 1 },
        { name: 'Fairy Wind', power: 40, type: 'fairy', pp: 30, level: 6 },
        { name: 'Dazzling Gleam', power: 80, type: 'fairy', pp: 10, level: 28 }
    ]
};

Poke.prototype.getMoves = function() {
    const types = this.types();
    const primaryType = (types[0] || 'normal').toLowerCase();
    let movePool = TYPE_MOVES[primaryType] || TYPE_MOVES.normal;
    const currentLvl = this.level();
    
    let finalMoves = [];
    
    // Load custom equipped moves names if they exist and are learned
    if (this.equippedMovesNames && this.equippedMovesNames.length > 0) {
        this.equippedMovesNames.forEach(name => {
            let moveObj = movePool.find(m => m.name === name) || TYPE_MOVES.normal.find(m => m.name === name);
            if (moveObj && moveObj.level <= currentLvl) {
                finalMoves.push(moveObj);
            }
        });
    }
    
    // Fallback to auto-equip if no custom moves are loaded/available
    if (finalMoves.length === 0) {
        let unlocked = movePool.filter(m => m.level <= currentLvl);
        if (unlocked.length < 4) {
            let fallbackPool = TYPE_MOVES.normal.filter(m => m.level <= currentLvl);
            fallbackPool.forEach(fm => {
                if (unlocked.length < 4 && !unlocked.some(um => um.name === fm.name)) {
                    unlocked.push(fm);
                }
            });
        }
        unlocked.sort((a, b) => b.level - a.level);
        finalMoves = unlocked.slice(0, 4);
    }
    
    // Refresh cache if names do not match
    if (!this.cachedMoves || this.cachedMoves.some((m, idx) => !finalMoves[idx] || m.name !== finalMoves[idx].name)) {
        this.cachedMoves = finalMoves.map(m => Object.assign({}, m, { currentPP: m.pp }));
    }
    
    return this.cachedMoves;
};