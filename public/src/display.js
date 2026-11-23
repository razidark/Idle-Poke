const MAP_COORDINATES = {
    Kanto: {
        starter: { x: 26, y: 83 },
        route: { x: 26, y: 70 },
        viridianCity: { x: 26, y: 57 },
        route21: { x: 17, y: 58 },
        route22: { x: 10, y: 44 },
        special13: { x: 10, y: 28 },
        route1: { x: 26, y: 43 },
        special: { x: 26, y: 33 },
        special1: { x: 26, y: 20 },
        route2: { x: 38, y: 20 },
        special2: { x: 50, y: 20 },
        route3: { x: 63, y: 20 },
        ceruleanCity: { x: 76, y: 20 },
        route23: { x: 76, y: 11 },
        route24: { x: 87, y: 11 },
        special14: { x: 70, y: 15 },
        route4: { x: 76, y: 33 },
        special8: { x: 76, y: 46 },
        route5: { x: 76, y: 58 },
        vermilionCity: { x: 76, y: 71 },
        route10: { x: 88, y: 71 },
        special3: { x: 52, y: 57 },
        route6: { x: 63, y: 46 },
        special7: { x: 50, y: 46 },
        route15: { x: 37, y: 46 },
        route16: { x: 37, y: 67 },
        route17: { x: 47, y: 83 },
        fuchsiaCity: { x: 61, y: 83 },
        special9: { x: 61, y: 72 },
        route7: { x: 87, y: 46 },
        lavenderTown: { x: 95, y: 46 },
        special6: { x: 95, y: 39 },
        route9: { x: 95, y: 29 },
        special4: { x: 95, y: 20 },
        route8: { x: 86, y: 20 },
        special5: { x: 97, y: 29 },
        route11: { x: 95, y: 58 },
        route12: { x: 88, y: 68 },
        route13: { x: 80, y: 78 },
        route14: { x: 70, y: 83 },
        route18: { x: 61, y: 94 },
        route19: { x: 43, y: 94 },
        special11: { x: 43, y: 88 },
        cinnabarIsland: { x: 26, y: 94 },
        special12: { x: 20, y: 90 },
        route20: { x: 26, y: 88 },
        water: { x: 90, y: 90 }
    },
    Johto: {
        starter2: { x: 88, y: 68 },
        route25: { x: 75, y: 68 },
        cherrygroveCity: { x: 62, y: 68 },
        route27: { x: 62, y: 53 },
        route26: { x: 75, y: 53 },
        special17: { x: 75, y: 42 },
        violetCity: { x: 52, y: 42 },
        special18: { x: 52, y: 32 },
        route28: { x: 52, y: 60 },
        special19: { x: 45, y: 52 },
        special20: { x: 45, y: 56 },
        special21: { x: 52, y: 75 },
        route29: { x: 44, y: 82 },
        special22: { x: 37, y: 88 },
        azaleaTown: { x: 37, y: 82 },
        special23: { x: 28, y: 82 },
        route30: { x: 20, y: 70 },
        goldenrodCity: { x: 20, y: 58 },
        route31: { x: 20, y: 45 },
        special26: { x: 20, y: 33 },
        route32: { x: 38, y: 42 },
        route33: { x: 48, y: 33 },
        ecruteakCity: { x: 48, y: 22 },
        special27: { x: 43, y: 16 },
        special28: { x: 53, y: 16 },
        route34: { x: 36, y: 22 },
        route35: { x: 28, y: 32 },
        olivineCity: { x: 28, y: 46 },
        route36: { x: 20, y: 60 },
        route37: { x: 10, y: 80 },
        special29: { x: 10, y: 72 },
        cianwoodCity: { x: 5, y: 82 },
        route38: { x: 62, y: 22 },
        special31: { x: 62, y: 16 },
        mahoganyTown: { x: 75, y: 22 },
        special32: { x: 75, y: 16 },
        route39: { x: 75, y: 11 },
        special33: { x: 75, y: 4 },
        route40: { x: 85, y: 22 },
        special34: { x: 89, y: 22 },
        blackthornCity: { x: 93, y: 22 },
        special35: { x: 93, y: 14 },
        route41: { x: 93, y: 45 },
        route42: { x: 5, y: 92 },
        special36: { x: 98, y: 55 },
        special41: { x: 50, y: 50 },
        water3: { x: 85, y: 85 }
    }
};

const Display = {
    healElement: $('#heal'),
    logElement: $('#console #console-text'),
    setValue: function(domElement, newValue, append) {
        if (append === undefined) { append = false }
        if (append) {
            domElement.innerHTML += newValue;
        }
        if (!append) {
            if (domElement.innerHTML !== newValue) {
                domElement.innerHTML = newValue;
            }
        }
    },
    getValue: function(domElement) {
        return domElement.innerHTML;
    },
    setProp: function(domElement, attribute, newValue) {
        if (domElement[attribute] !== newValue) {
            domElement[attribute] = newValue
        }
    },
    spawnFloatingDamage: function(targetId, text, isCrit) {
        const arena = $('#battleArena');
        if (!arena) return;
        const box = $('#' + targetId + 'Box');
        if (!box) return;
        
        const damageEl = document.createElement('div');
        damageEl.className = 'floating-damage' + (isCrit ? ' crit' : '');
        damageEl.innerText = text;
        
        const rect = box.getBoundingClientRect();
        const arenaRect = arena.getBoundingClientRect();
        const left = rect.left - arenaRect.left + rect.width / 2;
        const top = rect.top - arenaRect.top + rect.height / 2 - 20;
        
        damageEl.style.left = left + 'px';
        damageEl.style.top = top + 'px';
        
        arena.appendChild(damageEl);
        setTimeout(() => {
            damageEl.remove();
        }, 1100);
    },
    triggerAttackVFX: function(type, targetId) {
        const arena = $('#battleArena');
        if (!arena) return;
        const box = $('#' + targetId + 'Box');
        if (!box) return;
        
        const rect = box.getBoundingClientRect();
        const arenaRect = arena.getBoundingClientRect();
        const centerX = rect.left - arenaRect.left + rect.width / 2;
        const centerY = rect.top - arenaRect.top + rect.height / 2;
        
        const vfxContainer = document.createElement('div');
        vfxContainer.className = 'attack-vfx-container';
        arena.appendChild(vfxContainer);
        
        const typeLower = (type || 'normal').toLowerCase();
        
        if (typeLower === 'fire') {
            for (let i = 0; i < 12; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-element vfx-spark';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                const angle = Math.random() * Math.PI * 2;
                const distance = 30 + Math.random() * 40;
                particle.style.setProperty('--dx', (Math.cos(angle) * distance) + 'px');
                particle.style.setProperty('--dy', (Math.sin(angle) * distance) + 'px');
                particle.style.animationDelay = (Math.random() * 0.1) + 's';
                vfxContainer.appendChild(particle);
            }
        } else if (typeLower === 'water') {
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-element vfx-bubble';
                const offsetX = -20 + Math.random() * 40;
                const offsetY = -10 + Math.random() * 30;
                particle.style.left = (centerX + offsetX) + 'px';
                particle.style.top = (centerY + offsetY) + 'px';
                particle.style.animationDelay = (Math.random() * 0.2) + 's';
                vfxContainer.appendChild(particle);
            }
        } else if (typeLower === 'grass') {
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-element vfx-leaf';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                const angle = Math.random() * Math.PI * 2;
                const distance = 40 + Math.random() * 30;
                particle.style.setProperty('--sx', (Math.cos(angle) * distance) + 'px');
                particle.style.setProperty('--sy', (Math.sin(angle) * distance) + 'px');
                particle.style.animationDelay = (Math.random() * 0.25) + 's';
                vfxContainer.appendChild(particle);
            }
        } else if (typeLower === 'electric') {
            for (let i = 0; i < 5; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-element vfx-electric';
                const offsetX = -15 + Math.random() * 30;
                const offsetY = -20 + Math.random() * 40;
                particle.style.left = (centerX + offsetX) + 'px';
                particle.style.top = (centerY + offsetY) + 'px';
                particle.style.setProperty('--rot', (Math.random() * 40 - 20) + 'deg');
                vfxContainer.appendChild(particle);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                const particle = document.createElement('div');
                particle.className = 'vfx-element vfx-scratch';
                const offsetX = -10 + Math.random() * 20;
                const offsetY = -10 + Math.random() * 20;
                particle.style.left = (centerX + offsetX) + 'px';
                particle.style.top = (centerY + offsetY) + 'px';
                particle.style.setProperty('--rot', (Math.random() * 180) + 'deg');
                particle.style.animationDelay = (i * 0.08) + 's';
                vfxContainer.appendChild(particle);
            }
        }
        
        setTimeout(() => {
            vfxContainer.remove();
        }, 1000);
    },
    renderPokeOnContainer: function(id, poke, face) {
        const container = $('#' + id + 'Box').querySelector('.pokeBox');
        const townBox = $('#townBox');
        const trainerButton = $('#trainerButton');
        
        // Update biome background of the combat arena dynamically based on current route details
        const arena = $('#battleArena');
        if (arena) {
            const route = ROUTES[player.settings.currentRegionId][player.settings.currentRouteId];
            if (route) {
                const name = route.name.toLowerCase();
                arena.className = '';
                if (name.includes('forest') || name.includes('viridian')) {
                    arena.classList.add('bg-route-forest');
                } else if (
                    name.includes('cave') ||
                    name.includes('tunnel') ||
                    name.includes('mt. moon') ||
                    name.includes('rock') ||
                    name.includes('victory road') ||
                    name.includes('dungeon')
                ) {
                    arena.classList.add('bg-route-cave');
                } else if (route['trainer']) {
                    arena.classList.add('bg-route-gym');
                } else {
                    arena.classList.add('bg-route-plain');
                }
            }
        }

        if (!poke) {
            container.style.display = 'none';
            if (id == 'enemy') {
                townBox.style.display = 'flex';
                let route = ROUTES[player.settings.currentRegionId][player.settings.currentRouteId];
                trainerButton.style.display = (route['trainer']) ? '' : 'none';
                trainerButton.innerHTML = (route['trainer']) ? '<i class="fa fa-shield"></i> ' + route['trainer']['name'] : '';
                
                this.renderTownBannerAndDescription(route);
            }
            return null;
        } else {
            container.style.display = 'block';
            if (id == 'enemy')
                townBox.style.display = 'none';
        }
        face = face || 'front';
        const pokeStatusAsText = (poke) => {
            let output = '';
            output += 'Attack Speed: ' + poke.attackSpeed()/1000 + '<br>';
            output += '\nAttack: ' + poke.avgAttack() + '<br>';
            output += '\nDefense: ' + poke.avgDefense() + '<br>';
            return output
        };
        const domElements  = {
            name: container.querySelector('.name'),
            img: container.querySelector('.img'),
            hp: container.querySelector('.hp'),
            hpBar: container.querySelector('.hpBar'),
            expBar: container.querySelector('.expBar'),
            exp: container.querySelector('.exp'),
            status: container.querySelector('.status')
        };
        const genderSymbol = poke.gender === 'female' 
            ? ' <span style="color:#f43f5e; font-weight:bold; font-size:11px; text-shadow:none;">♀</span>' 
            : ' <span style="color:#3b82f6; font-weight:bold; font-size:11px; text-shadow:none;">♂</span>';
        this.setValue(domElements.name, poke.pokeName() + ' (' + poke.level() + ')' + genderSymbol);
        this.setProp(domElements.img, 'src', poke.image()[face]);
        this.setValue(domElements.hp, poke.lifeAsText() + ' HP');
        this.setProp(domElements.hpBar, 'value', poke.getHp());
        this.setProp(domElements.hpBar, 'max', poke.maxHp());
        if (id === 'player') {
            const curExp = Math.floor(poke.currentExp() - poke.thisLevelExp());
            const maxExp = poke.nextLevelExp() - poke.thisLevelExp();
            this.setProp(domElements.expBar, 'value', curExp);
            this.setProp(domElements.expBar, 'max', maxExp);
            if (domElements.exp) {
                this.setValue(domElements.exp, curExp + ' / ' + maxExp + ' XP');
            }
            if (face === 'front') {
                container.classList.add('frontSprite');
            } else {
                container.classList.remove('frontSprite');
            }
        }
        if (id === 'enemy') {
            const gymLeaderBox = $('#gymLeaderBox');
            if (gymLeaderBox) {
                if (combatLoop.trainer) {
                    gymLeaderBox.style.display = 'block';
                    const trainerName = combatLoop.trainer.name;
                    $('#gymLeaderName').innerHTML = trainerName;
                    
                    let avatar = '👤';
                    if (trainerName.includes('Brock')) avatar = '🪨';
                    else if (trainerName.includes('Misty')) avatar = '💧';
                    else if (trainerName.includes('Lt. Surge')) avatar = '⚡';
                    else if (trainerName.includes('Erika')) avatar = '🌸';
                    else if (trainerName.includes('Koga')) avatar = '💨';
                    else if (trainerName.includes('Sabrina')) avatar = '👁️';
                    else if (trainerName.includes('Blaine')) avatar = '🔥';
                    else if (trainerName.includes('Giovanni')) avatar = '🕶️';
                    else if (trainerName.includes('Bugsy')) avatar = '🕸️';
                    else if (trainerName.includes('Whitney')) avatar = '🐄';
                    else if (trainerName.includes('Morty')) avatar = '👻';
                    else if (trainerName.includes('Chuck')) avatar = '🥋';
                    else if (trainerName.includes('Jasmine')) avatar = '🛡️';
                    else if (trainerName.includes('Pryce')) avatar = '❄️';
                    else if (trainerName.includes('Clair')) avatar = '🐉';
                    
                    $('#gymLeaderAvatar').innerHTML = avatar;
                    $('#gymLeaderTitle').innerHTML = combatLoop.trainer.badge ? 'Gym Leader' : 'Trainer';
                } else {
                    gymLeaderBox.style.display = 'none';
                }
            }
        }
        this.setValue(domElements.status, pokeStatusAsText(poke));
    },
    renderTownBannerAndDescription: function(route) {
        const townWelcome = document.getElementById('townWelcome');
        const townDescription = document.getElementById('townDescription');
        const townIllustration = document.getElementById('townIllustration');
        const townIllustrationOverlay = document.getElementById('townIllustrationOverlay');
        
        if (townWelcome) townWelcome.innerText = route.name;
        
        const descriptions = {
            'Pallet Town': 'A cozy, peaceful hamlet where your journey began. A quiet starting line.',
            'Viridian City': "A beautiful green city wrapped in nature's embrace, featuring the final gym.",
            'Pewter City': 'A solid, gray stone city nestled between high rocky mountains, home to Brock.',
            'Cerulean City': 'A mysterious floral city surrounded by cascading blue water, home to Misty.',
            'Vermilion City': "A bustling, sun-drenched southern harbor town. Watch the S.S. Anne set sail.",
            'Lavender Town': 'A quiet, somber village home to the legendary Pokémon Tower and spirits.',
            'Celadon City': 'A massive, vibrant shopping capital filled with neon lights, malls, and gyms.',
            'Saffron City': 'A high-tech golden metropolis hosting the Silph Co. headquarters.',
            'Fuchsia City': 'A tropical, wildlife-rich sanctuary that serves as entry to the Safari Zone.',
            'Cinnabar Island': 'A volcanic, rocky island built on top of a dormant geothermal pocket.',
            'New Bark Town': 'A fresh Johto harbor town where winds of new adventure blow.',
            'Cherrygrove City': 'A scenic coastal city with the sweet scent of cherry blossoms.',
            'Violet City': 'An ancient, historic town featuring pagodas, Sprout Tower, and Falkner.',
            'Azalea Town': 'A cozy charcoal-crafting village situated near the Slowpoke Well.',
            'Goldenrod City': "A mega metropolis with Johto's largest department store, train, and Whitney.",
            'Ecruteak City': "A traditional town rich with historic lore, pagodas, and Morti's ghosts.",
            'Olivine City': 'A coastal seaport town known for its lighthouse guiding sailors.',
            'Cianwood City': 'A remote, wind-swept beach city far out in the west sea.',
            'Mahogany Town': 'A mysterious village known for its hidden rocket labs and red lake.',
            'Blackthorn City': 'A rugged, high-mountain fortress where dragon tamers gather.'
        };
        
        const styleGradients = {
            'Pallet Town': { grad: 'linear-gradient(135deg, #15803d, #22c55e)', icon: '🏡' },
            'Viridian City': { grad: 'linear-gradient(135deg, #047857, #10b981)', icon: '🌲' },
            'Pewter City': { grad: 'linear-gradient(135deg, #374151, #6b7280)', icon: '🪨' },
            'Cerulean City': { grad: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', icon: '💧' },
            'Vermilion City': { grad: 'linear-gradient(135deg, #0369a1, #0ea5e9)', icon: '🚢' },
            'Lavender Town': { grad: 'linear-gradient(135deg, #581c87, #8b5cf6)', icon: '🪦' },
            'Celadon City': { grad: 'linear-gradient(135deg, #701a75, #d946ef)', icon: '🏬' },
            'Saffron City': { grad: 'linear-gradient(135deg, #0f172a, #334155)', icon: '🏙️' },
            'Fuchsia City': { grad: 'linear-gradient(135deg, #854d0e, #eab308)', icon: '🦁' },
            'Cinnabar Island': { grad: 'linear-gradient(135deg, #9a3412, #ea580c)', icon: '🌋' },
            'New Bark Town': { grad: 'linear-gradient(135deg, #0f766e, #14b8a6)', icon: '🏡' },
            'Cherrygrove City': { grad: 'linear-gradient(135deg, #be185d, #ec4899)', icon: '🌸' },
            'Violet City': { grad: 'linear-gradient(135deg, #a21caf, #e879f9)', icon: '🏯' },
            'Azalea Town': { grad: 'linear-gradient(135deg, #b45309, #f59e0b)', icon: '🪵' },
            'Goldenrod City': { grad: 'linear-gradient(135deg, #1e1b4b, #312e81)', icon: '🪙' },
            'Ecruteak City': { grad: 'linear-gradient(135deg, #7c2d12, #c2410c)', icon: '🍁' },
            'Olivine City': { grad: 'linear-gradient(135deg, #0284c7, #0ea5e9)', icon: '🚨' },
            'Cianwood City': { grad: 'linear-gradient(135deg, #0369a1, #0284c7)', icon: '🌊' },
            'Mahogany Town': { grad: 'linear-gradient(135deg, #991b1b, #dc2626)', icon: '❄️' },
            'Blackthorn City': { grad: 'linear-gradient(135deg, #312e81, #4338ca)', icon: '🐉' }
        };
        
        const desc = descriptions[route.name] || 'A welcoming settlement in the region. Rest up and train your Pokemon.';
        if (townDescription) townDescription.innerText = desc;
        
        if (townIllustration && townIllustrationOverlay) {
            const theme = styleGradients[route.name] || { grad: 'linear-gradient(135deg, #1e293b, #475569)', icon: '🏘️' };
            townIllustration.style.background = theme.grad;
            townIllustration.style.display = 'block';
            townIllustrationOverlay.innerText = theme.icon + ' ' + route.name;
        }
    },
    renderPokeDexSort: function() {
        let sortHTML = '<option value="all">All</option>';
        let showList = false;
        if (player.unlocked.completeDex) {
            sortHTML += '<option value="missing"' + (player.settings.dexView === 'missing' ? ' selected="true"' : '') + '>Missing</option>';
            showList = true;
        }
        if (player.unlocked.shinyDex) {
            sortHTML += '<option value="shiny"' + (player.settings.dexView === 'shiny' ? ' selected="true"' : '') + '>Shiny</option>';
            showList = true;
        }
        if (showList) {
            $('#dexView').innerHTML = sortHTML;
            $('#dexView').style.display = 'block';
        }
    },
    renderPokeDex: function() {
        const dexData = player.getPokedexData();
        const listElement = $('#dexList');
        
        // Optimize search with a Map/Object lookup
        const dexMap = {};
        for (let i = 0; i < dexData.length; i++) {
            const entry = dexData[i];
            dexMap[entry.name] = entry.flag;
        }

        // Optimize index lookup using a global cache
        if (!window.POKEDEX_NAME_MAP) {
            window.POKEDEX_NAME_MAP = {};
            for (let i = 0; i < POKEDEX.length; i++) {
                window.POKEDEX_NAME_MAP[POKEDEX[i].pokemon[0].Pokemon] = i;
            }
        }

        let listValue = '';
        let count = POKEDEX.length;
        if (player.settings.dexView === 'all') {
            let highestPoke = player.pokedexHighestID;
            if (highestPoke == 0) {
                highestPoke = player.getHighestPokeDex();
            }
            let highestID = player.findDexIndex(highestPoke);
            count = Math.min(POKEDEX.length, highestID + 5);
        }

        for(let y = 0; y < count; y++) {
            const name = POKEDEX[y].pokemon[0].Pokemon;
            let flag = dexMap[name] || POKEDEXFLAGS.unseen;
            
            if (player.settings.dexView == 'all' ||
                (player.settings.dexView == 'own' && (flag == POKEDEXFLAGS.ownNormal || flag == POKEDEXFLAGS.ownShiny)) ||
                (player.settings.dexView == 'owned' && (flag >= POKEDEXFLAGS.releasedNormal)) ||
                (player.settings.dexView == 'missing' && (flag != POKEDEXFLAGS.ownNormal && flag != POKEDEXFLAGS.ownShiny)) ||
                (player.settings.dexView == 'shiny' && (flag == POKEDEXFLAGS.ownShiny))) {
                
                let isShiny = (flag == POKEDEXFLAGS.seenShiny || flag == POKEDEXFLAGS.releasedShiny || flag == POKEDEXFLAGS.ownedShiny || flag == POKEDEXFLAGS.ownShiny);
                let imgSrc = isShiny ? POKEDEX[y].images.shiny.front : POKEDEX[y].images.normal.front;
                let formattedNum = String(y + 1).padStart(3, '0');
                
                if (flag === POKEDEXFLAGS.unseen) {
                    listValue += `
                        <li class="pokedex-item unseen">
                            <span class="dex-number">#${formattedNum}</span>
                            <img class="dex-image" src="${imgSrc}" alt="???" />
                            <div class="dex-name">???</div>
                        </li>
                    `;
                } else if (flag === POKEDEXFLAGS.seenNormal || flag === POKEDEXFLAGS.seenShiny) {
                    listValue += `
                        <li class="pokedex-item seen">
                            <span class="dex-number">#${formattedNum}</span>
                            <img class="dex-image" src="${imgSrc}" alt="${name}" />
                            <div class="dex-name">${name}</div>
                        </li>
                    `;
                } else {
                    let shinyClass = isShiny ? ' shiny' : '';
                    listValue += `
                        <li class="pokedex-item caught${shinyClass}">
                            <span class="dex-number">#${formattedNum}</span>
                            <img class="dex-image" src="${imgSrc}" alt="${name}" />
                            <div class="dex-name">${name}</div>
                            <span class="caught-indicator"><img src="assets/other/pokeball.png" style="width: 10px; height: 10px; object-fit: contain; vertical-align: middle;" /></span>
                        </li>
                    `;
                }
            }
        }
        this.setValue(listElement, listValue, false);
        this.renderPokeDexSort();
    },
    renderHeal: function(canHeal) {
        if (canHeal === true) {
            this.setValue(this.healElement, 'Heal!');
            combatLoop.pause();
            this.playHealingAnimation(() => {
                player.healAllPokemons();
                const active = player.activePoke();
                if (active) {
                    const moves = active.getMoves();
                    moves.forEach(m => m.currentPP = m.pp);
                }
                combatLoop.unpause();
                renderView(dom, enemy, player, false);
                dom.renderPokeList(false);
            });
        }
        if (typeof canHeal === 'number') {
            this.setValue(this.healElement, 'Heal: ' + Math.floor(((canHeal/30000)*100)) + '%')
        }
    },
    pokeStatus: function(poke) {
        if (poke.alive()) {
            if (poke === player.activePoke()) {
                if (poke.shiny()) {
                    return 'activeShiny';
                } else {
                    return 'activeNormal';
                }
            } else {
                if (poke.shiny()) {
                    return 'inactiveShiny';
                } else {
                    return 'inactiveNormal';
                }
            }
        } else {
            return 'dead';
        }
    },
    renderPokeSort: function() {
        $('#autoSort').checked = player.settings.autoSort;
        if (player.settings.autoSort) {
            $('#pokeSortOrderSelect').style.display = 'inline';
            $('#pokeSortDirSelect').style.display = 'inline';
        } else {
            $('#pokeSortOrderSelect').style.display = 'none';
            $('#pokeSortDirSelect').style.display = 'none';
        }
    },
    renderPokeList: function(purge = true) {
        const list = player.getPokemon();
        const listElement = $('#rosterList');
        const deleteEnabled = $('#enableDelete').checked;
        listElement.className = 'list' + (deleteEnabled ? ' manageTeamEnabled' : '');
        let listElementsToAdd = '';
        list.forEach((poke, index) => {
            const listItemElement = listElement.querySelector('#listPoke' + index);
            
            // Build elements type badges
            const types = poke.types();
            let typeBadgesHTML = '';
            if (types && Array.isArray(types)) {
                types.forEach(t => {
                    typeBadgesHTML += `<span class="type-badge ${t.toLowerCase()}">${t}</span>`;
                });
            }

            // Life progress math
            const maxHp = poke.maxHp();
            const curHp = poke.getHp();
            const hpPercent = Math.max(0, Math.min(100, (curHp / maxHp) * 100));
            
            // Exp progress math
            const nextLvlExp = poke.nextLevelExp();
            const thisLvlExp = poke.thisLevelExp();
            const curExp = poke.currentExp();
            const expProgress = curExp - thisLvlExp;
            const expNeeded = nextLvlExp - thisLvlExp;
            const expPercent = Math.max(0, Math.min(100, (expProgress / (expNeeded || 1)) * 100));

            const isFainted = !poke.alive();
            const pokeStatus = isFainted ? 'dead' : (poke === player.activePoke() ? 'activeNormal' : 'normal');

            // Modern Roster Card Inner HTML
            const cardContentHTML = `
                <div class="roster-card-content" onclick="userInteractions.changePokemon(${index})">
                    <div class="roster-card-image">
                        <img src="${poke.image()['front']}" alt="${poke.pokeName()}">
                    </div>
                    <div class="roster-card-info">
                        <div class="roster-card-title-row">
                            <span class="roster-card-name">${poke.pokeName()}<span class="roster-card-level">Lv${poke.level()}</span></span>
                            <div style="display: flex; gap: 3px;">${typeBadgesHTML}</div>
                        </div>
                        <div class="roster-card-meters">
                            <div>
                                <div class="card-progress-text">
                                    <span>HP</span>
                                    <span>${Math.max(0, curHp)}/${maxHp}</span>
                                </div>
                                <div class="card-progress-bar">
                                    <div class="card-progress-fill hp" style="width: ${hpPercent}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="card-progress-text">
                                    <span>EXP</span>
                                    <span>${Math.floor(expPercent)}%</span>
                                </div>
                                <div class="card-progress-bar">
                                    <div class="card-progress-fill exp" style="width: ${expPercent}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <a href="#" onclick="userInteractions.deletePokemon(event, ${index});return false" class="pokeDeleteButton">X</a>
                <button onclick="userInteractions.moveToStorage(${index})" class="toStorageButton">PC</button>
                ${poke.canEvolve() ? `<button onclick="userInteractions.evolvePokemon(${index})" class="pokeEvolveButton">Evolve</button>` : ''}
            `;
            
            if (listItemElement) {
                let hasChanged = (listItemElement.getAttribute('data-level') !== String(poke.level())) || (listItemElement.getAttribute('status') !== pokeStatus);
                listItemElement.setAttribute('status', pokeStatus);
                listItemElement.setAttribute('data-level', poke.level());
                listItemElement.className = 'listPoke draggable-poke-item';
                listItemElement.innerHTML = cardContentHTML;
                
                // Add dragging capabilities to updated elements
                listItemElement.setAttribute('draggable', 'true');
                listItemElement.setAttribute('ondragstart', `userInteractions.dragPoke(event, 'roster', ${index})`);
                listItemElement.setAttribute('ondragover', `userInteractions.allowDrop(event)`);
                listItemElement.setAttribute('ondragenter', `userInteractions.dragEnter(event)`);
                listItemElement.setAttribute('ondragleave', `userInteractions.dragLeave(event)`);
                listItemElement.setAttribute('ondrop', `userInteractions.dropPoke(event, 'roster', ${index})`);

                if (!purge && hasChanged) {
                    flash(listItemElement);
                }
            } else {
                listElementsToAdd += `<li id="listPoke${index}" class="listPoke draggable-poke-item" draggable="true" ` +
                    `status="${pokeStatus}" data-level="${poke.level()}" ` +
                    `ondragstart="userInteractions.dragPoke(event, 'roster', ${index})" ` +
                    `ondragover="userInteractions.allowDrop(event)" ` +
                    `ondragenter="userInteractions.dragEnter(event)" ` +
                    `ondragleave="userInteractions.dragLeave(event)" ` +
                    `ondrop="userInteractions.dropPoke(event, 'roster', ${index})">` +
                    cardContentHTML +
                    `</li>`
            }
        });
        if (listElementsToAdd.length > 0) {
            this.setValue(listElement, listElementsToAdd, true)
        }
        let i = list.length;
        let listItemToRemove;
        while (listItemToRemove = listElement.querySelector('#listPoke' + i)) {
            listElement.removeChild(listItemToRemove);
            i++
        }
    },
    renderStorage: function() {
        const list = player.storage;
        const listElement = $('#storageList');
        let listElementsToAdd = '';
        list.forEach((poke, index) => {
            const listItemElement = listElement.querySelector('#storagePoke' + index);
            
            const types = poke.types();
            let typeBadgesHTML = '';
            if (types && Array.isArray(types)) {
                types.forEach(t => {
                    typeBadgesHTML += `<span class="type-badge ${t.toLowerCase()}" style="font-size: 7px; padding: 1px 4px;">${t}</span>`;
                });
            }

            const isFainted = !poke.alive();
            const pokeStatus = isFainted ? 'dead' : 'normal';

            const cardContentHTML = `
                <div class="roster-card-content" style="cursor: default;">
                    <div class="roster-card-image" style="width: 38px; height: 38px;">
                        <img src="${poke.image()['front']}" style="width: 32px; height: 32px;" alt="${poke.pokeName()}">
                    </div>
                    <div class="roster-card-info" style="gap: 2px;">
                        <div class="roster-card-title-row">
                            <span class="roster-card-name" style="font-size: 11px;">${poke.pokeName()}<span class="roster-card-level">Lv${poke.level()}</span></span>
                            <div style="display: flex; gap: 2px;">${typeBadgesHTML}</div>
                        </div>
                    </div>
                </div>
                <a href="#" onclick="userInteractions.deletePokemon(event, ${index}, 'storage');return false" class="pokeDeleteButton">X</a>
                <button onclick="userInteractions.moveToRoster(${index})" class="toStorageButton">Active</button>
            `;

            if (listItemElement) {
                listItemElement.setAttribute('status', pokeStatus);
                listItemElement.className = 'draggable-poke-item listPoke'; // Keep listPoke styling
                listItemElement.innerHTML = cardContentHTML;
                
                // Add dragging capabilities to updated elements
                listItemElement.setAttribute('draggable', 'true');
                listItemElement.setAttribute('ondragstart', `userInteractions.dragPoke(event, 'storage', ${index})`);
                listItemElement.setAttribute('ondragover', `userInteractions.allowDrop(event)`);
                listItemElement.setAttribute('ondragenter', `userInteractions.dragEnter(event)`);
                listItemElement.setAttribute('ondragleave', `userInteractions.dragLeave(event)`);
                listItemElement.setAttribute('ondrop', `userInteractions.dropPoke(event, 'storage', ${index})`);
            } else {
                listElementsToAdd += `<li id="storagePoke${index}" class="draggable-poke-item listPoke" draggable="true" ` +
                    `status="${pokeStatus}" style="padding: 6px 10px;" ` +
                    `ondragstart="userInteractions.dragPoke(event, 'storage', ${index})" ` +
                    `ondragover="userInteractions.allowDrop(event)" ` +
                    `ondragenter="userInteractions.dragEnter(event)" ` +
                    `ondragleave="userInteractions.dragLeave(event)" ` +
                    `ondrop="userInteractions.dropPoke(event, 'storage', ${index})">` +
                    cardContentHTML +
                    `</li>`
            }
        });
        if (listElementsToAdd.length > 0) {
            this.setValue(listElement, listElementsToAdd, true);
        }
        let i = list.length;
        let listItemToRemove;
        while (listItemToRemove = listElement.querySelector('#storagePoke' + i)) {
            listElement.removeChild(listItemToRemove);
            i++
        }
        if (list.length == 0) {
            this.setValue(listElement, '<li>Your storage is cold and empty</li>');
        }
    },
    renderRegionSelect: function() {
        let selectHTML = '';
        let count = 0;
        for (let region in ROUTES) {
            if (player.regionUnlocked(region)) {
                selectHTML += '<option value="' + region + '"' + (player.settings.currentRegionId === region ? ' selected="true"' : '') + '>' + region + '</option>';
                count++;
            }
        }
        if (count > 1) {
            $('#regionSelect').innerHTML = selectHTML;
            $('#regionSelect').style.display = 'block';
        }
    },
    renderRouteList: function() {
        this.renderRegionSelect();
        const routes = ROUTES[player.settings.currentRegionId];
        const listElement = $('#routeList');
        $('#regionSelect').value = player.settings.currentRegionId;
        
        // Update the visual map preview image, label, and interactive pins dynamically
        const mapContainer = $('#worldMapContainer');
        const mapImg = $('#activeMapImage');
        const mapLabel = $('#activeMapLabel');
        const pinsContainer = $('#mapPins');
        
        if (mapContainer && mapImg && mapLabel && pinsContainer) {
            const region = player.settings.currentRegionId;
            mapLabel.innerText = region + ' Region';
            pinsContainer.innerHTML = ''; // Clear existing pins
            
            let hasMap = false;
            let mapFile = '';
            if (region.toLowerCase() === 'kanto') {
                hasMap = true;
                mapFile = 'assets/kanto_realistic_map.png';
            } else if (region.toLowerCase() === 'johto') {
                hasMap = true;
                mapFile = 'assets/johto_neon_map.png';
            }
            
            if (hasMap) {
                mapContainer.style.display = 'block';
                if (mapImg.getAttribute('src') !== mapFile) {
                    mapImg.src = mapFile;
                }
                
                const regionCoords = MAP_COORDINATES[region];
                if (regionCoords) {
                    Object.keys(routes).forEach((routeId) => {
                        if (routeId !== '_unlock' && routeId !== '_global') {
                            const route = routes[routeId];
                            const unlocked = player.routeUnlocked(region, routeId);
                            const isCurrent = (routeId === player.settings.currentRouteId);
                            const coords = regionCoords[routeId];
                            
                            if (coords) {
                                const pin = document.createElement('div');
                                if (isCurrent) {
                                    pin.className = 'map-pin active-trainer';
                                } else {
                                    pin.className = 'map-pin' + (!unlocked ? ' locked' : '');
                                }
                                pin.style.left = `${coords.x}%`;
                                pin.style.top = `${coords.y}%`;
                                
                                const levelText = route.town ? 'Town' : `Lv ${route.minLevel}~${route.maxLevel}`;
                                
                                // Rich custom tooltip
                                const tooltip = document.createElement('div');
                                tooltip.className = 'map-pin-tooltip';
                                tooltip.innerHTML = `<strong>${route.name}</strong><br><span style="color:var(--accent); font-size:7px;">${levelText}</span>`;
                                pin.appendChild(tooltip);
                                
                                if (unlocked) {
                                    pin.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        userInteractions.changeRoute(routeId);
                                    });
                                }
                                pinsContainer.appendChild(pin);
                            }
                        }
                    });
                }
            } else {
                mapContainer.style.display = 'none';
            }
        }

        this.setValue(listElement, '');
        Object.keys(routes).forEach((routeId) => {
            if (routeId !== '_unlock' && routeId !== '_global') {
                const route = routes[routeId];
                const unlocked = player.routeUnlocked(player.settings.currentRegionId, routeId);
                const routeOnClick = (unlocked) ? 'userInteractions.changeRoute(\'' + routeId + '\')' : '';
                let routeColor, routeWeight;
                if (unlocked) {
                    routeColor = (routeId === player.settings.currentRouteId) ? COLORS.route.current : COLORS.route.unlocked;
                    routeWeight = (routeId === player.settings.currentRouteId) ? 'bold' : 'normal';
                } else {
                    routeColor = COLORS.route.locked;
                    routeWeight = 'normal';
                }
                const routeLevels = (!route.town) ? ' (' + route.minLevel + '~' + route.maxLevel + ')' : '';
                const routeHTML = '<li><a href="#" onclick="' + routeOnClick + ';return false;" style="color: ' + routeColor + '; font-weight: ' + routeWeight + ';" >' + route.name + routeLevels + '</a></li>';
                this.setValue(listElement, routeHTML, true);
            }
        });
    },
    renderListBox: function() {
        const routes = $('#routesBox');
        const roster = $('#rosterBox');
        const pokeDex = $('#pokedexBox');
        const storage = $('#storageBox');
        // hide all by default
        routes.style.display = 'none';
        roster.style.display = 'none';
        pokeDex.style.display = 'none';
        storage.style.display = 'none';
        // which is showing
        if (player.settings.listView === 'routes') {
            routes.style.display = 'block';
            this.renderRouteList();
        } else if (player.settings.listView === 'pokeDex') {
            pokeDex.style.display = 'block';
            this.renderPokeDex();
        } else if (player.settings.listView === 'storage') {
            storage.style.display = 'block';
            this.renderStorage();
        } else {
            roster.style.display = 'block';
            this.renderPokeList();

        }
    },
    checkConfirmed: function(id) {
        return $(id).checked
    },
    attackAnimation: function(id, direction) {
        const toAnimate = $('#' + id);
        toAnimate.classList = 'img attacked-' + direction;
        window.setTimeout(() => toAnimate.classList = 'img', 80)
    },
    gameConsoleLog: function(text, color) {
        if ($('#enableConsole').checked) {
            const entry = color 
                ? '<span style="color:' + color + ';">' + text + '</span>' 
                : '<span>' + text + '</span>';
            this.logElement.innerHTML += entry + '<br>';
        }
        const logAsArray = this.logElement.innerHTML.split('<br>');
        if (logAsArray.length >= 100) {
            logAsArray.shift(); // Remove the oldest log from the top
            this.logElement.innerHTML = logAsArray.join('<br>')
        }
        // Auto scroll to bottom
        const consoleContainer = $('#console');
        if (consoleContainer) {
            consoleContainer.scrollTop = consoleContainer.scrollHeight;
        }
    },
    gameConsoleClear: function() {
        this.logElement.innerHTML = ''
    },
    renderBalls: function() {
        Object.keys(player.ballsAmount).forEach(ballType => {
            $('.ball-ammount.' + ballType).innerHTML = player.ballsAmount[ballType];
        })
    },
    renderCurrency: function() {
        const currencyElement = $('#currency');
        currencyElement.innerHTML = '¤' + player.currency;
        flash(currencyElement);
    },
    refreshCatchOption: function(setCatchOption) {
        $(`#enableCatchNew`).checked = false;
        $(`#enableCatchAll`).checked = false;
        if (setCatchOption === 'new') {
            $(`#enableCatchNew`).checked = true;
        } else if (setCatchOption === 'all') {
            $(`#enableCatchAll`).checked = true;
        }
        userInteractions.changeCatchOption(setCatchOption);
    },
    showPopup: function(message) {
        $('#modalPopup').style.display = 'flex';
        $('#modalPopup #popupText').innerText = message;
        setTimeout(this.hidePopup, 2000);
    },
    hidePopup: function() {
        $('#modalPopup').style.display = 'none';
        $('#modalPopup #popupText').innerText = '';
    },
    bindEvents: function() {
        $('#enableDelete').addEventListener( 'click', () => {
            userInteractions.enablePokeListDelete();
        });
        $('#autoSort').addEventListener( 'click', () => {
            userInteractions.enablePokeListAutoSort();
        });
        $('#viewRoutes').addEventListener( 'click', () => {
            userInteractions.changeListView('routes');
        });
        $('#viewRoster').addEventListener( 'click', () => {
            userInteractions.changeListView('roster');
        });
        $('#viewPokeDex').addEventListener( 'click', () => {
            userInteractions.changeListView('pokeDex');
        });
        $('#viewStorage').addEventListener( 'click', () => {
            userInteractions.changeListView('storage');
        });

        $('#dexView').addEventListener( 'change'
            , () => { userInteractions.changeDexView() }
        );

        $(`#enableCatchAll`).addEventListener( 'click'
            , () => {
                let setCatchSetting;
                if ($(`#enableCatchAll`).checked) {
                    $(`#enableCatchNew`).checked = false;
                    setCatchSetting = 'all';
                } else {
                    setCatchSetting = false;
                }
                player.settings.catching = setCatchSetting;
                userInteractions.changeCatchOption(setCatchSetting);
            }
        );

        $(`#enableCatchNew`).addEventListener( 'click'
            , () => {
                let setCatchSetting;
                if ($(`#enableCatchNew`).checked) {
                    $(`#enableCatchAll`).checked = false;
                    setCatchSetting = 'new';
                } else {
                    setCatchSetting = false;
                }
                player.settings.catching = setCatchSetting;
                userInteractions.changeCatchOption(setCatchSetting);
            }
        );

        $(`#saveDialogContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#saveDialogContainer`) && ($(`#saveDialogContainer`).style.display = 'none'); }
        );

        $(`#inventoryContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#inventoryContainer`) && ($(`#inventoryContainer`).style.display = 'none'); }
        );

        $(`#statisticsContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#statisticsContainer`) && ($(`#statisticsContainer`).style.display = 'none'); }
        );

        $(`#settingsContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#settingsContainer`) && ($(`#settingsContainer`).style.display = 'none'); }
        );

        $(`#achievementsContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#achievementsContainer`) && ($(`#achievementsContainer`).style.display = 'none'); }
        );

        $(`#townContainer`).addEventListener( 'click'
            , (event) => { event.target === $(`#townContainer`) && ($(`#townContainer`).style.display = 'none'); }
        );

        window.addEventListener('beforeunload', () => {
            if (!player.purgeData)
                player.savePokes(true);
        });
    },
    
    renderQuest: function() {
        if (typeof QuestManager === 'undefined') return;
        const quest = QuestManager.getActiveQuest();
        const questBox = $('#questBox');
        if (!questBox) return;
        
        if (!quest) {
            $('#questTitle').innerHTML = "All Quests Cleared!";
            $('#questDesc').innerHTML = "You've completed all available quests! More coming soon.";
            $('#questProgressText').innerHTML = "100%";
            $('#questProgressBar').value = 100;
            $('#questProgressBar').max = 100;
            $('#questReward').innerHTML = "";
            return;
        }
        
        $('#questTitle').innerHTML = quest.name;
        $('#questDesc').innerHTML = quest.description;
        
        const progText = QuestManager.getProgressText();
        $('#questProgressText').innerHTML = progText;
        
        if (quest.targetType === "defeat" || quest.targetType === "catch") {
            $('#questProgressBar').value = player.settings.activeQuestProgress;
            $('#questProgressBar').max = quest.targetCount;
        } else if (quest.targetType === "level") {
            const maxLvl = Math.max(...player.getPokemon().map(p => p.level()));
            $('#questProgressBar').value = maxLvl;
            $('#questProgressBar').max = quest.targetLevel;
        } else {
            $('#questProgressBar').value = 0;
            $('#questProgressBar').max = 1;
        }
        
        $('#questReward').innerHTML = "Reward: " + quest.rewardText;
    },
    
    renderMoves: function() {
        const activePoke = player.activePoke();
        const movePlate = $('#movePlate');
        if (!movePlate || !activePoke) return;
        
        const moves = activePoke.getMoves();
        const buttons = movePlate.querySelectorAll('.move-btn');
        
        const TYPE_COLORS = {
            fire: '#f97316',
            water: '#3b82f6',
            grass: '#22c55e',
            electric: '#eab308',
            normal: '#a1a1aa',
            flying: '#a855f7',
            poison: '#a855f7',
            psychic: '#ec4899',
            bug: '#84cc16',
            rock: '#a1a1aa',
            ground: '#eab308',
            ice: '#06b6d4',
            ghost: '#6366f1',
            dragon: '#6366f1',
            steel: '#94a3b8',
            fighting: '#b91c1c',
            dark: '#475569',
            fairy: '#f472b6'
        };
        
        buttons.forEach((btn, idx) => {
            const move = moves[idx];
            if (move) {
                btn.disabled = false;
                const typeClass = move.type ? `move-${move.type.toLowerCase()}` : '';
                btn.className = `move-btn ${typeClass}`;
                btn.style.borderColor = ''; // reset inline style to let CSS handle it
                btn.querySelector('.move-name').innerHTML = move.name;
                btn.querySelector('.move-name').style.color = ''; // let CSS handle color
                btn.querySelector('.move-info').innerHTML = `Pow: ${move.power || '-'} | PP: ${move.currentPP}/${move.pp}`;
            } else {
                btn.disabled = true;
                btn.className = 'move-btn';
                btn.style.borderColor = '#27272a';
                btn.querySelector('.move-name').innerHTML = "---";
                btn.querySelector('.move-info').innerHTML = "Power: -- | PP: --";
            }
        });
    },
    
    playHealingAnimation: function(callback) {
        const overlay = $('#healOverlay');
        if (!overlay) {
            if (callback) callback();
            return;
        }
        
        overlay.style.display = 'flex';
        const slots = [];
        for (let i = 0; i < 6; i++) {
            const slot = document.getElementById('slot' + i);
            if (slot) {
                slot.className = 'ball-slot';
                slots.push(slot);
            }
        }
        
        if (typeof Sound !== 'undefined' && Sound.playHealTune) {
            Sound.playHealTune();
        }
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < slots.length) {
                slots[index].classList.add('lit');
                index++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.style.display = 'none';
                    if (callback) callback();
                }, 800);
            }
        }, 220);
    },
    
    renderSpeedControls: function() {
        const speed = player.settings.battleSpeed || 'slow';
        const buttons = {
            fast: $('#speed1x'),
            normal: $('#speed2x'),
            slow: $('#speed5x')
        };
        
        Object.keys(buttons).forEach(key => {
            const btn = buttons[key];
            if (btn) {
                if (speed === key) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    },
    
    renderTrainerCard: function() {
        const badgeCount = Object.keys(player.badges || {}).filter(b => player.badges[b]).length;
        $('#cardBadgeCount').innerHTML = badgeCount;
        $('#cardMoney').innerHTML = '¤' + player.currency;
        $('#cardWildVictories').innerHTML = player.statistics.wildBeaten || 0;
        $('#cardTrainerVictories').innerHTML = player.statistics.trainerBeaten || 0;
        $('#cardCaughtCount').innerHTML = player.countPokedex(POKEDEXFLAGS.releasedNormal);
        $('#cardSeenCount').innerHTML = player.statistics.seen || 0;
        $('#cardShinyCount').innerHTML = player.statistics.shinyCaught || 0;
        
        let sumLevels = 0;
        player.pokemons.forEach(p => sumLevels += p.level());
        player.storage.forEach(p => sumLevels += p.level());
        $('#cardSumLevels').innerHTML = sumLevels;
        
        const badgeMapping = {
            'Brock': 'Boulder Badge',
            'Misty': 'Cascade Badge',
            'Lt. Surge': 'Thunder Badge',
            'Erika': 'Rainbow Badge',
            'Koga': 'Soul Badge',
            'Sabrina': 'Marsh Badge',
            'Blaine': 'Volcano Badge',
            'Giovanni': 'Earth Badge'
        };
        
        Object.keys(badgeMapping).forEach(leader => {
            const badgeName = badgeMapping[leader];
            const badgeEl = document.getElementById('badge-' + leader);
            if (badgeEl) {
                if (player.badges[badgeName]) {
                    badgeEl.classList.add('unlocked');
                } else {
                    badgeEl.classList.remove('unlocked');
                }
            }
        });
        
        const recentList = $('#cardRecentBattles');
        if (recentList) {
            recentList.innerHTML = '';
            const history = player.settings.recentBattles || [];
            if (history.length === 0) {
                recentList.innerHTML = '<li>No recent battles.</li>';
            } else {
                [...history].reverse().forEach(b => {
                    const dateObj = new Date(b.time);
                    const formattedDate = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });
                    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const shinyText = b.shiny ? '<span class="shiny-badge">★ SHINY</span> ' : '';
                    const typeText = b.isTrainer ? 'TRAINER' : 'WILD';
                    recentList.innerHTML += `
                        <li class="recent-battle-item" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div>
                                <span style="font-weight: bold; color: #fff;">${shinyText}${b.name}</span>
                                <span style="color: var(--text-secondary); margin-left: 4px;">· Lv ${b.level}</span>
                                <div style="font-size: 9px; color: var(--text-secondary); margin-top: 2px;">Route ${b.route || player.settings.currentRouteId} · ${formattedDate}, ${formattedTime}</div>
                            </div>
                            <span style="font-size: 8px; font-weight: bold; color: ${b.isTrainer ? '#3b82f6' : '#a1a1aa'}; letter-spacing: 0.5px;">${typeText}</span>
                        </li>
                    `;
                });
            }
        }
    },
    
    renderManageMoves: function() {
        const activePoke = player.activePoke();
        if (!activePoke) return;
        
        $('#manageMovesPokeName').innerHTML = `${activePoke.pokeName()} — Lv. ${activePoke.level()}`;
        
        const temp = userInteractions.tempEquippedMoves || [];
        $('#manageMovesEquippedCount').innerHTML = temp.length;
        
        const equippedList = $('#manageMovesEquippedList');
        equippedList.innerHTML = '';
        
        const TYPE_COLORS = {
            fire: '#f97316', water: '#3b82f6', grass: '#22c55e', electric: '#eab308',
            normal: '#a1a1aa', flying: '#a855f7', poison: '#a855f7', psychic: '#ec4899',
            bug: '#84cc16', rock: '#a1a1aa', ground: '#eab308', ice: '#06b6d4',
            ghost: '#6366f1', dragon: '#6366f1', steel: '#94a3b8', fighting: '#b91c1c',
            dark: '#475569', fairy: '#f472b6'
        };
        
        if (temp.length === 0) {
            equippedList.innerHTML = '<li style="font-size:9px; color:var(--text-secondary); text-align:center;">No moves equipped. Click below to add.</li>';
        } else {
            temp.forEach((moveName, idx) => {
                const types = activePoke.types();
                const primaryType = (types[0] || 'normal').toLowerCase();
                const movePool = TYPE_MOVES[primaryType] || TYPE_MOVES.normal;
                const m = movePool.find(x => x.name === moveName) || TYPE_MOVES.normal.find(x => x.name === moveName) || { name: moveName, power: 40, type: 'normal', pp: 35 };
                
                const typeColor = TYPE_COLORS[m.type] || '#3f3f46';
                
                equippedList.innerHTML += `
                    <li class="move-manage-item" style="border-color: ${typeColor}; padding: 6px 12px; margin-bottom: 4px;">
                        <div class="move-manage-info">
                            <span class="move-manage-name" style="color: ${typeColor};">${m.name}</span>
                            <span class="move-manage-sub">Power: ${m.power || '-'} | PP: ${m.pp}</span>
                        </div>
                        <div class="move-manage-controls">
                            <button class="move-manage-btn" onclick="userInteractions.reorderMove(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>▲</button>
                            <button class="move-manage-btn" onclick="userInteractions.reorderMove(${idx}, 1)" ${idx === temp.length - 1 ? 'disabled' : ''}>▼</button>
                            <button class="move-manage-btn" onclick="userInteractions.removeTempMove(${idx})" style="color: #ef4444; border-color: rgba(239,68,68,0.25);">×</button>
                        </div>
                    </li>
                `;
            });
        }
        
        const availableList = $('#manageMovesAvailableList');
        availableList.innerHTML = '';
        
        const types = activePoke.types();
        const primaryType = (types[0] || 'normal').toLowerCase();
        let movePool = TYPE_MOVES[primaryType] || TYPE_MOVES.normal;
        const currentLvl = activePoke.level();
        
        let allUnlocked = [];
        movePool.forEach(m => {
            if (m.level <= currentLvl && !allUnlocked.some(x => x.name === m.name)) {
                allUnlocked.push(m);
            }
        });
        TYPE_MOVES.normal.forEach(m => {
            if (m.level <= currentLvl && !allUnlocked.some(x => x.name === m.name)) {
                allUnlocked.push(m);
            }
        });
        
        allUnlocked.sort((a, b) => b.level - a.level);
        
        allUnlocked.forEach(m => {
            const isEquipped = temp.includes(m.name);
            const typeColor = TYPE_COLORS[m.type] || '#3f3f46';
            
            availableList.innerHTML += `
                <div class="move-manage-item" style="border-color: ${isEquipped ? 'var(--border-color)' : typeColor}; opacity: ${isEquipped ? 0.5 : 1}; padding: 6px 12px; margin-bottom: 4px;">
                    <div class="move-manage-info">
                        <span class="move-manage-name" style="color: ${typeColor};">${m.name}</span>
                        <span class="move-manage-sub">Power: ${m.power || '-'} | PP: ${m.pp} | Lv. ${m.level}</span>
                    </div>
                    <div>
                        <button class="move-manage-btn" onclick="userInteractions.addTempMove('${m.name}')" ${isEquipped || temp.length >= 4 ? 'disabled' : ''} style="${isEquipped ? '' : 'color: var(--accent); border-color: rgba(255,203,5,0.25);'}">+</button>
                    </div>
                </div>
            `;
        });
    }
};

const renderView = (dom, enemy, player, purge = true) => {
    dom.renderPokeOnContainer('enemy', enemy.activePoke());
    dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
    dom.renderQuest();
    if (player.activePoke()) {
        dom.renderMoves();
    }
    dom.renderSpeedControls();
};