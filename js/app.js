/**
 * Main Vue Application instance.
 * Initializes the application state, handles global methods, and manages data persistence.
 */
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            /**
             * The main character sheet data structure.
             * @type {Object}
             */
            characterSheet: {
                meta: {
                    version: '1.0',
                    timestamp: Date.now()
                },
                hero: {
                    issues: {
                        current: '#1',
                        past: [],
                        collections: []
                    },
                    playerName: 'Player One',
                    name: 'Super Hero',
                    alias: 'The Masked Avenger',
                    archetype: 'Generic',
                    powerSource: 'Experimentation',
                    personality: 'Brave and bold',
                    background: 'A mysterious past...',
                    principles: [
                        { name: 'Principle of Destiny', duringRoleplay: 'You are destined for greatness.', minorTwist: 'A small setback occurs.', majorTwist: 'Your destiny is called into question.' },
                        { name: 'Principle of Justice', duringRoleplay: 'Justice must be served.', minorTwist: 'The law is complicated.', majorTwist: 'You must break the law to save it.' }
                    ],
                    gender: 'Unknown',
                    age: 25,
                    height: '6\'0"',
                    profileImage: null,
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
            /** @type {boolean} Controls visibility of the Add/Edit Ability Modal */
            showAddEditAbilityModal: false,
            /** @type {boolean} Controls visibility of the Issue Modal */
            showIssueModal: false,
            /** @type {Object|null} The ability currently being edited */
            editingAbility: null,
            /** @type {string} Current navigation page identifier */
            currentPage: 'home',
            /** @type {string} Error message related to profile image upload */
            profileImageError: '',
            /** @type {boolean} Flag indicating if an image is being processed */
            isProcessingImage: false,
            /** @type {Array<number>} Current selection of dice for the Dice Page */
            diceSelection: [6, 6, 6]
        };
    },
    computed: {
        /**
         * Calculates the health percentage.
         * @returns {number} Percentage (0-100).
         */
        healthPercentage() {
            if (this.characterSheet.hero.health.max === 0) return 0;
            return (this.characterSheet.hero.health.current / this.characterSheet.hero.health.max) * 100;
        },
        /**
         * Returns the list of abilities to display.
         * @returns {Array<Object>} List of abilities.
         */
        displayedAbilities() {
            return this.characterSheet.hero.abilities;
        },
        /**
         * Filters abilities for the Green zone.
         * @returns {Array<Object>} Green zone abilities.
         */
        abilitiesGreen() {
            return this.characterSheet.hero.abilities.filter(a => a.zone === 'green');
        },
        /**
         * Filters abilities for the Yellow zone.
         * @returns {Array<Object>} Yellow zone abilities.
         */
        abilitiesYellow() {
            return this.characterSheet.hero.abilities.filter(a => a.zone === 'yellow');
        },
        /**
         * Filters abilities for the Red zone.
         * @returns {Array<Object>} Red zone abilities.
         */
        abilitiesRed() {
            return this.characterSheet.hero.abilities.filter(a => a.zone === 'red');
        }
    },
    mounted() {
        this.loadSettings();
    },
    methods: {
        /**
         * Returns a status message based on current health percentage.
         * @returns {string} Status message.
         */
        getStatusMessage() {
            const pct = this.healthPercentage;
            if (pct >= 75) return "READY FOR ACTION!";
            if (pct >= 35) return "I CAN KEEP GOING!";
            if (pct >= 1) return "I NEED BACKUP!";
            return "DOWN FOR THE COUNT!";
        },
        /**
         * Changes the current health by a specified amount.
         * @param {number} amount - The amount to change health by.
         */
        changeHealth(amount) {
            const newHealth = this.characterSheet.hero.health.current + amount;
            if (newHealth >= 0 && newHealth <= this.characterSheet.hero.health.max) {
                this.characterSheet.hero.health.current = newHealth;
            }
        },
        /**
         * Changes the current hero points by a specified amount.
         * @param {number} amount - The amount to change hero points by.
         */
        changeHeroPoints(amount) {
            const newHeroPoints = this.characterSheet.hero.heroPoints.current + amount;
            if (newHeroPoints >= 0 && newHeroPoints <= this.characterSheet.hero.heroPoints.max) {
                this.characterSheet.hero.heroPoints.current = newHeroPoints;
            }
        },
        /**
         * Changes the global modifier by a specified amount.
         * @param {number} amount - The amount to change the modifier by.
         */
        changeModifier(amount) {
            this.characterSheet.hero.modifier.current += amount;
        },
        /**
         * Returns the CSS class for a health bar segment.
         * @param {number} segmentNumber - The index of the segment.
         * @returns {string} CSS class name.
         */
        getSegmentClass(segmentNumber) {
            const pct = this.healthPercentage;
            // Use the lower bound of the segment (segmentNumber - 1) * 10
            // e.g., Segment 1 (0-10%) lights up if pct > 0
            const segmentLowerBound = (segmentNumber - 1) * 10;
            let isFilled = pct > segmentLowerBound;

            // Determine zone thresholds percentages
            const max = this.characterSheet.hero.health.max;
            let greenMinPct = 75;
            let yellowMinPct = 35;
            if (max > 0) {
                greenMinPct = (this.characterSheet.hero.health.ranges.greenMin / max) * 100;
                yellowMinPct = (this.characterSheet.hero.health.ranges.yellowMin / max) * 100;
            }

            // Determine segment color based on its position relative to zone thresholds.
            // We use the segment's upper bound (segmentNumber * 10) to determine if it falls into a higher zone.
            // But to ensure the "entry" segment is colored correctly, we check if the segment *contains* the threshold.
            // Actually, simpler logic: If the segment represents a health value that is in the green zone, it should be green.
            // Let's use the segment's upper bound percentage as a proxy.
            // Segment 8 (70-80). Upper 80. If 80 > greenMinPct (73.3), it *could* be green.
            // But Segment 7 (60-70). Upper 70. 70 < 73.3. Yellow.
            // This logic worked in manual trace.

            const segmentUpperBound = segmentNumber * 10;

            let color = 'red';
            if (segmentUpperBound >= greenMinPct) color = 'green';
            else if (segmentUpperBound >= yellowMinPct) color = 'yellow';

            // New: Enforce visibility based on Gyro Status
            const status = this.getGyroStatus(); // 'green', 'yellow', 'red', 'out'

            if (isFilled) {
                if (color === 'green' && status !== 'green') {
                    isFilled = false;
                } else if (color === 'yellow' && (status === 'red' || status === 'out')) {
                    isFilled = false;
                } else if (color === 'red' && status === 'out') {
                    isFilled = false;
                }
            }

            return isFilled ? `filled-${color}` : `empty-${color}`;
        },
        /**
         * Opens the modal to add a new ability.
         */
        openAddAbilityModal() {
            this.editingAbility = null;
            this.showAddEditAbilityModal = true;
        },
        /**
         * Opens the modal to edit an existing ability.
         * @param {Object} ability - The ability to edit.
         */
        openEditAbilityModal(ability) {
            this.editingAbility = ability;
            this.showAddEditAbilityModal = true;
        },
        /**
         * Closes the ability add/edit modal.
         */
        closeAddEditAbilityModal() {
            this.showAddEditAbilityModal = false;
        },
        /**
         * Saves an ability (add or update).
         * @param {Object} abilityData - The ability data to save.
         */
        saveAbility(abilityData) {
            const { id, name, zone, text, traitId, actions, interactionType } = abilityData;
            const abilityIndex = this.characterSheet.hero.abilities.findIndex(a => a.id === id);

            const newAbility = {
                id: id || name.toLowerCase().replace(/\s+/g, '-'),
                name,
                zone,
                text,
                traitId,
                actions,
                interactionType
            };

            if (abilityIndex > -1) { // Editing existing ability
                this.characterSheet.hero.abilities.splice(abilityIndex, 1, newAbility);
            } else { // Adding new ability
                this.characterSheet.hero.abilities.push(newAbility);
            }
            this.closeAddEditAbilityModal();
        },
        /**
         * Deletes an ability.
         * @param {Object} abilityIdentifier - Object containing the ID of the ability to delete.
         */
        deleteAbility(abilityIdentifier) {
            const abilityId = abilityIdentifier.id;
            this.characterSheet.hero.abilities = this.characterSheet.hero.abilities.filter(a => a.id !== abilityId);
        },
        /**
         * Determines the current gyro status (zone) based on health.
         * @returns {string} 'green', 'yellow', 'red', or 'out'.
         */
        getGyroStatus() {
            const health = this.characterSheet.hero.health;
            const ranges = health.ranges;
            if (health.current >= ranges.greenMin) return 'green';
            if (health.current >= ranges.yellowMin) return 'yellow';
            if (health.current >= ranges.redMin) return 'red';
            return 'out';
        },
        /**
         * Checks if an ability is available based on current health status.
         * @param {Object} ability - The ability to check.
         * @returns {boolean} True if available.
         */
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
        /**
         * Sets the current navigation page.
         * @param {string} page - The page identifier.
         */
        setPage(page) {
            this.currentPage = page;
        },
        /**
         * Updates the health range thresholds based on max health.
         */
        updateHealthRanges() {
            const max = this.characterSheet.hero.health.max;
            this.characterSheet.hero.health.ranges.greenMin = Math.floor(max * 0.75);
            this.characterSheet.hero.health.ranges.yellowMin = Math.floor(max * 0.35);
            this.characterSheet.hero.health.ranges.redMin = 1;
        },

        /**
         * Closes the Issue Modal.
         */
        closeIssueModal() {
            this.showIssueModal = false;
        },
        /**
         * Handles the profile image file upload event.
         * Processes, resizes, and saves the image as a Data URL.
         * @param {Event} event - The input change event.
         */
        async handleProfileImageUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            this.profileImageError = '';
            this.isProcessingImage = true;
            try {
                const dataUrl = await this.resizeImageFile(file, 512, 0.8);
                // Final size guard (~1.5 MB)
                const MAX_BYTES = Math.floor(1.5 * 1024 * 1024);
                // Rough check: base64 expands ~33%. Convert to approx bytes length.
                const approxBytes = Math.ceil((dataUrl.length - 'data:image/jpeg;base64,'.length) * 3 / 4);
                if (approxBytes > MAX_BYTES) {
                    this.profileImageError = `Compressed image is still too large (${(approxBytes / (1024*1024)).toFixed(2)} MB). Please choose a smaller image.`;
                    return;
                }
                this.characterSheet.hero.profileImage = dataUrl;
            } catch (err) {
                console.error('Image processing failed', err);
                this.profileImageError = 'Could not process image. Please try a different file.';
            } finally {
                this.isProcessingImage = false;
            }
        },
        /**
         * Resizes an image file into a JPEG Data URL.
         * @param {File} file - The image file.
         * @param {number} [maxDim=512] - The maximum dimension (width or height).
         * @param {number} [quality=0.8] - The JPEG quality (0.0 to 1.0).
         * @returns {Promise<string>} A promise resolving to the Data URL.
         */
        resizeImageFile(file, maxDim = 512, quality = 0.8) {
            return new Promise((resolve, reject) => {
                const fr = new FileReader();
                fr.onerror = () => reject(new Error('File read error'));
                fr.onload = () => {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            let { width, height } = img;
                            const scale = Math.min(1, maxDim / Math.max(width, height));
                            const targetW = Math.max(1, Math.round(width * scale));
                            const targetH = Math.max(1, Math.round(height * scale));
                            const canvas = document.createElement('canvas');
                            canvas.width = targetW;
                            canvas.height = targetH;
                            const ctx = canvas.getContext('2d');
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = 'high';
                            ctx.drawImage(img, 0, 0, targetW, targetH);
                            if (canvas.toBlob) {
                                canvas.toBlob((blob) => {
                                    if (!blob) {
                                        // Fallback to dataURL if blob failed
                                        try {
                                            const dataUrl = canvas.toDataURL('image/jpeg', quality);
                                            resolve(dataUrl);
                                        } catch (e) {
                                            reject(e);
                                        }
                                        return;
                                    }
                                    const fr2 = new FileReader();
                                    fr2.onload = () => resolve(fr2.result);
                                    fr2.onerror = () => reject(new Error('Blob read error'));
                                    fr2.readAsDataURL(blob);
                                }, 'image/jpeg', quality);
                            } else {
                                // iOS Safari fallback
                                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                                resolve(dataUrl);
                            }
                        } catch (e) {
                            reject(e);
                        }
                    };
                    img.onerror = () => reject(new Error('Image load error'));
                    img.src = fr.result;
                };
                fr.readAsDataURL(file);
            });
        },
        /**
         * Clears the current profile image.
         */
        clearProfileImage() {
            this.characterSheet.hero.profileImage = null;
            this.profileImageError = '';
        },

        /**
         * Saves the current settings to localStorage.
         */
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
        /**
         * Updates the global dice selection state.
         * @param {Array<number>} newDice - The new dice selection.
         */
        updateDiceSelection(newDice) {
            this.diceSelection = [...newDice];
        },

        /**
         * Prepares dice and navigates to the Dice page to use an ability.
         * @param {Object} ability - The ability to use.
         */
        handleAbilityUse(ability) {
            // 1. Check availability
            if (!this.isAbilityAvailable(ability)) return;

            // 2. Determine Status Die
            const gyro = this.getGyroStatus();
            if (gyro === 'out') return; // Should be covered by isAbilityAvailable but extra safety

            // Map status to die value
            const statusDice = this.characterSheet.hero.statusDice; // {green: 6, yellow: 8, red: 10}
            let statusDieVal = 6;
            if (gyro === 'green') statusDieVal = statusDice.green;
            else if (gyro === 'yellow') statusDieVal = statusDice.yellow;
            else if (gyro === 'red') statusDieVal = statusDice.red;

            // 3. Determine Effect Die (Trait)
            let effectDieVal = 6; // Default
            if (ability.traitId) {
                const trait = this.characterSheet.hero.powers.find(p => p.id === ability.traitId) ||
                              this.characterSheet.hero.qualities.find(q => q.id === ability.traitId);
                if (trait) {
                    effectDieVal = trait.die;
                }
            }

            // 4. Preserve 3rd Die
            const thirdDieVal = this.diceSelection[2] || 6;

            // 5. Update state and navigate
            this.diceSelection = [statusDieVal, effectDieVal, thirdDieVal];
            this.setPage('dice');
        },

        /**
         * Loads settings from localStorage and merges with default state.
         * Handles data migration if necessary.
         */
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

                    // Migration: Ensure principles is an array of 2 objects
                    if (!Array.isArray(this.characterSheet.hero.principles) || this.characterSheet.hero.principles.length !== 2) {
                        console.log('Resetting principles to default structure');
                        this.characterSheet.hero.principles = [
                            { name: 'Principle of Destiny', duringRoleplay: 'You are destined for greatness.', minorTwist: 'A small setback occurs.', majorTwist: 'Your destiny is called into question.' },
                            { name: 'Principle of Justice', duringRoleplay: 'Justice must be served.', minorTwist: 'The law is complicated.', majorTwist: 'You must break the law to save it.' }
                        ];
                    }

                    // Migration: Ensure issues object exists
                    if (!this.characterSheet.hero.issues) {
                        this.characterSheet.hero.issues = {
                            current: '#1',
                            past: [],
                            collections: []
                        };
                    }
                }
            } catch (e) {
                console.error('Error loading settings', e);
            }
        }
    }
});

// Defer mounting until all components are registered (see index.html)
window.__heroApp = app;
