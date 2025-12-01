app.component('ability-card', {
    props: ['ability', 'hero'],
    emits: ['edit'],
    data() {
        return {
            longPressTimer: null,
            isLongPress: false
        };
    },
    computed: {
        linkedTrait() {
            if (!this.ability.traitId || !this.hero) return null;
            const powers = this.hero.powers || [];
            const qualities = this.hero.qualities || [];
            return powers.find(p => p.id === this.ability.traitId) ||
                   qualities.find(q => q.id === this.ability.traitId);
        },
        traitLabel() {
            const t = this.linkedTrait;
            return t ? `${t.name} (d${t.die})` : 'No Trait Linked';
        },
        interactionLabel() {
            const map = {
                'action': 'ACTION',
                'reaction': 'REACTION',
                'inherent': 'INHERENT'
            };
            return map[this.ability.interactionType] || 'ACTION';
        },
        interactionClass() {
             const map = {
                'action': 'text-cyan',
                'reaction': 'text-purple',
                'inherent': 'text-orange'
            };
            return map[this.ability.interactionType] || 'text-cyan';
        },
        basicActionIcons() {
            if (!this.ability.actions || !window.ABILITY_ICONS) return [];
            return this.ability.actions.map(key => window.ABILITY_ICONS[key]).filter(Boolean);
        }
    },
    methods: {
        startLongPress() {
            this.isLongPress = false;
            this.longPressTimer = setTimeout(() => {
                this.isLongPress = true;
                this.$emit('edit', this.ability);
            }, 600);
        },
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
             @mousedown="startLongPress"
             @touchstart="startLongPress"
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
