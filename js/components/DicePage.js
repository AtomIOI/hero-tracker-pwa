app.component('dice-page', {
    props: ['hero'],
    template: `
    <div class="dice-page pb-nav">
        <!-- Dice Tray Header -->
        <div class="dice-tray-header wobbly-box">
            DICE TRAY
        </div>

        <!-- Dice Selection Area -->
        <div class="dice-selection-area">
            <div v-for="(die, index) in selectedDice"
                 :key="index"
                 class="die-slot"
                 :class="{ selected: activeSlot === index }"
                 @click="openDieSelector(index)">
                d{{ die }}
            </div>
        </div>

        <!-- Roll Button -->
        <div class="roll-button-container">
            <div class="roll-btn" @click="rollDice">
                ROLL!
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
                    d{{ size }}
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            selectedDice: [6, 8, 10], // Default dice
            availableDice: [4, 6, 8, 10, 12],
            activeSlot: null,
            showDieSelector: false,
            rollResults: null,
            modifiers: [], // { id, name, value, type, active }
            newModName: '',
            newModValue: 1,
            newModType: 'temporary'
        };
    },
    computed: {
        totalModifier() {
            return this.modifiers
                .filter(m => m.active)
                .reduce((sum, m) => sum + m.value, 0);
        },
        finalMidValue() {
            if (!this.rollResults) return '-';
            return this.rollResults.mid + this.totalModifier;
        },
        hasTemporaryActive() {
            return this.modifiers.some(m => m.active && m.type === 'temporary');
        }
    },
    methods: {
        openDieSelector(index) {
            this.activeSlot = index;
            this.showDieSelector = true;
        },
        closeDieSelector() {
            this.showDieSelector = false;
            this.activeSlot = null;
        },
        selectDie(size) {
            if (this.activeSlot !== null) {
                this.selectedDice[this.activeSlot] = size;
            }
            this.closeDieSelector();
        },
        rollDice() {
            const results = this.selectedDice.map(die => {
                return {
                    die: die,
                    value: Math.floor(Math.random() * die) + 1
                };
            });

            // Sort by value to find Min, Mid, Max
            // Note: If duplicates exist, standard numeric sort works.
            // SCRPG sorting: If ties exist, player usually chooses which physical die represents which slot,
            // but effectively for value purposes, it's just sorted numbers.
            const sortedValues = results.map(r => r.value).sort((a, b) => a - b);

            // Raw rolls sorted for display matching logic
            // We want to keep track of which physical die size went where?
            // The prompt image shows "Min: d2, d3, 1 Total: 6" which was confusing but clarified as just "one number".
            // The visual requirement shows "d8, d12" etc.
            // If I roll d4(4), d8(4), d12(2).
            // Sorted: 2 (d12), 4 (d4), 4 (d8).
            // Min: 2 (from d12). Mid: 4 (from d4?). Max: 4 (from d8?).
            // Strictly speaking, sorting the *values* is enough for the math.
            // But visually I want to show which die rolled what if possible.

            // Let's attach original die size to the sorted values
            const sortedResults = [...results].sort((a, b) => a.value - b.value);

            this.rollResults = {
                min: sortedResults[0].value,
                mid: sortedResults[1].value,
                max: sortedResults[2].value,
                rawRolls: sortedResults // Array of { die, value } ordered min->max
            };
        },
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
        toggleModifier(mod) {
            mod.active = !mod.active;
        },
        removeModifier(id) {
            this.modifiers = this.modifiers.filter(m => m.id !== id);
        },
        clearUsedModifiers() {
            // Remove active temporary modifiers
            // Or just deactivate them? "disappear after you use them" suggests removal.
            this.modifiers = this.modifiers.filter(m => !(m.active && m.type === 'temporary'));
        }
    }
});
