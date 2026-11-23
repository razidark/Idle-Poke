let Town = {
    currentShopItems: [],
    getAvailableShopItems: function() {
        const routeId = player.settings.currentRouteId;
        const badgeCount = Object.keys(player.badges || {}).filter(b => player.badges[b]).length;
        
        let items = [
            { name: 'Pokeball', cost: 10, ball: 'pokeball' }
        ];
        
        // Add candies based on badge count (progression level)
        if (badgeCount >= 1) {
            items.push({ name: 'Small EXP Candy', cost: 150, candy: 500 });
        }
        if (badgeCount >= 2) {
            items.push({ name: 'Medium EXP Candy', cost: 1200, candy: 5000 });
        }
        if (badgeCount >= 4) {
            items.push({ name: 'Large EXP Candy', cost: 8000, candy: 50000 });
        }
        
        // Add balls
        if (badgeCount >= 1 || ['special1', 'ceruleanCity', 'vermilionCity', 'violetCity', 'azaleaTown'].includes(routeId)) {
            items.push({ name: 'Greatball', cost: 100, ball: 'greatball' });
        }
        if (badgeCount >= 3 || ['vermilionCity', 'special8', 'lavenderTown', 'special7', 'goldenrodCity', 'ecruteakCity'].includes(routeId)) {
            items.push({ name: 'Ultraball', cost: 1000, ball: 'ultraball' });
        }
        
        // Add Rods
        if (['special1', 'ceruleanCity', 'vermilionCity', 'pewterCity', 'violetCity', 'azaleaTown'].includes(routeId) || badgeCount >= 1) {
            items.push({ name: 'Old Rod', cost: 1000, fishing: 1 });
        }
        if (['ceruleanCity', 'vermilionCity', 'special8', 'lavenderTown', 'goldenrodCity', 'olivineCity'].includes(routeId) || badgeCount >= 2) {
            items.push({ name: 'Good Rod', cost: 10000, fishing: 2 });
        }
        if (['special7', 'fuchsiaCity', 'cinnabarIsland', 'olivineCity', 'cianwoodCity', 'blackthornCity'].includes(routeId) || badgeCount >= 4) {
            items.push({ name: 'Super Rod', cost: 100000, fishing: 3 });
        }
        
        // Add Razz Berry & Complete Pokedex
        if (badgeCount >= 3 || ['special7', 'fuchsiaCity', 'cinnabarIsland', 'goldenrodCity', 'blackthornCity'].includes(routeId)) {
            items.push({ name: 'Razz Berry', cost: 250000, unlockable: 'razzBerry' });
        }
        if (badgeCount >= 5 || ['special7', 'fuchsiaCity', 'cinnabarIsland', 'goldenrodCity', 'blackthornCity'].includes(routeId)) {
            items.push({ name: 'Complete Pokedex', cost: 100000, unlockable: 'completeDex' });
        }
        
        return items;
    },
    updateNPCDialogue: function() {
        const routeId = player.settings.currentRouteId;
        const region = player.settings.currentRegionId;
        const route = ROUTES[region][routeId];
        
        const npcAvatar = document.getElementById('npcAvatar');
        const npcDialogue = document.getElementById('npcDialogue');
        
        if (!npcAvatar || !npcDialogue) return;
        
        const dialogues = {
            'starter': { avatar: '👴', text: "Prof. Oak: Welcome back, youngster! My research is progressing well. Are your Pokémon growing strong?" },
            'viridianCity': { avatar: '🏪', text: "Mart Clerk: Welcome to Viridian City! Be careful if you head west towards Indigo Plateau; the wild Pokémon there are extremely high level." },
            'special1': { avatar: '🪨', text: "Brock: Pewter City is a city of stone! My Rock-type Pokémon are solid as granite. Can you break through our defense?" },
            'ceruleanCity': { avatar: '💧', text: "Misty: Cerulean City is surrounded by beautiful waters! I love water-types. Let's see if you can swim with the big fish!" },
            'vermilionCity': { avatar: '⚡', text: "Lt. Surge: Ten-hut! Vermilion City's gym is fully charged! You look like a baby recruit. Show me your lightning spirit!" },
            'lavenderTown': { avatar: '👻', text: "Channeler: The Pokémon Tower is filled with resting spirits... We sell charms to keep wild ghosts away." },
            'special7': { avatar: '🏬', text: "Mart Clerk: Welcome to the Celadon Department Store branch! We sell premium gear, including EXP Candies of all sizes!" },
            'special8': { avatar: '🧠', text: "Sabrina: Saffron City is the center of the region. Mind over matter... I foresee a great destiny for you." },
            'fuchsiaCity': { avatar: '🦁', text: "Koga: Fuchsia City is home to the Safari Zone. Ninja stealth and poison is our way... Tread carefully." },
            'cinnabarIsland': { avatar: '🌋', text: "Blaine: Cinnabar Island is built on fire! You better have burn heal ready. Let's test your heat!" },
            
            // Johto
            'starter2': { avatar: '🏡', text: "Prof. Elm: New Bark Town is where new winds blow! I am researching Pokémon evolution. Keep pushing forward!" },
            'cherrygroveCity': { avatar: '🌸', text: "Guide Gent: Cherrygrove is a scenic town. Did you check out the ocean views? We have great items here!" },
            'violetCity': { avatar: '🏯', text: "Falkner: Violet City is home to the Sprout Tower. My bird Pokémon soar high in the skies!" },
            'azaleaTown': { avatar: '🪵', text: "Kurt: Azalea Town makes the finest charcoal! I also craft custom Poke Balls. Stay safe in Union Cave!" },
            'goldenrodCity': { avatar: '🪙', text: "Whitney: Goldenrod is Johto's biggest city! Our Department Store has everything. Don't cry when my Miltank stomps you!" },
            'ecruteakCity': { avatar: '🍁', text: "Morty: Ecruteak is rich with traditional history... The Tin Tower holds ancient legends." },
            'olivineCity': { avatar: '🚨', text: "Jasmine: Olivine City's lighthouse keeps our ships safe. The ocean waves are peaceful today." },
            'cianwoodCity': { avatar: '🌊', text: "Chuck: Cianwood is far out in the west sea! We train hard by crushing boulders with our bare hands!" },
            'mahoganyTown': { avatar: '❄️', text: "Pryce: Mahogany Town is quiet... but mysteries lurk near the Lake of Rage. Keep your eyes open." },
            'blackthornCity': { avatar: '🐉', text: "Clair: Blackthorn City is the home of dragon tamers! You are not ready for our trials yet." }
        };
        
        const dialog = dialogues[routeId] || { avatar: '🏪', text: `Mart Clerk: Welcome to the Poke Shop in ${route ? route.name : 'town'}! We have fresh items in stock.` };
        npcAvatar.innerText = dialog.avatar;
        npcDialogue.innerHTML = dialog.text;
    },
    renderShop: function() {
        this.currentShopItems = this.getAvailableShopItems();
        let shopHTML = '';
        for (let i = 0; i < this.currentShopItems.length; i++) {
            const item = this.currentShopItems[i];
            let canBuy = player.currency >= item.cost;
            let own = false;
            
            if (item.unlockable && player.unlocked[item.unlockable]) {
                canBuy = false;
                own = true;
            }
            if (item.fishing && player.unlocked.fishing >= item.fishing) {
                canBuy = false;
                own = true;
            }
            
            const disableButton = (!canBuy || own) ? ' disabled="true"' : '';
            const buttonText = (own) ? 'Own' : 'Buy';
            const buttonHTML = ' <button onclick="town.buyItem(\'' + i + '\')"' + disableButton + '>' + buttonText + '</button>';
            
            let displayName = item.name;
            if (item.candy) {
                displayName += ` (+${item.candy} XP)`;
            }
            shopHTML += '<li>' + displayName + ': ¤' + item.cost + buttonHTML + '</li>';
        }
        $('#shopItems').innerHTML = shopHTML;
        if (typeof UpgradeManager !== 'undefined') {
            UpgradeManager.renderUpgrades();
        }
        this.updateNPCDialogue();
    },
    buyItem: function(index) {
        if (!this.currentShopItems || this.currentShopItems.length === 0) {
            this.currentShopItems = this.getAvailableShopItems();
        }
        const item = this.currentShopItems[index];
        if (!item) return false;
        
        if (player.currency < item.cost) {
            return false;
        } else {
            player.currency -= item.cost;
            if (item.ball) {
                player.ballsAmount[item.ball]++;
                dom.renderBalls();
            }
            if (item.unlockable) {
                player.unlocked[item.unlockable] = 1;
                dom.renderListBox();
            }
            if (item.fishing && item.fishing > player.unlocked.fishing) {
                player.unlocked.fishing = item.fishing;
                dom.renderListBox();
            }
            if (item.candy) {
                const activePoke = player.activePoke();
                if (activePoke) {
                    const beforeLvl = activePoke.level();
                    activePoke.giveExp(item.candy);
                    const afterLvl = activePoke.level();
                    
                    dom.gameConsoleLog('Fed ' + activePoke.pokeName() + ' an EXP Candy! Gained ' + item.candy + ' XP.', 'green');
                    if (beforeLvl !== afterLvl) {
                        dom.gameConsoleLog('Your pokemon leveled up to Lv ' + afterLvl + '!', 'rgb(153, 166, 11)');
                        if (typeof Sound !== 'undefined') Sound.playLevelUp();
                    }
                    dom.renderPokeOnContainer('player', activePoke, player.settings.spriteChoice || 'back');
                    dom.renderPokeList();
                } else {
                    alert("You don't have an active Pokemon to feed!");
                    player.currency += item.cost;
                    return false;
                }
            }
            this.renderShop(); // force refresh of shop
            dom.renderCurrency();
            player.savePokes();
            return true;
        }
    },
    renderSellTrader: function() {
        let traderHTML = '';
        let poke, pokeValue, pokeStatus, classValue, buttonHTML;
        const storageLength = player.storage.length;
        for (let i = 0; i < storageLength; i++) {
            poke = player.storage[i];
            pokeValue = this.calculatePokeValue(poke);
            pokeStatus = dom.pokeStatus(poke);
            classValue = 'pokeListName ' + pokeStatus;
            buttonHTML = ' <button onclick="town.sellPoke(\'' + i + '\')">Sell</button>';
            traderHTML += '<li class="' + classValue + '">' + poke.pokeName() + ': ¤' + pokeValue + buttonHTML + '</li>';
        }
        if (storageLength == 0) {
            traderHTML += '<li>Nothing to sell, you can only sell pokemon from your storage</li>';
        }
        $('#traderSellList').innerHTML = traderHTML;
    },
    traderPoke: ['Farfetchd', 'Jynx', 'Lickitung', 'Mr. Mime'],
    renderBuyTrader: function() {
        let traderHTML = '';
        let poke, pokeValue, buttonHTML, canBuy;
        for (let i = 0; i < this.traderPoke.length; i++) {
            poke = this.traderPoke[i];
            pokeValue = 100000;
            canBuy = true;
            if (player.currency < pokeValue)
                canBuy = false;
            const disableButton = (!canBuy) ? ' disabled="true"' : '';
            buttonHTML = ' <button onclick="town.buyPoke(\'' + i + '\')" ' + disableButton + '>Buy</button>';
            traderHTML += '<li>' + poke + ': ¤' + pokeValue + buttonHTML + '</li>';
        }
        $('#traderBuyList').innerHTML = traderHTML;
    },
    renderTrader: function() {
        this.renderSellTrader();
        this.renderBuyTrader();
    },
    calculatePokeValue: function(poke, demandMult = 1) {
        const shinyMult = (poke.shiny()) ? 1500 : 1;
        return Math.floor((poke.level() / 4) * shinyMult * demandMult);
    },
    sellPoke: function(index) {
        const poke = player.storage[index];
        const soldValue = this.calculatePokeValue(poke);
        player.addCurrency(soldValue);
        dom.gameConsoleLog('Sold ' + poke.pokeName() + ' for ¤' + soldValue + '!!', 'purple');
        player.deletePoke(index, 'storage');
        player.statistics.sold++;
        this.renderSellTrader();
        dom.renderPokeList();
        return false;
    },
    buyPoke: function(index) {
        const pokeValue = 100000;
        if (player.currency < pokeValue) {
            return false;
        } else {
            const poke = pokeByName(this.traderPoke[index]);
            const newPoke = new Poke(poke, 30, false, Math.random() < (1 / (1 << 5 << 8)));
            player.currency -= pokeValue;
            dom.gameConsoleLog('Bought ' + newPoke.pokeName() + ' for ¤' + pokeValue + '!!', 'purple');
            player.addPoke(newPoke);
            player.addPokedex(newPoke.pokeName(), (newPoke.shiny() ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
            dom.renderPokeList();
            dom.renderCurrency();
            return false;
        }
    }
};