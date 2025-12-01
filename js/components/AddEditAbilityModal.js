app.component('add-edit-ability-modal', {
    props: ['ability', 'show', 'hero'],
    emits: ['save', 'delete', 'close'],
    data() {
        return {
            id: '',
            name: '',
            zone: 'green',
            text: '',
            traitId: '', // ID of the linked Power or Quality
            actions: [], // Array of strings: ['attack', 'boost', ...]
            interactionType: 'action' // 'action', 'reaction', 'inherent'
        };
    },
    computed: {
        actionTypes() {
            return Object.keys(window.ABILITY_ICONS).map(key => ({
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
        ability: {
            handler(newVal) {
                if (newVal) {
                    this.id = newVal.id;
                    this.name = newVal.name;
                    this.zone = newVal.zone || 'green';
                    this.text = newVal.text;
                    this.traitId = newVal.traitId || '';
                    this.actions = Array.isArray(newVal.actions) ? [...newVal.actions] : [];
                    this.interactionType = newVal.interactionType || 'action';
                } else {
                    this.resetForm();
                }
            },
            immediate: true
        }
    },
    methods: {
        resetForm() {
            this.id = '';
            this.name = '';
            this.zone = 'green';
            this.text = '';
            this.traitId = '';
            this.actions = [];
            this.interactionType = 'action';
        },
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
                id: this.id,
                name: this.name,
                zone: this.zone,
                text: this.text,
                traitId: this.traitId,
                actions: this.actions,
                interactionType: this.interactionType
            });
        },
        handleDelete() {
            this.$emit('delete', { id: this.id });
            this.$emit('close');
        }
    },
    template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal-content wobbly-box" style="max-height: 90vh; overflow-y: auto;">
                <h2 class="comic-title">{{ ability ? 'Edit' : 'Add' }} Ability</h2>
                <form @submit.prevent="handleSubmit">

                    <div class="form-group">
                        <label for="ability-name">Name</label>
                        <input type="text" id="ability-name" v-model="name" required class="w-full border-2 border-black p-2 font-comic text-lg rounded">
                    </div>

                    <div class="form-group">
                        <label>Linked Power / Quality</label>
                        <select v-model="traitId" class="w-full border-2 border-black p-2 font-comic text-lg rounded">
                            <option value="">-- None --</option>
                            <optgroup label="Powers" v-if="powers && powers.length">
                                <option v-for="p in powers" :key="p.id" :value="p.id">
                                    {{ p.name }} (d{{ p.die }})
                                </option>
                            </optgroup>
                            <optgroup label="Qualities" v-if="qualities && qualities.length">
                                <option v-for="q in qualities" :key="q.id" :value="q.id">
                                    {{ q.name }} (d{{ q.die }})
                                </option>
                            </optgroup>
                        </select>
                        <p class="text-sm text-gray-500 italic mt-1" v-if="!hasTraits">
                            No Powers or Qualities found. Add some in the P&Q tab first!
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Zone</label>
                        <div class="flex gap-2">
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="zone" value="green" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-green-500 peer-checked:text-white font-bangers tracking-wide">
                                    GREEN
                                </div>
                            </label>
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="zone" value="yellow" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-yellow-400 peer-checked:text-black font-bangers tracking-wide">
                                    YELLOW
                                </div>
                            </label>
                            <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="zone" value="red" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-red-600 peer-checked:text-white font-bangers tracking-wide">
                                    RED
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Interaction Type</label>
                        <div class="flex gap-2">
                             <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="interactionType" value="action" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-blue-500 peer-checked:text-white font-bold text-sm">
                                    ACTION
                                </div>
                            </label>
                             <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="interactionType" value="reaction" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-purple-500 peer-checked:text-white font-bold text-sm">
                                    REACTION
                                </div>
                            </label>
                             <label class="flex-1 cursor-pointer">
                                <input type="radio" v-model="interactionType" value="inherent" class="hidden peer">
                                <div class="border-2 border-black p-2 text-center rounded bg-gray-100 peer-checked:bg-orange-500 peer-checked:text-white font-bold text-sm">
                                    INHERENT
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Basic Actions</label>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="type in actionTypes" :key="type.key"
                                class="cursor-pointer border-2 border-black rounded p-2 flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                                :class="{'bg-yellow-100 ring-2 ring-yellow-400': actions.includes(type.key)}"
                                @click="toggleAction(type.key)">
                                <div class="w-8 h-8 mb-1" v-html="type.svg"></div>
                                <div class="text-xs font-bold uppercase">{{ type.label }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="ability-text">Description</label>
                        <textarea id="ability-text" v-model="text" class="w-full border-2 border-black p-2 font-comic text-lg rounded h-24 resize-none"></textarea>
                    </div>

                    <div class="flex gap-4 mt-4">
                        <button type="submit" class="comic-btn plus flex-1">{{ ability ? 'SAVE' : 'ADD' }}</button>
                        <button type="button" class="comic-btn flex-1" @click="$emit('close')">CANCEL</button>
                    </div>
                     <button v-if="ability" type="button" class="comic-btn minus w-full mt-4" @click="handleDelete">DELETE ABILITY</button>
                </form>
            </div>
        </div>
    `
});
