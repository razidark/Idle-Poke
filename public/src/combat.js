const Combat = {
    paused: false,
    trainer: null,
    trainerPoke: {},
    trainerCurrentID: 0,
    playerActivePoke: null,
    enemyActivePoke: null,
    playerTimerId: null,
    enemyTimerId: null,
    catchEnabled: false,
    init: function() {
        if (!this.paused) {
            this.playerActivePoke = player.activePoke();
            this.enemyActivePoke = enemy.activePoke();
            if (this.playerActivePoke && this.enemyActivePoke) {
                this.playerTimer();
                this.enemyTimer();
            }
        }
    },
    pause: function() {
        this.paused = true;
        this.stop();
        enemy.clear();
        this.enemyActivePoke = null;
    },
    unpause: function() {
        this.paused = false;
        this.stop();
        this.newEnemy();
        this.init();
        if (typeof Sound !== 'undefined' && this.playerActivePoke) {
            setTimeout(() => {
                Sound.playCry(this.playerActivePoke.pokeName());
            }, 600);
        }
    },
    stop: function() {
        window.clearTimeout(this.playerTimerId);
        window.clearTimeout(this.enemyTimerId);
    },
    refresh: function() {
        this.stop();
        this.init();
    },
    playerTimer: function() {
        if (!this.playerActivePoke) return;
        const nextAttack = this.playerActivePoke.attackSpeed();
        this.playerTimerId = window.setTimeout(
            () => this.dealDamage(this.playerActivePoke, this.enemyActivePoke, 'player'),
            nextAttack
        )
    },
    enemyTimer: function() {
        if (!this.enemyActivePoke) return;
        const nextAttack = this.enemyActivePoke.attackSpeed();
        this.enemyTimerId = window.setTimeout(
            () => this.dealDamage(this.enemyActivePoke, this.playerActivePoke, 'enemy'),
            nextAttack
        )
    },
    calculateDamageMultiplier: function(attackingTypes, defendingTypes) {
        const typeEffectiveness = (attackingType, defendingTypes) =>
            TYPES[attackingType][defendingTypes[0]] * (defendingTypes[1] && TYPES[attackingType][defendingTypes[1]] || 1);
        return Math.max(
            typeEffectiveness(attackingTypes[0], defendingTypes),
            attackingTypes[1] && typeEffectiveness(attackingTypes[1], defendingTypes) || 0
        )
    },
    dealDamage: function(attacker, defender, who) {
        if (!attacker || !defender) return null;
        if (attacker.alive() && defender.alive()) {
            const consoleColor = (who === 'player') ? 'green' : 'rgb(207, 103, 59)';
            // calculate damage done
            const missRNG = RNG(5);
            if (missRNG) {
                dom.gameConsoleLog(attacker.pokeName() + ' missed!', consoleColor);
            } else {
                const critRNG = RNG(5);
                const critMultiplier = (critRNG) ? 1 + (attacker.level() / 100) : 1;
                const damageMultiplier = this.calculateDamageMultiplier(attacker.types(), defender.types()) * critMultiplier;
                const damage = defender.takeDamage(attacker.avgAttack() * damageMultiplier);
                if (typeof Sound !== 'undefined') Sound.playHit();
                
                const targetId = who === 'player' ? 'enemy' : 'player';
                if (typeof dom !== 'undefined') {
                    if (dom.spawnFloatingDamage) {
                        dom.spawnFloatingDamage(targetId, (critRNG ? 'CRIT -' : '-') + damage, critRNG);
                    }
                    if (dom.triggerAttackVFX) {
                        dom.triggerAttackVFX(attacker.types()[0], targetId);
                    }
                }

                if (critRNG) {
                    dom.gameConsoleLog('Critical Hit!!', consoleColor);
                }
                if (who === 'player') {
                    dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'green');
                    player.statistics.totalDamage += damage;
                } else {
                    dom.gameConsoleLog(attacker.pokeName() + ' Attacked for ' + damage, 'rgb(207, 103, 59)');
                }
                dom.renderPokeOnContainer('enemy', enemy.activePoke());
                dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
            }
            if (who === 'player') {
                dom.attackAnimation('playerImg', 'right');
                this.playerTimer();
            } else {
                dom.attackAnimation('enemyImg', 'left');
                this.enemyTimer();
            }
        }
        if (!attacker.alive() || !defender.alive()) {
            // one is dead
            window.clearTimeout(this.playerTimerId);
            window.clearTimeout(this.enemyTimerId);

            if ((who === 'enemy') && !attacker.alive() ||
                (who === 'player') && !defender.alive())
            {
                this.enemyFaint();
            } else {
               this.playerFaint();
            }
            dom.renderPokeOnContainer('enemy', enemy.activePoke());
        }
    },
    enemyFaint: function() {
        if (typeof Sound !== 'undefined') Sound.playFaint();
        
        if (this.trainer) {
            player.statistics.trainerBeaten++;
        } else {
            player.statistics.wildBeaten++;
        }
        
        if (!player.settings.recentBattles) player.settings.recentBattles = [];
        player.settings.recentBattles.push({
            name: enemy.activePoke().pokeName(),
            level: enemy.activePoke().level(),
            shiny: enemy.activePoke().shiny(),
            isTrainer: !!this.trainer,
            time: Date.now()
        });
        if (player.settings.recentBattles.length > 5) {
            player.settings.recentBattles.shift();
        }
        
        if (enemy.activePoke().shiny()) {
            player.statistics.shinyBeaten++;
        } else {
            player.statistics.beaten++;
        }
        this.attemptCatch();
        this.findPokeballs(enemy.activePoke().level());
        if (this.trainer) {
            if (typeof QuestManager !== 'undefined') {
                QuestManager.trackDefeatTrainer(this.trainer.name);
            }
        } else {
            if (typeof QuestManager !== 'undefined') {
                QuestManager.trackDefeat(player.settings.currentRouteId);
            }
        }

        const beforeExp = player.getPokemon().map((poke) => poke.level());
        const expToGive = (this.enemyActivePoke.baseExp() / 16) + (this.enemyActivePoke.level() * 3);
        player.statistics.totalExp += expToGive;
        this.playerActivePoke.giveExp(expToGive);
        dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' won ' + Math.floor(expToGive) + 'xp', 'rgb(153, 166, 11)');
        
        // Base roster exp share
        player.getPokemon().forEach((poke) => poke.giveExp((this.enemyActivePoke.baseExp() / 100) + (this.enemyActivePoke.level() / 10)));
        
        // Passive Exp. Share upgrade
        let shareBenefit = 0;
        if (typeof UpgradeManager !== 'undefined') {
            shareBenefit = UpgradeManager.getBenefit('share') || 0;
        }
        if (shareBenefit > 0) {
            player.getPokemon().forEach((poke) => {
                if (poke !== this.playerActivePoke) {
                    poke.giveExp(expToGive * shareBenefit);
                }
            });
        }

        const afterExp = player.getPokemon().map((poke) => poke.level());

        // check if a pokemon leveled up
        if (beforeExp.join('') !== afterExp.join('')) {
            dom.gameConsoleLog('Your pokemon gained a level', 'rgb(153, 166, 11)');
            if (typeof Sound !== 'undefined') Sound.playLevelUp();
            if (typeof QuestManager !== 'undefined') QuestManager.trackLevel();
            if (player.settings.listView == 'roster') {
                dom.renderPokeList(false);
            }
        }

        // was it a trainer poke
        if (this.trainer) {
            // remove the pokemon
            this.trainerPoke.splice(this.trainerCurrentID, 1);
            if (this.trainerPoke.length < 1) {
                dom.gameConsoleLog('You have defeated '+this.trainer.name, 'blue');
                if (this.trainer.badge) {
                    if (!player.badges[this.trainer.badge]) {
                        player.badges[this.trainer.badge] = true;
                        dom.gameConsoleLog('You have earned the <b>' + this.trainer.badge + '</b>.', 'purple');
                        dom.renderRouteList();
                    }
                }
                this.trainer = null;
                this.pause();
                return false;
            }
        }

        player.savePokes();
        this.newEnemy();
        this.enemyTimer();
        this.playerTimer();
        dom.renderPokeOnContainer('player', player.activePoke(), player.settings.spriteChoice || 'back');
    },
    newEnemy: function() {
        if (combatLoop.trainer) {
            enemy.trainerPoke(combatLoop.trainerPoke);
        } else {
            enemy.generateNew(player.settings.currentRegionId, player.settings.currentRouteId);
        }
        this.enemyActivePoke = enemy.activePoke();
        player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.seenShiny : POKEDEXFLAGS.seenNormal));
        if (enemy.activePoke().shiny()) {
            player.statistics.shinySeen++;
        } else {
            player.statistics.seen++;
        }
        if (typeof Sound !== 'undefined' && this.enemyActivePoke) {
            Sound.playCry(this.enemyActivePoke.pokeName());
        }
    },
    playerFaint: function() {
        if (typeof Sound !== 'undefined') Sound.playFaint();
        dom.gameConsoleLog(this.playerActivePoke.pokeName() + ' Fainted! ');
        const alivePokeIndexes = player.alivePokeIndexes();
        if (alivePokeIndexes.length > 0) {
            player.setActive(player.getPokemon().indexOf(alivePokeIndexes[0]));
            this.playerActivePoke = player.activePoke();
            dom.gameConsoleLog('Go ' + this.playerActivePoke.pokeName() + '!');
            this.refresh();
        } else {
            dom.gameConsoleLog('You have no more usable pokemon. You blacked out!', 'red');
            if (this.trainer) {
                dom.gameConsoleLog('You have been defeated', 'red');
                this.trainer = null;
                this.pause();
            }
            flash($('#gameContainer'));
            dom.gameConsoleLog('You reawaken at the nearest pokecenter.', 'blue');
            if (ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['respawn']) {
                userInteractions.changeRoute(ROUTES[player.settings.currentRegionId][player.settings.currentRouteId]['respawn'], true);
            }
        }
        dom.renderPokeList(false);
    },
    attemptCatch: function() {
        if (this.catchEnabled == 'all' || (this.catchEnabled == 'new' && !player.hasPokemon(enemy.activePoke().pokeName(), 0)) || enemy.activePoke().shiny()) {
            dom.gameConsoleLog('Trying to catch ' + enemy.activePoke().pokeName() + '...', 'purple');
            const selectedBall = (enemy.activePoke().shiny() ? player.bestAvailableBall() : player.selectedBall);
            if (player.consumeBall(selectedBall)) {
                // add throw to statistics
                player.statistics.totalThrows++;
                player.statistics[selectedBall+'Throws']++;
                dom.renderBalls();
                if (combatLoop.trainer) {
                    dom.gameConsoleLog('But the '+combatLoop.trainer.name+' bats away your ball', 'purple');
                    return false;
                }
                const catchBonus = (player.unlocked.razzBerry) ? 1.25 : 1;
                const rngHappened = RNG(((enemy.activePoke().catchRate() * player.ballRNG(selectedBall)) / 3) * catchBonus);
                if (rngHappened) {
                    player.statistics.successfulThrows++;
                    player.statistics[selectedBall+'SuccessfulThrows']++;
                    dom.gameConsoleLog('You caught ' + enemy.activePoke().pokeName() + '!!', 'purple');
                    if (typeof Sound !== 'undefined') Sound.playCapture(true);
                    player.addPoke(enemy.activePoke());
                    player.addPokedex(enemy.activePoke().pokeName(), (enemy.activePoke().shiny() ? POKEDEXFLAGS.ownShiny : POKEDEXFLAGS.ownNormal));
                    if (enemy.activePoke().shiny()) {
                        player.statistics.shinyCaught++;
                        player.unlocked.shinyDex = 1;
                    } else {
                        player.statistics.caught++;
                    }
                    if (typeof QuestManager !== 'undefined') {
                        QuestManager.trackCatch();
                    }
                    renderView(dom, enemy, player);
                } else {
                    dom.gameConsoleLog(enemy.activePoke().pokeName() + ' escaped!!', 'purple')
                    if (typeof Sound !== 'undefined') Sound.playCapture(false);
                }
            }
        }
    },
    findPokeballs: function(pokeLevel) {
        const ballsAmount = Math.floor(Math.random() * (pokeLevel/2)) + 1;
        const ballWeights = {
            'ultraball': 1,
            'greatball': 10,
            'pokeball': 100,
        };
        const rng = Math.floor(Math.random() * (2000 - (pokeLevel * 4)));
        for (let ballName in ballWeights) {
            if (rng < ballWeights[ballName]) {
                player.addBalls(ballName, ballsAmount);
                dom.gameConsoleLog('You found ' + ballsAmount + ' ' + ballName + 's!!', 'purple');
                dom.renderBalls();
            }
        }
    },
    findCurrency: function(pokeLevel) {
        if (RNG(5)) {
            let foundCurrency = Math.floor(Math.random() * pokeLevel * 4) + 1;
            if (typeof UpgradeManager !== 'undefined') {
                const coinBenefit = UpgradeManager.getBenefit('coin') || 0;
                foundCurrency = Math.floor(foundCurrency * (1 + coinBenefit));
            }
            player.addCurrency(foundCurrency);
            dom.gameConsoleLog('You found ¤' + foundCurrency + '!!', 'purple');
        }
    },
    changePlayerPoke: function(newPoke) {
        this.playerActivePoke = newPoke;
        if (typeof Sound !== 'undefined' && newPoke) {
            Sound.playCry(newPoke.pokeName());
        }
        this.refresh()
    },
    changeEnemyPoke: function(newPoke) {
        this.enemyActivePoke = newPoke;
        this.refresh()
    },
    changeCatch: function(shouldCatch) { this.catchEnabled = shouldCatch; }
};