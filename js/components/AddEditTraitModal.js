app.component('add-edit-trait-modal', {
    props: ['trait', 'type', 'show'],
    data() {
        return {
            id: '',
            name: '',
            die: 6
        };
    },
    watch: {
        trait: {
            handler(newVal) {
                if (newVal) {
                    this.id = newVal.id;
                    this.name = newVal.name;
                    this.die = newVal.die;
                } else {
                    this.id = '';
                    this.name = '';
                    this.die = 6;
                }
            },
            immediate: true
        }
    },
    template: `
        <div class="modal-overlay" v-if="show">
            <div class="modal-content wobbly-box">
                <h2 class="comic-title">{{ trait ? 'Edit' : 'Add' }} {{ type }}</h2>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="trait-name">Name</label>
                        <input type="text" id="trait-name" v-model="name" required>
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
                    <div class="form-actions">
                        <button type="submit" class="comic-btn plus">{{ trait ? 'Save' : 'Add' }}</button>
                        <button type="button" class="comic-btn" @click="$emit('close')">Cancel</button>
                        <button v-if="trait" type="button" class="comic-btn minus" @click="handleDelete">Delete</button>
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
                die: this.die
            });
        },
        handleDelete() {
            this.$emit('delete', { id: this.id });
            this.$emit('close');
        }
    }
});
