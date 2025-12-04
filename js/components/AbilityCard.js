/**
 * Component representing a single ability card.
 * @component
 */
app.component('ability-card', {
    props: {
        /**
         * The ability object to display.
         * @type {Object}
         */
        ability: Object,
        /**
         * The hero object, containing powers and qualities.
         * @type {Object}
         */
        hero: Object,
        /**
         * Whether the ability is locked/unavailable.
         * @type {Boolean}
         */
        locked: {
            type: Boolean,
            default: false
        }
    },
    emits: ['edit', 'use'],
    data() {
        return {
            /** @type {number|null} Timer ID for long press detection */
            longPressTimer: null,
            /** @type {boolean} Flag indicating if a long press occurred */
            isLongPress: false,
            /** @type {number} Timestamp of the last interaction start */
            lastTapTime: 0,
            /** @type {number} Timestamp of the last touch event to debounce mouse events */
            lastTouchTime: 0
        };
    },
    computed: {
        /**
         * Finds the trait (Power or Quality) linked to this ability.
         * @returns {Object|null} The linked trait object or null if not found.
         */
        linkedTrait() {
            if (!this.ability.traitId || !this.hero) return null;
            const powers = this.hero.powers || [];
            const qualities = this.hero.qualities || [];
            return powers.find(p => p.id === this.ability.traitId) ||
                   qualities.find(q => q.id === this.ability.traitId);
        },
        /**
         * Generates the label for the linked trait.
         * @returns {string} The formatted label string.
         */
        traitLabel() {
            const t = this.linkedTrait;
            return t ? t.name : 'No Trait Linked';
        },
        /**
         * Returns the display label for the interaction type.
         * @returns {string} 'ACTION', 'REACTION', or 'INHERENT'.
         */
        interactionLabel() {
            const map = {
                'action': 'ACTION',
                'reaction': 'REACTION',
                'inherent': 'INHERENT'
            };
            return map[this.ability.interactionType] || 'ACTION';
        },
        /**
         * Returns the CSS class for the interaction type text color.
         * @returns {string} The CSS class name.
         */
        interactionClass() {
             const map = {
                'action': 'text-cyan',
                'reaction': 'text-purple',
                'inherent': 'text-orange'
            };
            return map[this.ability.interactionType] || 'text-cyan';
        },
        /**
         * Checks if the ability is locked based on the hero's status.
         * @returns {boolean} True if locked.
         */
        isLocked() {
            return this.locked;
        },
        /**
         * Returns the CSS class for the background based on zone.
         * Handles capitalization differences and mapping.
         * @returns {string} The CSS class name.
         */
        zoneClass() {
            if (this.isLocked) return 'bg-gray-100';
            if (!this.ability.zone) return 'bg-gray-100';
            const zone = this.ability.zone.toLowerCase();
            const map = {
                'green': 'bg-green-500',
                'yellow': 'bg-yellow-400',
                'red': 'bg-red-600' // Mapping Red to Magenta/Red as per CSS
            };
            return map[zone] || 'bg-gray-100';
        },
        /**
         * Returns the list of icon objects for the ability's basic actions.
         * @returns {Array<{label: string, svg: string}>} Array of icon objects.
         */
        basicActionIcons() {
            if (!this.ability.actions || !window.ABILITY_ICONS) return [];
            return this.ability.actions.map(key => window.ABILITY_ICONS[key]).filter(Boolean);
        },
        /**
         * Calculates the preview dice images for the ability.
         * @returns {Array<{src: string, alt: string}>} Array of dice image objects.
         */
        dicePreview() {
            if (!this.hero) return [];

            // 1. Status Die
            let statusDieVal = 6;
            const health = this.hero.health;
            if (health && health.ranges) {
                if (health.current >= health.ranges.greenMin) {
                    statusDieVal = this.hero.statusDice.green;
                } else if (health.current >= health.ranges.yellowMin) {
                    statusDieVal = this.hero.statusDice.yellow;
                } else if (health.current >= health.ranges.redMin) {
                    statusDieVal = this.hero.statusDice.red;
                }
            }

            // 2. Trait Die
            let traitDieVal = null;
            if (this.linkedTrait) {
                traitDieVal = this.linkedTrait.die;
            }

            // 3. Unknown Die

            return [
                { src: `assets/dice/D${statusDieVal}.png`, alt: `Status: d${statusDieVal}` },
                { src: traitDieVal ? `assets/dice/D${traitDieVal}.png` : 'assets/dice/unknown.svg', alt: traitDieVal ? `Trait: d${traitDieVal}` : 'Unknown Trait' },
                { src: 'assets/dice/unknown.svg', alt: 'Bonus/Min/Max' }
            ];
        }
    },
    methods: {
        /**
         * Handles interaction start (mouse down or touch start).
         * Detects double taps and starts long press timer.
         * @param {Event} event - The DOM event.
         */
        handleInteractionStart(event) {
            const now = Date.now();

            // Ignore mousedown if it closely follows a touchstart (mobile ghost clicks)
            if (event.type === 'mousedown' && (now - this.lastTouchTime < 500)) {
                return;
            }

            if (event.type === 'touchstart') {
                this.lastTouchTime = now;
            }

            if (now - this.lastTapTime < 300) {
                // Double Tap Detected
                this.$emit('use', this.ability);
                this.lastTapTime = 0; // Reset to prevent triple-tap firing
                this.cancelLongPress(); // Ensure long press doesn't fire
                return;
            }

            this.lastTapTime = now;
            this.isLongPress = false;
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.$emit('edit', this.ability);
            }, 600);
        },
        /**
         * Cancels the long press timer if the interaction ends early.
         */
        cancelLongPress() {
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }
    },
    template: `
        <div class="ability-card wobbly-box no-select relative p-2"
             :class="[zoneClass]"
             style="touch-action: manipulation;"
             @mousedown="handleInteractionStart"
             @touchstart="handleInteractionStart"
             @mouseup="cancelLongPress"
             @touchend="cancelLongPress"
             @mouseleave="cancelLongPress"
             @contextmenu.prevent>

            <!-- Locked Overlay -->
            <div v-if="isLocked" class="absolute inset-0 z-20 flex items-center justify-center rounded pointer-events-none">
                <div class="font-bangers text-8xl px-8 py-2 uppercase tracking-widest opacity-95 bg-white/10"
                     style="color: #dc2626; -webkit-text-stroke: 3px black; border: 8px solid #dc2626; border-radius: 12px; box-shadow: 0 0 0 3px black; transform: rotate(-15deg);">
                    LOCKED
                </div>
            </div>

            <!-- Content Wrapper -->
            <div class="flex flex-col h-full" :style="isLocked ? 'filter: grayscale(100%); opacity: 0.6;' : ''">
                <!-- Header -->
                <div class="ability-card-header pattern-dots flex justify-center items-center relative mb-2 pb-1 border-b-2 border-black/10" style="min-height: 40px;">
                    <!-- Centered Title -->
                    <h3 class="truncate text-center w-full pr-12" style="font-size: 1.4rem;">{{ ability.name }}</h3>

                    <!-- Interaction Type Text Label (Top Right, Smaller) -->
                    <div class="absolute top-0 right-0 font-bangers tracking-wide text-sm z-10"
                         :class="interactionClass"
                         style="text-shadow: 1px 1px 0 #000; -webkit-text-stroke: 0.5px #000; transform: translate(0, 0); top: 2px; right: 5px;">
                        {{ interactionLabel }}
                    </div>
                </div>

            <div class="ability-card-body flex flex-col h-full relative" :class="{ 'opacity-50': isLocked }">
                <div class="ability-card-body flex flex-col flex-1 relative">
                <!-- Trait Info -->
                <div class="text-sm font-bangers tracking-wide mb-2 border-b-2 border-black/10 pb-1 w-full text-center"
                     :class="{ 'text-red-600': !linkedTrait, 'text-black': linkedTrait }">
                    {{ traitLabel }}
                </div>

                <!-- Description -->
                <div class="flex-1 mb-2 font-comic font-bold text-base leading-tight flex items-center justify-center text-center p-2 bg-white/50 rounded border border-black/5 w-full"
                     style="font-weight: 700;">
                    {{ ability.text }}
                </div>

                <!-- Footer: Dice (Left) & Action Icons (Right) -->
                <div class="flex justify-between items-end mt-auto pt-2 border-t-2 border-black/10 w-full">
                    <!-- Dice Preview -->
                    <div class="flex items-center gap-1">
                        <img v-for="(die, idx) in dicePreview" :key="idx"
                             :src="die.src"
                             :alt="die.alt"
                             class="w-6 h-6 object-contain filter drop-shadow-md">
                    </div>

                    <!-- Action Icons -->
                    <div class="flex gap-2">
                        <div v-for="(icon, idx) in basicActionIcons" :key="idx"
                             class="w-6 h-6 text-black"
                             :title="icon.label"
                             v-html="icon.svg">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});
