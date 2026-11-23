const UPGRADES = {
    shoes: {
        name: "Running Shoes",
        description: "Speed up combat ticks by 8% per level.",
        baseCost: 200,
        maxLevel: 5,
        getCost: function(lvl) {
            return this.baseCost * Math.pow(2.5, lvl);
        },
        getBenefit: function(lvl) {
            return lvl * 0.08;
        }
    },
    share: {
        name: "Exp. Share",
        description: "Roster Pokemon gain 12% of combat EXP per level.",
        baseCost: 500,
        maxLevel: 5,
        getCost: function(lvl) {
            return this.baseCost * Math.pow(3.0, lvl);
        },
        getBenefit: function(lvl) {
            return lvl * 0.12;
        }
    },
    coin: {
        name: "Amulet Coin",
        description: "Increases coin drops by +25% per level.",
        baseCost: 300,
        maxLevel: 5,
        getCost: function(lvl) {
            return this.baseCost * Math.pow(2.8, lvl);
        },
        getBenefit: function(lvl) {
            return lvl * 0.25;
        }
    },
    charm: {
        name: "Shiny Charm",
        description: "Doubles the chance of finding Shiny Pokemon.",
        baseCost: 50000,
        maxLevel: 1,
        getCost: function(lvl) {
            return this.baseCost;
        },
        getBenefit: function(lvl) {
            return lvl > 0 ? 2 : 1;
        }
    }
};

const UpgradeManager = {
    init: function() {
        if (!player.settings.upgrades) {
            player.settings.upgrades = {
                shoes: 0,
                share: 0,
                coin: 0,
                charm: 0
            };
        }
    },
    
    getLvl: function(key) {
        this.init();
        return player.settings.upgrades[key] || 0;
    },
    
    getCost: function(key) {
        const lvl = this.getLvl(key);
        const upgrade = UPGRADES[key];
        if (lvl >= upgrade.maxLevel) return Infinity;
        return Math.floor(upgrade.getCost(lvl));
    },
    
    getBenefit: function(key) {
        const lvl = this.getLvl(key);
        return UPGRADES[key].getBenefit(lvl);
    },
    
    buyUpgrade: function(key) {
        this.init();
        const cost = this.getCost(key);
        if (player.currency >= cost) {
            player.currency -= cost;
            player.settings.upgrades[key]++;
            dom.gameConsoleLog(`Upgraded ${UPGRADES[key].name} to Level ${player.settings.upgrades[key]}!`, 'green');
            dom.renderCurrency();
            player.savePokes(true);
            town.renderShop(); // Refresh town screen (which also triggers UpgradeManager.renderUpgrades)
            return true;
        }
        return false;
    },
    
    renderUpgrades: function() {
        this.init();
        let upgradesHTML = '';
        
        for (let key in UPGRADES) {
            const upgrade = UPGRADES[key];
            const lvl = this.getLvl(key);
            const cost = this.getCost(key);
            const isMax = lvl >= upgrade.maxLevel;
            
            const costText = isMax ? 'MAX' : `¤${cost}`;
            const disableButton = (isMax || player.currency < cost) ? ' disabled="true"' : '';
            const buttonHTML = ` <button onclick="UpgradeManager.buyUpgrade('${key}')"${disableButton}>Upgrade</button>`;
            
            upgradesHTML += `<li>
                <strong>${upgrade.name} (Lv ${lvl}/${upgrade.maxLevel})</strong><br>
                <span style="font-size: 9px; color: var(--text-secondary);">${upgrade.description}</span><br>
                Cost: ${costText}${isMax ? '' : buttonHTML}
            </li>`;
        }
        
        const upgradesContainer = document.getElementById('upgradesItems');
        if (upgradesContainer) {
            upgradesContainer.innerHTML = upgradesHTML;
        }
    }
};
