const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            characterSheet: {
                meta: {
                    version: '1.0',
                    timestamp: Date.now()
                },
                hero: {
                    playerName: 'Player One',
                    name: 'Super Hero',
                    alias: 'The Masked Avenger',
                    archetype: 'Generic',
                    powerSource: 'Experimentation',
                    personality: 'Brave and bold',
                    background: 'A mysterious past...',
                    principles: 'With great power comes great responsibility.',
                    gender: 'Unknown',
                    age: 25,
                    height: '6\'0"',
                    health: {
                        current: 30,
                        max: 30,
                        ranges: {
                            greenMin: 23, // floor(30 * 0.75)
                            yellowMin: 11, // floor(30 * 0.35)
                            redMin: 1
                        }
                    },
                    heroPoints: {
                        current: 0,
                        max: 5
                    },
                    modifier: {
                        current: 0
                    },
                    statusDice: {
                        green: 6,
                        yellow: 8,
                        red: 10
                    },
                    powers: [
                        { id: 'lightning-bolt', name: 'Lightning Bolt', die: 10 },
                        { id: 'weather-control', name: 'Weather Control', die: 8 }
                    ],
                    qualities: [
                        { id: 'banter', name: 'Banter', die: 8 },
                        { id: 'leadership', name: 'Leadership', die: 6 }
                    ],
                    abilities: [
                        { id: 'laser-eyes', name: 'Laser Eyes', die: 8, zone: 'green', text: 'Shoots lasers from eyes.' },
                        { id: 'flight', name: 'Flight', die: 10, zone: 'yellow', text: 'Can fly.' },
                        { id: 'super-strength', name: 'Super Strength', die: 12, zone: 'red', text: 'Is very strong.' }
                    ]
                }
            },
            showAddEditAbilityModal: false,
            editingAbility: null,
            currentPage: 'home'
        };
    },
    computed: {
        healthPercentage() {
            if (this.characterSheet.hero.health.max === 0) return 0;
            return (this.characterSheet.hero.health.current / this.characterSheet.hero.health.max) * 100;
        },
        displayedAbilities() {
            return this.characterSheet.hero.abilities;
        }
    },
    mounted() {
        this.loadSettings();
    },
    methods: {
        getStatusMessage() {
            const pct = this.healthPercentage;
            if (pct >= 75) return "READY FOR ACTION!";
            if (pct >= 35) return "I CAN KEEP GOING!";
            if (pct >= 1) return "I NEED BACKUP!";
            return "DOWN FOR THE COUNT!";
        },
        changeHealth(amount) {
            const newHealth = this.characterSheet.hero.health.current + amount;
            if (newHealth >= 0 && newHealth <= this.characterSheet.hero.health.max) {
                this.characterSheet.hero.health.current = newHealth;
            }
        },
        changeHeroPoints(amount) {
            const newHeroPoints = this.characterSheet.hero.heroPoints.current + amount;
            if (newHeroPoints >= 0 && newHeroPoints <= this.characterSheet.hero.heroPoints.max) {
                this.characterSheet.hero.heroPoints.current = newHeroPoints;
            }
        },
        changeModifier(amount) {
            this.characterSheet.hero.modifier.current += amount;
        },
        getSegmentClass(segmentNumber) {
            const pct = this.healthPercentage;
            const segmentThreshold = segmentNumber * 10;

            if (pct < segmentThreshold) {
                return 'empty';
            }

            if (segmentNumber >= 6) return 'filled-green';
            if (segmentNumber >= 3) return 'filled-yellow';
            return 'filled-red';
        },
        openAddAbilityModal() {
            this.editingAbility = null;
            this.showAddEditAbilityModal = true;
        },
        openEditAbilityModal(ability) {
            this.editingAbility = ability;
            this.showAddEditAbilityModal = true;
        },
        closeAddEditAbilityModal() {
            this.showAddEditAbilityModal = false;
        },
        saveAbility(abilityData) {
            const { id, name, die, zone, text } = abilityData;
            const abilityIndex = this.characterSheet.hero.abilities.findIndex(a => a.id === id);

            if (abilityIndex > -1) { // Editing existing ability
                this.characterSheet.hero.abilities.splice(abilityIndex, 1, { id, name, die, zone, text });
            } else { // Adding new ability
                const newId = id || name.toLowerCase().replace(/\s+/g, '-');
                this.characterSheet.hero.abilities.push({ id: newId, name, die, zone, text });
            }
            this.closeAddEditAbilityModal();
        },
        deleteAbility(abilityIdentifier) {
            const abilityId = abilityIdentifier.id;
            this.characterSheet.hero.abilities = this.characterSheet.hero.abilities.filter(a => a.id !== abilityId);
        },
        getGyroStatus() {
            const health = this.characterSheet.hero.health;
            const ranges = health.ranges;
            if (health.current >= ranges.greenMin) return 'green';
            if (health.current >= ranges.yellowMin) return 'yellow';
            if (health.current >= ranges.redMin) return 'red';
            return 'out';
        },
        isAbilityAvailable(ability) {
            const gyro = this.getGyroStatus();
            switch (gyro) {
                case 'green':
                    return ability.zone === 'green';
                case 'yellow':
                    return ['green', 'yellow'].includes(ability.zone);
                case 'red':
                    return ['green', 'yellow', 'red'].includes(ability.zone);
                case 'out':
                    return false;
                default:
                    return false;
            }
        },
        setPage(page) {
            this.currentPage = page;
        },
        updateHealthRanges() {
            const max = this.characterSheet.hero.health.max;
            this.characterSheet.hero.health.ranges.greenMin = Math.floor(max * 0.75);
            this.characterSheet.hero.health.ranges.yellowMin = Math.floor(max * 0.35);
            this.characterSheet.hero.health.ranges.redMin = 1;
        },
        saveSettings() {
            this.updateHealthRanges();
            try {
                localStorage.setItem('hero-character', JSON.stringify(this.characterSheet));
                alert('Settings Saved!');
            } catch (e) {
                console.error('Error saving settings', e);
                alert('Error saving settings');
            }
        },
        loadSettings() {
            try {
                const saved = localStorage.getItem('hero-character');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Merge saved data with current structure to ensure new fields exist if loading old data
                    this.characterSheet = {
                        ...this.characterSheet,
                        ...parsed,
                        hero: {
                            ...this.characterSheet.hero,
                            ...(parsed.hero || {})
                        }
                    };
                }
            } catch (e) {
                console.error('Error loading settings', e);
            }
        }
    }
});

app.mount('#app');