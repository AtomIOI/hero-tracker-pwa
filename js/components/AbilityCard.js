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
        hero: Object
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
            return t ? `${t.name} (d${t.die})` : 'No Trait Linked';
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
         * Returns the list of icon objects for the ability's basic actions.
         * @returns {Array<{label: string, svg: string}>} Array of icon objects.
         */
        basicActionIcons() {
            if (!this.ability.actions || !window.ABILITY_ICONS) return [];
            return this.ability.actions.map(key => window.ABILITY_ICONS[key]).filter(Boolean);
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
        <div class="ability-card no-select relative"
             :class="['bg-' + ability.zone]"
             style="touch-action: manipulation;"
             @mousedown="handleInteractionStart"
             @touchstart="handleInteractionStart"
             @mouseup="cancelLongPress"
             @touchend="cancelLongPress"
             @mouseleave="cancelLongPress"
             @contextmenu.prevent>

            <!-- Header -->
            <div class="ability-card-header pattern-dots flex justify-between items-center pr-2 relative">
                <h3 class="flex-1 truncate mr-2">{{ ability.name }}</h3>

                <!-- Interaction Type Text Label -->
                <div class="absolute top-1 right-1 transform rotate-2 font-bangers tracking-wide text-lg"
                     :class="interactionClass"
                     style="text-shadow: 2px 2px 0 #000; -webkit-text-stroke: 1px #000;">
                    {{ interactionLabel }}
                </div>
            </div>

            <div class="ability-card-body flex flex-col h-full relative">
                <!-- Trait Info -->
                <div class="text-sm font-bangers tracking-wide mb-2 border-b-2 border-black/10 pb-1 w-full text-center" style="color: var(--color-magenta); text-shadow: 1px 1px 0px white;">
                    {{ traitLabel }}
                </div>

                <!-- Description -->
                <div class="flex-1 mb-2 text-sm leading-tight flex items-center justify-center text-center p-2 bg-white/50 rounded border border-black/5 w-full">
                    {{ ability.text }}
                </div>

                <!-- Action Icons Footer -->
                <div class="flex gap-2 mt-auto pt-2 border-t-2 border-black/10 justify-center w-full">
                    <div v-for="(icon, idx) in basicActionIcons" :key="idx"
                         class="w-6 h-6 text-black"
                         :title="icon.label"
                         v-html="icon.svg">
                    </div>
                </div>
            </div>
        </div>
    `
});
