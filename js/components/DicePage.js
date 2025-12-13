/**
 * Component representing the Dice Page.
 * Handles dice selection, rolling, and result display with modifiers.
 * @component
 */
app.component('dice-page', {
    props: {
        /**
         * The hero object (not currently used in logic but available).
         * @type {Object}
         */
        hero: Object,
        /**
         * The initial dice selection passed from parent.
         * @type {Array<number>}
         */
        initialDice: Array
    },
    emits: ['update-dice'],
    template: `
    <div class="dice-page pb-nav">
        <!-- Dice Tray Header -->
        <div class="comic-header-box comic-header-teal">
            <h1 class="comic-title">DICE TRAY</h1>
        </div>

        <div v-if="!hero.preferences?.hideDiceTray">
            <!-- Dice Selection Area -->
            <div class="dice-selection-area">
                <div v-if="impactText" class="impact-text-overlay" :class="{ 'red-text': isCriticalFail }">{{ impactText }}</div>
                <div v-for="(die, index) in selectedDice"
                     :key="index"
                     class="die-slot-img-container"
                     :class="{ selected: activeSlot === index, shaking: isRolling }"
                     @click="openDieSelector(index)">
                    <img :src="'assets/dice/D' + die + '.png'" class="die-img" :alt="'d'+die" />
                </div>
            </div>

            <!-- Roll Button -->
            <div class="roll-button-container">
                <div class="roll-btn" @click="rollDice" :class="{ disabled: isRolling }">
                    {{ isRolling ? '...' : 'ROLL!' }}
                </div>
            </div>

            <!-- Results Area -->
            <div class="results-container" v-if="rollResults">
                <!-- Min -->
                <div class="result-box min">
                    <div class="result-label">MIN</div>
                    <div class="result-value">{{ rollResults.min }}</div>
                    <div class="result-detail">d{{ rollResults.rawRolls[0].die }}</div>
                </div>

                <!-- Mid (Effect) -->
                <div class="result-box mid">
                    <div class="result-label">MID</div>
                    <div class="result-value">{{ finalMidValue }}</div>
                    <div class="result-detail" v-if="totalModifier !== 0">
                        {{ rollResults.mid }} {{ totalModifier >= 0 ? '+' : '' }}{{ totalModifier }}
                    </div>
                    <div class="result-detail" v-else>d{{ rollResults.rawRolls[1].die }}</div>
                </div>

                <!-- Max -->
                <div class="result-box max">
                    <div class="result-label">MAX</div>
                    <div class="result-value">{{ rollResults.max }}</div>
                    <div class="result-detail">d{{ rollResults.rawRolls[2].die }}</div>
                </div>
            </div>

            <!-- Placeholder for no results -->
            <div class="results-container" v-else style="opacity: 0.5;">
                 <div class="result-box min"><div class="result-label">MIN</div><div class="result-value">-</div></div>
                 <div class="result-box mid"><div class="result-label">MID</div><div class="result-value">-</div></div>
                 <div class="result-box max"><div class="result-label">MAX</div><div class="result-value">-</div></div>
            </div>
        </div>

        <!-- Modifiers Section -->
        <div class="modifiers-section">
            <div class="modifiers-header">MODIFIERS ({{ totalModifier > 0 ? '+' : '' }}{{ totalModifier }})</div>

            <div class="modifiers-list">
                <div v-for="mod in modifiers" :key="mod.id"
                     class="modifier-chip"
                     :class="{ active: mod.active, persistent: mod.type === 'persistent', temporary: mod.type === 'temporary' }"
                     @click="toggleModifier(mod)">
                    <span>{{ mod.name }}</span>
                    <span class="modifier-value">{{ mod.value > 0 ? '+' : '' }}{{ mod.value }}</span>
                    <span class="delete-mod-btn" @click.stop="removeModifier(mod.id)">×</span>
                </div>
            </div>

            <!-- Add Modifier Form -->
            <div class="add-modifier-form">
                <input type="text" v-model="newModName" placeholder="Name (e.g. High Ground)" />
                <input type="number" v-model.number="newModValue" style="width: 50px;" placeholder="+1" />
                <select v-model="newModType">
                    <option value="temporary">Temp</option>
                    <option value="persistent">Persist</option>
                </select>
                <button class="comic-btn plus" @click="addModifier" style="padding: 0.2rem 0.5rem;">+</button>
            </div>

            <button v-if="hasTemporaryActive" class="comic-btn minus full-width" style="margin-top: 1rem;" @click="clearUsedModifiers">
                Clear Used Temp Mods
            </button>
        </div>

        <!-- Dice Selector Modal -->
        <div v-if="showDieSelector" class="dice-selector-modal" @click="closeDieSelector">
            <div class="dice-selector-content" @click.stop>
                <div v-for="size in availableDice" :key="size" class="die-option" @click="selectDie(size)">
                    <img :src="'assets/dice/D' + size + '.png'" class="die-option-img" :alt="'d'+size" />
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            /** @type {number[]} Currently selected dice sizes */
            selectedDice: this.initialDice ? [...this.initialDice] : [6, 8, 10],
            /** @type {number[]} Available die sizes to choose from */
            availableDice: [4, 6, 8, 10, 12],
            /** @type {number|null} Index of the currently active die slot for selection */
            activeSlot: null,
            /** @type {boolean} Whether the die selector modal is shown */
            showDieSelector: false,
            /** @type {Object|null} Results of the last roll */
            rollResults: null,
            /** @type {boolean} Whether dice are currently "rolling" */
            isRolling: false,
            /** @type {string|null} Text to display for impact effect */
            impactText: null,
            /** @type {string|null} The last impact text displayed, to avoid repetition */
            lastImpactText: null,
            /** @type {boolean} Whether the current roll is a critical fail */
            isCriticalFail: false,
            /** @type {Array<Object>} List of modifiers */
            modifiers: [], // { id, name, value, type, active }
            /** @type {string} Name input for new modifier */
            newModName: '',
            /** @type {number} Value input for new modifier */
            newModValue: 1,
            /** @type {string} Type input for new modifier ('temporary' or 'persistent') */
            newModType: 'temporary',
            /** @type {number|null} ID of the timeout for clearing impact text */
            impactTimeoutId: null
        };
    },
    computed: {
        /**
         * Calculates the total value of active modifiers.
         * @returns {number} The total modifier value.
         */
        totalModifier() {
            return this.modifiers
                .filter(m => m.active)
                .reduce((sum, m) => sum + m.value, 0);
        },
        /**
         * Calculates the final Mid value (Effect die + modifiers).
         * @returns {number|string} The calculated value or '-' if no roll.
         */
        finalMidValue() {
            if (!this.rollResults) return '-';
            return this.rollResults.mid + this.totalModifier;
        },
        /**
         * Checks if there are any active temporary modifiers.
         * @returns {boolean} True if any active temporary modifiers exist.
         */
        hasTemporaryActive() {
            return this.modifiers.some(m => m.active && m.type === 'temporary');
        }
    },
    methods: {
        /**
         * Opens the die selector for a specific slot.
         * @param {number} index - The index of the die slot.
         */
        openDieSelector(index) {
            this.activeSlot = index;
            this.showDieSelector = true;
        },
        /**
         * Closes the die selector.
         */
        closeDieSelector() {
            this.showDieSelector = false;
            this.activeSlot = null;
        },
        /**
         * Selects a die size for the active slot.
         * @param {number} size - The size of the die (e.g., 6).
         */
        selectDie(size) {
            if (this.activeSlot !== null) {
                this.selectedDice[this.activeSlot] = size;
                this.$emit('update-dice', this.selectedDice);
            }
            this.closeDieSelector();
        },
        /**
         * Initiates the dice roll animation and calculation.
         */
        rollDice() {
            if (this.isRolling) return;

            // Clear any existing impact text timeout
            if (this.impactTimeoutId) {
                clearTimeout(this.impactTimeoutId);
                this.impactTimeoutId = null;
            }

            this.isRolling = true;
            this.impactText = null;
            this.rollResults = null;

            // Simulate rolling time
            setTimeout(() => {
                // Secure, unbiased random roll for each die using window.crypto with rejection sampling
                const getSecureRandomIntInclusive = (min, max) => {
                    min = Math.ceil(min);
                    max = Math.floor(max);
                    if (max < min) throw new Error('Invalid range for RNG');
                    const range = max - min + 1;
                    // Prefer Web Crypto API if available
                    const cryptoObj = (typeof window !== 'undefined') && (window.crypto || window.msCrypto);
                    if (cryptoObj && cryptoObj.getRandomValues) {
                        // Determine the maximum unbiased value we can accept
                        const maxUint32 = 0xFFFFFFFF;
                        const buckets = Math.floor((maxUint32 + 1) / range);
                        const maxUnbiased = buckets * range - 1;
                        const arr = new Uint32Array(1);
                        while (true) {
                            cryptoObj.getRandomValues(arr);
                            const v = arr[0];
                            if (v <= maxUnbiased) {
                                return min + (v % range);
                            }
                            // Otherwise, retry to avoid modulo bias
                        }
                    }
                    // Fallback to Math.random if crypto is not available
                    return Math.floor(Math.random() * range) + min;
                };

                const results = this.selectedDice.map(die => {
                    return {
                        die: die,
                        value: getSecureRandomIntInclusive(1, die)
                    };
                });

                const sortedResults = [...results].sort((a, b) => a.value - b.value);

                this.rollResults = {
                    min: sortedResults[0].value,
                    mid: sortedResults[1].value,
                    max: sortedResults[2].value,
                    rawRolls: sortedResults
                };

                this.isRolling = false;
                this.determineImpactText(this.rollResults.max, results.map(r => r.value));

            }, 800);
        },
        /**
         * Determines the impact text based on the max die roll and special conditions.
         * @param {number} maxValue - The highest value rolled.
         * @param {number[]} rawValues - Array of raw dice values.
         */
        determineImpactText(maxValue, rawValues) {
            this.isCriticalFail = false; // Reset critical fail state

            // Check for Triples
            const allSame = rawValues.every(v => v === rawValues[0]);
            if (allSame) {
                this.setImpactText("TRIPLES!");
                return;
            }

            // Check for Two Natural Ones (Critical Fail)
            const onesCount = rawValues.filter(v => v === 1).length;
            if (onesCount >= 2) {
                this.isCriticalFail = true;
                const critTexts = ["CALAMITY!", "CRITICAL FAIL!"];
                // Avoid immediate repetition for crit texts too
                let critCandidates = critTexts.filter(t => t !== this.lastImpactText);
                if (critCandidates.length === 0) critCandidates = critTexts;
                this.setImpactText(critCandidates[Math.floor(Math.random() * critCandidates.length)]);
                return;
            }

            // Check for Doubles (generic)
            // Since we already checked for triples and double ones, this catches remaining pairs
            const uniqueValues = new Set(rawValues);
            if (uniqueValues.size < rawValues.length) {
                 this.setImpactText("DOUBLES!");
                 return;
            }

            // Standard Threshold Logic
            const impactOptions = [
                { threshold: 11, texts: ['KA-POW!', 'KA-BLAM!', 'BOOM!', 'SHRAK!'] },
                { threshold: 8, texts: ['CRASH!', 'KABOOM!', 'BLAM!', 'THOOM!'] },
                { threshold: 5, texts: ['BAM!', 'POW!', 'WHAM!', 'SMASH!', 'CRUNCH!'] },
                { threshold: 0, texts: ['ZAP!', 'BOINK!', 'CLANK!', 'PLINK!', 'THWACK!'] }
            ];

            // Find the highest threshold met
            const tier = impactOptions.find(i => maxValue >= i.threshold);
            const possibleTexts = tier ? tier.texts : ['POW!'];

            // Filter out the last one if possible to avoid immediate repetition
            let candidates = possibleTexts.filter(t => t !== this.lastImpactText);
            if (candidates.length === 0) candidates = possibleTexts;

            // Pick random
            const selectedText = candidates[Math.floor(Math.random() * candidates.length)];

            this.setImpactText(selectedText);
        },
        /**
         * Sets the impact text and handles repetition tracking and timeout.
         * @param {string} text - The text to display.
         */
        setImpactText(text) {
            // Clear any existing timeout to prevent premature clearing
            if (this.impactTimeoutId) {
                clearTimeout(this.impactTimeoutId);
            }

            this.impactText = text;
            this.lastImpactText = text;

            // Clear text after 1.5 seconds
            this.impactTimeoutId = setTimeout(() => {
                this.impactText = null;
                this.isCriticalFail = false;
                this.impactTimeoutId = null;
            }, 1500);
        },
        /**
         * Adds a new modifier to the list.
         */
        addModifier() {
            if (!this.newModName) return;
            this.modifiers.push({
                id: Date.now(),
                name: this.newModName,
                value: this.newModValue,
                type: this.newModType,
                active: true // Auto-activate on add
            });
            this.newModName = '';
            this.newModValue = 1;
        },
        /**
         * Toggles the active state of a modifier.
         * @param {Object} mod - The modifier object.
         */
        toggleModifier(mod) {
            mod.active = !mod.active;
        },
        /**
         * Removes a modifier from the list.
         * @param {number} id - The ID of the modifier to remove.
         */
        removeModifier(id) {
            this.modifiers = this.modifiers.filter(m => m.id !== id);
        },
        /**
         * Clears all active temporary modifiers.
         */
        clearUsedModifiers() {
            // Remove active temporary modifiers
            // Or just deactivate them? "disappear after you use them" suggests removal.
            this.modifiers = this.modifiers.filter(m => !(m.active && m.type === 'temporary'));
        }
    }
});
