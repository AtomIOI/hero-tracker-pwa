app.component('add-edit-ability-modal', {
    props: ['ability', 'show'],
    data() {
        return {
            id: '',
            name: '',
            die: 6,
            zone: 'green',
            text: ''
        };
    },
    watch: {
        ability: {
            handler(newVal) {
                if (newVal) {
                    this.id = newVal.id;
                    this.name = newVal.name;
                    this.die = newVal.die;
                    this.zone = newVal.zone;
                    this.text = newVal.text;
                } else {
                    this.id = '';
                    this.name = '';
                    this.die = 6;
                    this.zone = 'green';
                    this.text = '';
                }
            },
            immediate: true
        }
    },
    template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal-content wobbly-box">
                <h2 class="comic-title">{{ ability ? 'Edit' : 'Add' }} Ability</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="ability-name">Name</label>
                        <input type="text" id="ability-name" v-model="name" required>
                    </div>
                    <div class="form-group">
                        <label>Die</label>
                        <div class="dice-selector">
                            <div v-for="size in [4, 6, 8, 10, 12]"
                                 :key="size"
                                 class="form-die-option"
                                 :class="{ selected: die === size }"
                                 @click="die = size">
                                <img :src="'assets/dice/D' + size + '.png'" :alt="'d' + size">
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="ability-zone">Zone</label>
                        <select id="ability-zone" v-model="zone">
                            <option value="green">Green</option>
                            <option value="yellow">Yellow</option>
                            <option value="red">Red</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="ability-text">Description</label>
                        <textarea id="ability-text" v-model="text"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="comic-btn plus">{{ ability ? 'Save' : 'Add' }}</button>
                        <button type="button" class="comic-btn" @click="$emit('close')">Cancel</button>
                        <button v-if="ability" type="button" class="comic-btn minus" @click="handleDelete">Delete</button>
                    </div>
                </form>
            </div>
        </div>
    `,
    methods: {
        handleSubmit() {
            this.$emit('save', {
                id: this.id,
                name: this.name,
                die: this.die,
                zone: this.zone,
                text: this.text
            });
        },
        handleDelete() {
            this.$emit('delete', { id: this.id });
            this.$emit('close');
        }
    }
});