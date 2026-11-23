const UserActions = {
    changeRoute: function(newRouteId, force = false) {
        if (!force && player.alivePokeIndexes().length == 0) {
            dom.gameConsoleLog('It is too dangerous to travel without a pokemon.', 'red');
            return false;
        }
        if (combatLoop.trainer) {
            dom.gameConsoleLog('You cannot run away from a trainer battle.', 'red');
            return false;
        }
        if (!player.routeUnlocked(player.settings.currentRegionId, newRouteId)) {
            dom.gameConsoleLog('You cannot do that yet.', 'red');
            return false;
        }
        player.settings.currentRouteId = newRouteId;
        if (ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['town']) {
            combatLoop.pause();
        } else {
            combatLoop.unpause();
        }
        renderView(dom, enemy, player);
        player.savePokes();
        dom.renderRouteList();
    },
    changePokemon: function(newActiveIndex) {
        player.setActive(newActiveIndex);
        combatLoop.changePlayerPoke(player.activePoke());
        renderView(dom, enemy, player)
    },
    deletePokemon: function(event, index, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        if (event.shiftKey) {
            // you must keep at least one active pokemon
            if (from !== 'roster' || pokeList.length > 1) {
                const pokemon = pokeList[index];
                player.deletePoke(index, from);
                const hasPoke = player.hasPokemon(pokemon.pokeName(), pokemon.shiny());
                if (!hasPoke) {
                    player.addPokedex(pokemon.pokeName(), (pokemon.shiny() ? POKEDEXFLAGS.releasedShiny : POKEDEXFLAGS.releasedNormal));
                }
                if (from === 'roster') {
                    combatLoop.changePlayerPoke(player.activePoke());
                    renderView(dom, enemy, player);
                } else {
                    dom.renderStorage();
                }
                player.savePokes();
                if (pokemon.shiny()) {
                    player.settings.releasedShiny++;
                } else {
                    player.settings.releasedNormal++;
                }
            } else {
                dom.showPopup('You must have one active pokemon!');
            }
        } else {
            alert('Hold shift while clicking the X to release a pokemon');
        }
    },
    changeRegion: function() {
        const regionSelect = document.getElementById('regionSelect');
        const regionId = regionSelect.options[regionSelect.selectedIndex].value;
        if (player.regionUnlocked(regionId)) {
            player.settings.currentRegionId = regionId;
            if (Object.keys(ROUTES[player.settings.currentRegionId])[0].charAt(0) !== '_') {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[0]);
            } else if (Object.keys(ROUTES[player.settings.currentRegionId])[1].charAt(0) !== '_') {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[1]);
            } else {
                this.changeRoute(Object.keys(ROUTES[player.settings.currentRegionId])[2]);
            }
        }
        return false;
    },
    enablePokeListDelete: function() {
        player.settings.listView = 'roster';
        dom.renderListBox();
    },
    enablePokeListAutoSort: function() {
        player.settings.autoSort = $('#autoSort').checked;
        // hide or show sort dropdowns
        dom.renderPokeSort();
        dom.renderListBox();
    },
    changeDexView: function() {
        const regionSelect = document.getElementById('dexView');
        player.settings.dexView = regionSelect.options[regionSelect.selectedIndex].value;
        dom.renderPokeDex();
    },
    changeCatchOption: function(newCatchOption) {
        combatLoop.changeCatch(newCatchOption)
    },
    changeListView: function(view) {
        player.settings.listView = view;
        dom.renderListBox();
    },
    clearGameData: function() {
        if (dom.checkConfirmed('#confirmClearData')) {
            localStorage.clear();
            player.purgeData = true;
            window.location.reload(true);
        }
    },
    clearConsole: function() {
        dom.gameConsoleClear();
    },
    changeSelectedBall: function(newBall) {
        player.changeSelectedBall(newBall)
    },
    pokemonToFirst: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToFirst = (index, arr) => {
            arr.splice(0, 0, arr.splice(index, 1)[0])
        };

        moveToFirst(pokemonIndex, pokeList);
        player.savePokes();
        if (from === 'roster') {
            combatLoop.changePlayerPoke(player.activePoke());
            dom.renderPokeList();
        } else {
            dom.renderStorage();
        }
    },
    pokemonToDown: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToDown = index => arr => [
            ...arr.slice(0,parseInt(index)),
            arr[parseInt(index)+1],
            arr[parseInt(index)],
            ...arr.slice(parseInt(index)+2)
        ];
        if (pokeList[pokemonIndex + 1]) {
            const newPokemonList = moveToDown(pokemonIndex)(pokeList);
            player.reorderPokes(newPokemonList, from);
            if (from === 'roster') {
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
                dom.renderStorage();
            }
            player.savePokes();
        }
    },
    pokemonToUp: function(pokemonIndex, from = 'roster') {
        const pokeList = (from === 'roster') ? player.getPokemon() : player.storage;
        const moveToUp = index => arr => [
            ...arr.slice(0,parseInt(index)-1),
            arr[parseInt(index)],
            arr[parseInt(index)-1],
            ...arr.slice(parseInt(index)+1)
        ];
        if (pokeList[pokemonIndex - 1]) {
            const newPokemonList = moveToUp(pokemonIndex)(pokeList);
            player.reorderPokes(newPokemonList, from);
            if (from === 'roster') {
                combatLoop.changePlayerPoke(player.activePoke());
                dom.renderPokeList();
            } else {
                dom.renderStorage();
            }
            player.savePokes();
        }
    },
    evolvePokemon: function(pokemonIndex) {
        player.getPokemon()[pokemonIndex].tryEvolve(player.getPokemon()[pokemonIndex].shiny());
        renderView(dom, enemy, player);
    },
    moveToStorage: function(pokemonIndex) {
        // you must keep at least one active pokemon
        if (player.pokemons.length > 1) {
            const poke = player.getPokemon()[pokemonIndex];
            player.pokemons.splice(pokemonIndex, 1);
            player.storage.push(poke);
            dom.renderPokeList();
        } else {
            dom.showPopup('You must have at least one active pokemon!');
        }
    },
    moveToRoster: function(pokemonIndex) {
        // check you have space
        if (player.pokemons.length < 6) {
            const poke = player.storage[pokemonIndex];
            player.storage.splice(pokemonIndex, 1);
            player.pokemons.push(poke);
            dom.renderStorage();
        } else {
            dom.showPopup('You can only have six active pokemon!');
        }
    },
    forceSave: function() {
        player.savePokes();
        $(`#forceSave`).style.display = 'inline';
    },
    exportSaveDialog: function() {
        document.getElementById('saveDialogTitle').innerHTML = 'Export your save';
        if (document.queryCommandSupported('copy')) {
            document.getElementById('copySaveText').style.display = 'initial';
        }
        document.getElementById('saveText').value = player.saveToString();
        document.getElementById('loadButtonContainer').style.display = 'none';
        document.getElementById('saveDialogContainer').style.display = 'block';
        $(`#settingsContainer`).style.display = 'none';
    },
    importSaveDialog: function() {
        document.getElementById('saveDialogTitle').innerHTML = 'Import a save';
        document.getElementById('copySaveText').style.display = 'none';
        document.getElementById('saveText').value = '';
        document.getElementById('loadButtonContainer').style.display = 'block';
        document.getElementById('saveDialogContainer').style.display = 'block';
        $(`#settingsContainer`).style.display = 'none';
    },
    importSave: function() {
        if (window.confirm('Loading a save will overwrite your current progress, are you sure you wish to continue?')) {
            player.loadFromString(document.getElementById('saveText').value.trim());
            document.getElementById('saveDialogContainer').style.display = 'none';
            // reload everything
            renderView(dom, enemy, player);
            dom.renderListBox();
            dom.renderPokeSort();
            dom.renderBalls();
            dom.renderCurrency();
        }
    },
    copySaveText: function() {
        document.getElementById('saveText').select();
        document.execCommand('copy');
        window.getSelection().removeAllRanges()
    },
    changePokeSortOrder: function() {
        player.sortPokemon();
        player.savePokes();
        dom.renderStorage();
    },
    changeSpriteChoice: function() {
        if (document.getElementById('spriteChoiceFront').checked) {
            player.settings.spriteChoice = 'front';
            document.getElementById('player').className = 'container poke frontSprite'
        } else {
            player.settings.spriteChoice = 'back';
            document.getElementById('player').className = 'container poke'
        }
        player.savePokes();
        renderView(dom, enemy, player)
    },
    viewStatistics: function() {
        let statisticStrings = {
            'seen':'Pokemon Seen',
            'caught':'Pokemon Caught',
            'released':'Pokemon Released',
            'sold':'Pokemon Sold',
            'beaten':'Pokemon Beaten',
            'shinySeen':'Shiny Pokemon Seen',
            'shinyCaught':'Shiny Pokemon Caught',
            'shinyReleased':'Shiny Pokemon Released',
            'shinyBeaten':'Shiny Pokemon Beaten',
            'totalDamage':'Total Damage Dealt',
            'totalThrows':'Total Catch Attempts',
            'successfulThrows':'Successfully Caught',
            'pokeballThrows':'Pokeball Throws',
            'pokeballSuccessfulThrows':'Caught with Pokeball',
            'greatballThrows':'Greatball Throws',
            'greatballSuccessfulThrows':'Caught with Greatball',
            'ultraballThrows':'Ultraball Throws',
            'ultraballSuccessfulThrows':'Caught with Ultraball',
            'totalCurrency':'Total Coin Obtained',
            'totalExp':'Total Experience Earned'
        };
        let statList = '';
        for (let statValue in player.statistics) {
            statList += '<li>' + statisticStrings[statValue] + ': ' + player.statistics[statValue] + '</li>';
        }
        document.getElementById('statisticsList').innerHTML = statList;
        document.getElementById('statisticsContainer').style.display = 'block'
    },
    viewSettings: function() {
        document.getElementById('settingsContainer').style.display = 'block';
        $(`#forceSave`).style.display = 'none';
        const select = document.getElementById('battleSpeedSelect');
        if (select && player.settings.battleSpeed) {
            select.value = player.settings.battleSpeed;
        }
    },
    changeBattleSpeed: function() {
        const select = document.getElementById('battleSpeedSelect');
        if (select) {
            const speed = select.options[select.selectedIndex].value;
            player.settings.battleSpeed = speed;
            player.savePokes(true);
        }
    },
    viewAchievements: function() {
        let achievementHTML = '';
        let completeState, complete;
        for (let subgroup in ACHIEVEMENTS['statistics']) {
            for (let i = 0, count = ACHIEVEMENTS['statistics'][subgroup].length; i < count; i++) {
                complete = (player['statistics'][subgroup] >= ACHIEVEMENTS['statistics'][subgroup][i].value);
                completeState = complete ? ACHIEVEMENTS['statistics'][subgroup][i].value : player['statistics'][subgroup];
                achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['statistics'][subgroup][i].name + '</b>: ' + camalCaseToString(subgroup) + ' ' + completeState + '/' + ACHIEVEMENTS['statistics'][subgroup][i].value  + '</li>';
            }
        }
        for (let i = 0, count = ACHIEVEMENTS['dex']['caughtCount'].length; i < count; i++) {
            let progress = player.countPokedex(POKEDEXFLAGS.releasedNormal);
            complete = (progress >= ACHIEVEMENTS['dex']['caughtCount'][i].value);
            completeState = complete ? ACHIEVEMENTS['dex']['caughtCount'][i].value : progress;
            achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['dex']['caughtCount'][i].name + '</b>: Unique Caught ' + completeState + '/' + ACHIEVEMENTS['dex']['caughtCount'][i].value  + '</li>';
        }
        for (let i = 0, count = ACHIEVEMENTS['dex']['caught'].length; i < count; i++) {
            let progress = 0;
            let needed = ACHIEVEMENTS['dex']['caught'][i]['pokes'].length;
            let string = '';
            for (let j = 0; j < needed; j++) {
                let pokeName = ACHIEVEMENTS['dex']['caught'][i]['pokes'][j];
                string += (j > 0) ? ', ' : '';
                if (player.hasDexEntry(pokeName, POKEDEXFLAGS.releasedNormal)) {
                    string += '<s>' + pokeName + '</s>';
                    progress++;
                } else {
                    string += pokeName;
                }
            }
            complete = (progress >= needed);
            completeState = complete ? needed : progress;
            achievementHTML += '<li' + (complete ? ' class="complete"' : '') + '><b>' + ACHIEVEMENTS['dex']['caught'][i].name + '</b>: Catch ' + string  + '</li>';
        }
        document.getElementById('achievementsList').innerHTML = achievementHTML;
        document.getElementById('achievementsContainer').style.display = 'block';
    },
    viewInventory: function() {
        if (!isEmpty(player.badges)) {
            let badgesHTML = '';
            for (let badge in player.badges) {
                badgesHTML += '<li>' + badge + '</li>';
            }
            document.getElementById('badgeList').innerHTML = badgesHTML;
        }
        let inventoryHTML = 'To do';
        document.getElementById('inventoryList').innerHTML = inventoryHTML;
        document.getElementById('inventoryContainer').style.display = 'block';
    },
    viewTown: function() {
        town.renderShop();
        town.renderTrader();
        document.getElementById('townContainer').style.display = 'block';
    },
    trainerBattle: function() {
        const routeData = ROUTES[player.settings.currentRegionId][player.settings.currentRouteId];
        if (routeData['trainer'] && routeData['trainer']['poke'].length > 0) {
            combatLoop.trainer = {name: routeData['trainer']['name'], badge: routeData['trainer']['badge']};
            combatLoop.trainerPoke = Object.values(Object.assign({}, routeData['trainer']['poke']));
            combatLoop.unpause();
            combatLoop.refresh();
        }
    },
    closeStory: function() {
        if (story.canClose) {
            $(`#storyContainer`).style.display = 'none';
        }
    },
    clickMove: function(moveIndex) {
        const activePoke = player.activePoke();
        const enemyPoke = enemy.activePoke();
        if (!activePoke || !enemyPoke || !enemyPoke.alive() || combatLoop.paused) return;
        
        const moves = activePoke.getMoves();
        const move = moves[moveIndex];
        if (!move || move.currentPP <= 0) return;
        
        move.currentPP--;
        dom.renderMoves();
        
        const baseDmg = (move.power || 10) / 45 * activePoke.avgAttack();
        const critRNG = RNG(8);
        const critMultiplier = critRNG ? 1.5 : 1.0;
        
        const damageMultiplier = combatLoop.calculateDamageMultiplier([move.type], enemyPoke.types()) * critMultiplier;
        const damage = enemyPoke.takeDamage(baseDmg * damageMultiplier);
        
        if (typeof Sound !== 'undefined') Sound.playHit();
        
        if (typeof dom !== 'undefined') {
            if (dom.spawnFloatingDamage) {
                dom.spawnFloatingDamage('enemy', (critRNG ? 'CRIT -' : '-') + damage, critRNG);
            }
            if (dom.triggerAttackVFX) {
                dom.triggerAttackVFX(move.type, 'enemy');
            }
        }
        
        if (critRNG) {
            dom.gameConsoleLog('Critical Hit!!', 'green');
        }
        dom.gameConsoleLog(`You clicked ${move.name}! Dealt ${damage} damage.`, 'green');
        
        dom.renderPokeOnContainer('enemy', enemyPoke);
        
        if (!enemyPoke.alive()) {
            combatLoop.enemyFaint();
        }
    },
    changeBattleSpeedDirect: function(speedKey) {
        player.settings.battleSpeed = speedKey;
        if (typeof dom !== 'undefined' && dom.renderSpeedControls) {
            dom.renderSpeedControls();
        }
        player.savePokes(true);
    },
    openTrainerCard: function() {
        if (typeof dom !== 'undefined' && dom.renderTrainerCard) {
            dom.renderTrainerCard();
        }
        const container = document.getElementById('trainerCardContainer');
        if (container) container.style.display = 'block';
    },
    tempEquippedMoves: [],
    openManageMoves: function() {
        const activePoke = player.activePoke();
        if (!activePoke) return;
        
        const currentMoves = activePoke.getMoves().map(m => m.name);
        this.tempEquippedMoves = [...currentMoves];
        
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
        const container = document.getElementById('manageMovesContainer');
        if (container) container.style.display = 'block';
    },
    addTempMove: function(name) {
        if (this.tempEquippedMoves.length >= 4) return;
        if (this.tempEquippedMoves.includes(name)) return;
        this.tempEquippedMoves.push(name);
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
    },
    removeTempMove: function(idx) {
        this.tempEquippedMoves.splice(idx, 1);
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
    },
    reorderMove: function(idx, dir) {
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= this.tempEquippedMoves.length) return;
        const temp = this.tempEquippedMoves[idx];
        this.tempEquippedMoves[idx] = this.tempEquippedMoves[targetIdx];
        this.tempEquippedMoves[targetIdx] = temp;
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
    },
    optimizeMoves: function() {
        const activePoke = player.activePoke();
        if (!activePoke) return;
        
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
        
        allUnlocked.sort((a, b) => (b.power || 0) - (a.power || 0));
        
        this.tempEquippedMoves = allUnlocked.slice(0, 4).map(m => m.name);
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
    },
    resetMoves: function() {
        this.tempEquippedMoves = [];
        if (typeof dom !== 'undefined' && dom.renderManageMoves) {
            dom.renderManageMoves();
        }
    },
    saveMoveLoadout: function() {
        const activePoke = player.activePoke();
        if (!activePoke) return;
        
        activePoke.equippedMovesNames = [...this.tempEquippedMoves];
        delete activePoke.cachedMoves; // Reset cached moves to re-evaluate loadout
        player.savePokes(true);
        
        if (typeof dom !== 'undefined') {
            dom.renderMoves();
        }
        const container = document.getElementById('manageMovesContainer');
        if (container) container.style.display = 'none';
        dom.gameConsoleLog('Move loadout saved successfully!', 'green');
    },
    draggedPoke: null,
    dragPoke: function(event, source, index) {
        this.draggedPoke = { source, index };
        event.dataTransfer.setData("text/plain", JSON.stringify({ source, index }));
        event.dataTransfer.effectAllowed = "move";
        
        // Add dragging class after current call stack to let browser capture drag image
        const target = event.currentTarget;
        setTimeout(() => {
            if (target) target.classList.add('dragging');
        }, 0);
    },
    allowDrop: function(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    },
    dragEnter: function(event) {
        event.preventDefault();
        if (event.currentTarget) {
            event.currentTarget.classList.add('drag-over');
        }
    },
    dragLeave: function(event) {
        if (event.currentTarget) {
            event.currentTarget.classList.remove('drag-over');
        }
    },
    dropPoke: function(event, target, targetIndex) {
        event.preventDefault();
        
        // Remove styling classes
        document.querySelectorAll('.draggable-poke-item').forEach(el => {
            el.classList.remove('drag-over', 'dragging');
        });
        
        let sourceData = this.draggedPoke;
        if (!sourceData) {
            try {
                sourceData = JSON.parse(event.dataTransfer.getData("text/plain"));
            } catch (e) {
                return;
            }
        }
        if (!sourceData) return;
        
        const { source, index } = sourceData;
        this.draggedPoke = null; // Clear state
        
        const beforeActive = player.activePoke();
        
        // Scenario 1: Swap within Roster (reordering)
        if (source === 'roster' && target === 'roster') {
            if (index === targetIndex) return;
            const temp = player.pokemons[index];
            player.pokemons[index] = player.pokemons[targetIndex];
            player.pokemons[targetIndex] = temp;
            
            // Keep active Poke index correct
            if (player.activePokeID === index) {
                player.activePokeID = targetIndex;
            } else if (player.activePokeID === targetIndex) {
                player.activePokeID = index;
            }
        }
        // Scenario 2: Swap within PC Storage
        else if (source === 'storage' && target === 'storage') {
            if (index === targetIndex) return;
            const temp = player.storage[index];
            player.storage[index] = player.storage[targetIndex];
            player.storage[targetIndex] = temp;
        }
        // Scenario 3: Move from Roster to PC Storage
        else if (source === 'roster' && target === 'storage') {
            if (player.pokemons.length <= 1) {
                dom.showPopup("Cannot empty active party roster!");
                return;
            }
            
            const [movedPoke] = player.pokemons.splice(index, 1);
            player.storage.splice(targetIndex, 0, movedPoke);
            
            // If the active Pokémon fainted/was moved, reset active ID
            if (player.activePokeID === index) {
                player.activePokeID = 0;
            } else if (player.activePokeID > index) {
                player.activePokeID--;
            }
            
            combatLoop.playerActivePoke = player.activePoke();
            combatLoop.refresh();
        }
        // Scenario 4: Move from PC Storage to Roster
        else if (source === 'storage' && target === 'roster') {
            const movedPoke = player.storage[index];
            
            // If roster is full, swap
            if (player.pokemons.length >= 6) {
                const targetPoke = player.pokemons[targetIndex];
                player.pokemons[targetIndex] = movedPoke;
                player.storage[index] = targetPoke;
                
                if (player.activePokeID === targetIndex) {
                    combatLoop.playerActivePoke = movedPoke;
                    combatLoop.refresh();
                }
            } else {
                // Roster has space, move
                player.storage.splice(index, 1);
                player.pokemons.splice(targetIndex, 0, movedPoke);
                
                if (player.activePokeID >= targetIndex) {
                    player.activePokeID++;
                }
                
                combatLoop.playerActivePoke = player.activePoke();
                combatLoop.refresh();
            }
        }
        
        player.savePokes(true);
        dom.renderPokeList();
        dom.renderStorage();
        renderView(dom, enemy, player, false);
    }
};