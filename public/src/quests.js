const QUESTS = [
    {
        id: 0,
        name: "First Steps",
        description: "Defeat 5 wild Pokemon on Route 1",
        targetType: "defeat",
        targetRoute: "route", // Route 1
        targetCount: 5,
        rewardText: "10 Pokeballs & ¤100",
        reward: function() {
            player.addBalls('pokeball', 10);
            player.addCurrency(100);
            dom.showPopup("Quest Complete! Received 10 Pokeballs and ¤100.");
        }
    },
    {
        id: 1,
        name: "Pewter City Travel",
        description: "Travel to Pewter City (Route 3)",
        targetType: "travel",
        targetRoute: "special1", // Pewter City is special1
        rewardText: "5 Greatballs & ¤250",
        reward: function() {
            player.addBalls('greatball', 5);
            player.addCurrency(250);
            dom.showPopup("Quest Complete! Received 5 Greatballs and ¤250.");
        }
    },
    {
        id: 2,
        name: "Rock Solid Challenge",
        description: "Defeat Gym Leader Brock",
        targetType: "defeat_trainer",
        targetTrainer: "Brock",
        rewardText: "¤500 & 5 Greatballs",
        reward: function() {
            player.addBalls('greatball', 5);
            player.addCurrency(500);
            dom.showPopup("Quest Complete! Received ¤500 and 5 Greatballs.");
        }
    },
    {
        id: 3,
        name: "Catching Fever",
        description: "Catch 5 Pokemon of any kind",
        targetType: "catch",
        targetCount: 5,
        rewardText: "¤300 & 10 Greatballs",
        reward: function() {
            player.addBalls('greatball', 10);
            player.addCurrency(300);
            dom.showPopup("Quest Complete! Received ¤300 and 10 Greatballs.");
        }
    },
    {
        id: 4,
        name: "Mysterious Waters",
        description: "Defeat Gym Leader Misty at Cerulean Gym",
        targetType: "defeat_trainer",
        targetTrainer: "Misty",
        rewardText: "¤1000 & 5 Ultraballs",
        reward: function() {
            player.addBalls('ultraball', 5);
            player.addCurrency(1000);
            dom.showPopup("Quest Complete! Received ¤1000 and 5 Ultraballs.");
        }
    },
    {
        id: 5,
        name: "Leveling Up",
        description: "Train a Pokemon to Level 30",
        targetType: "level",
        targetLevel: 30,
        rewardText: "¤2000 & 10 Ultraballs",
        reward: function() {
            player.addBalls('ultraball', 10);
            player.addCurrency(2000);
            dom.showPopup("Quest Complete! Received ¤2000 and 10 Ultraballs.");
        }
    },
    {
        id: 6,
        name: "Electric Surge",
        description: "Defeat Gym Leader Lt. Surge at Vermilion Gym",
        targetType: "defeat_trainer",
        targetTrainer: "Lt. Surge",
        rewardText: "¤3000 & 10 Ultraballs",
        reward: function() {
            player.addBalls('ultraball', 10);
            player.addCurrency(3000);
            dom.showPopup("Quest Complete! Received ¤3000 and 10 Ultraballs.");
        }
    }
];

const QuestManager = {
    init: function() {
        if (player.settings.activeQuest === undefined) {
            player.settings.activeQuest = 0;
            player.settings.activeQuestProgress = 0;
        }
    },
    
    getActiveQuest: function() {
        this.init();
        const qId = player.settings.activeQuest;
        if (qId >= QUESTS.length) return null;
        return QUESTS[qId];
    },
    
    getProgressText: function() {
        const quest = this.getActiveQuest();
        if (!quest) return "All quests completed!";
        
        if (quest.targetType === "defeat" || quest.targetType === "catch") {
            return `${player.settings.activeQuestProgress} / ${quest.targetCount}`;
        }
        if (quest.targetType === "level") {
            const maxLvl = Math.max(...player.getPokemon().map(p => p.level()));
            return `${maxLvl} / ${quest.targetLevel}`;
        }
        return "0 / 1";
    },
    
    trackDefeat: function(routeId) {
        const quest = this.getActiveQuest();
        if (!quest || quest.targetType !== "defeat") return;
        
        if (!quest.targetRoute || quest.targetRoute === routeId) {
            player.settings.activeQuestProgress++;
            this.checkCompletion();
        }
    },
    
    trackCatch: function() {
        const quest = this.getActiveQuest();
        if (!quest || quest.targetType !== "catch") return;
        
        player.settings.activeQuestProgress++;
        this.checkCompletion();
    },
    
    trackTravel: function(routeId) {
        const quest = this.getActiveQuest();
        if (!quest || quest.targetType !== "travel") return;
        
        if (quest.targetRoute === routeId) {
            this.completeQuest();
        }
    },
    
    trackDefeatTrainer: function(trainerName) {
        const quest = this.getActiveQuest();
        if (!quest || quest.targetType !== "defeat_trainer") return;
        
        if (quest.targetTrainer.toLowerCase() === trainerName.toLowerCase()) {
            this.completeQuest();
        }
    },
    
    trackLevel: function() {
        const quest = this.getActiveQuest();
        if (!quest || quest.targetType !== "level") return;
        
        const maxLvl = Math.max(...player.getPokemon().map(p => p.level()));
        if (maxLvl >= quest.targetLevel) {
            this.completeQuest();
        }
    },
    
    checkCompletion: function() {
        const quest = this.getActiveQuest();
        if (!quest) return;
        
        if ((quest.targetType === "defeat" || quest.targetType === "catch") && player.settings.activeQuestProgress >= quest.targetCount) {
            this.completeQuest();
        }
    },
    
    completeQuest: function() {
        const quest = this.getActiveQuest();
        if (!quest) return;
        
        quest.reward();
        player.settings.activeQuest++;
        player.settings.activeQuestProgress = 0;
        player.savePokes(true);
        dom.renderQuest();
    }
};
