/**
 * Modal component for editing the Out Ability.
 * @component
 */
app.component('out-ability-modal', {
    props: {
        /** @type {boolean} Whether the modal is visible. */
        show: Boolean,
        /** @type {Object} The hero object. */
        hero: Object
    },
    emits: ['save', 'close'],
    data() {
        return {
            text: '',
            actions: [],
            traitId: ''
        };
    },
    computed: {
        actionTypes() {
            return Object.keys(window.ABILITY_ICONS || {}).map(key => ({
                key,
                ...window.ABILITY_ICONS[key]
            }));
        },
        powers() {
            return this.hero ? this.hero.powers : [];
        },
        qualities() {
            return this.hero ? this.hero.qualities : [];
        },
        hasTraits() {
            return (this.powers && this.powers.length > 0) || (this.qualities && this.qualities.length > 0);
        }
    },
    watch: {
        show: {
            handler(newVal) {
                if (newVal && this.hero && this.hero.outAbility) {
                    this.text = this.hero.outAbility.text || '';
                    this.actions = [...(this.hero.outAbility.actions || [])];
                    this.traitId = this.hero.outAbility.traitId || '';
                }
            },
            immediate: true
        }
    },
    methods: {
        toggleAction(actionKey) {
            const idx = this.actions.indexOf(actionKey);
            if (idx > -1) {
                this.actions.splice(idx, 1);
            } else {
                this.actions.push(actionKey);
            }
        },
        handleSubmit() {
            this.$emit('save', {
                text: this.text,
                actions: this.actions,
                traitId: this.traitId
            });
            this.$emit('close');
        },
        handleClose() {
            this.$emit('close');
        }
    },
    template: `
        <div class="modal-overlay" v-if="show" @click.self="handleClose">
            <div class="modal-content wobbly-box" style="max-height: 90vh; overflow-y: auto;">
                <h2 class="comic-title">OUT ABILITY</h2>
                <p class="text-sm text-gray-500 italic mb-4">This ability is only available when your health is 0.</p>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group mb-4">
                        <label class="block font-bangers tracking-wide text-lg mb-1">DESCRIPTION</label>
                        <textarea v-model="text" class="w-full border-2 border-black p-2 font-comic text-lg rounded h-24 resize-none" placeholder="Describe what your Out ability does..."></textarea>
                    </div>

                    <div class="form-group mb-4">
                        <label class="block font-bangers tracking-wide text-lg mb-2">BASIC ACTIONS</label>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="actionType in actionTypes" :key="actionType.key" class="cursor-pointer border-2 border-black rounded p-2 flex flex-col items-center justify-center transition-colors hover:bg-gray-50" :class="{'bg-yellow-100 ring-2 ring-yellow-400': actions.includes(actionType.key)}" @click="toggleAction(actionType.key)">
                                <div class="w-8 h-8 mb-1" v-html="actionType.svg"></div>
                                <div class="text-xs font-bold uppercase">{{ actionType.label }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group mb-4">
                        <label class="block font-bangers tracking-wide text-lg mb-1">LINKED POWER / QUALITY</label>
                        <select v-model="traitId" class="w-full border-2 border-black p-2 font-comic text-lg rounded">
                            <option value="">-- None (No Dice Roll) --</option>
                            <optgroup label="Powers" v-if="powers && powers.length">
                                <option v-for="p in powers" :key="p.id" :value="p.id">{{ p.name }} (d{{ p.die }})</option>
                            </optgroup>
                            <optgroup label="Qualities" v-if="qualities && qualities.length">
                                <option v-for="q in qualities" :key="q.id" :value="q.id">{{ q.name }} (d{{ q.die }})</option>
                            </optgroup>
                        </select>
                        <p class="text-sm text-gray-500 italic mt-1">Select a Power or Quality to roll, or none for no dice.</p>
                    </div>

                    <div class="flex gap-2 mt-4">
                        <button type="button" class="comic-btn secondary flex-1" @click="handleClose">CANCEL</button>
                        <button type="submit" class="comic-btn primary flex-1">SAVE</button>
                    </div>
                </form>
            </div>
        </div>
    `
});
