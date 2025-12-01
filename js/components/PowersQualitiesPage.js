app.component('powers-qualities-page', {
    props: ['hero'],
    data() {
        return {
            activeTab: 'powers', // 'powers' or 'qualities'
            showModal: false,
            editingTrait: null
        };
    },
    computed: {
        displayedTraits() {
            return this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
        },
        currentTypeLabel() {
            return this.activeTab === 'powers' ? 'Power' : 'Quality';
        }
    },
    template: `
        <div>
            <div class="comic-header-box">
                <h1 class="comic-title">POWERS & QUALITIES</h1>
            </div>

            <div class="tabs-container">
                <button
                    class="comic-tab"
                    :class="{ active: activeTab === 'powers' }"
                    @click="activeTab = 'powers'">
                    POWERS
                </button>
                <button
                    class="comic-tab"
                    :class="{ active: activeTab === 'qualities' }"
                    @click="activeTab = 'qualities'">
                    QUALITIES
                </button>
            </div>

            <button class="comic-btn plus add-trait-btn" @click="openAddModal">
                Add New {{ currentTypeLabel }}
            </button>

            <div class="traits-grid">
                <div
                    v-for="trait in displayedTraits"
                    :key="trait.id"
                    class="trait-card wobbly-box"
                    @click="openEditModal(trait)"
                >
                    <div class="trait-name">{{ trait.name }}</div>
                    <div class="trait-die-container">
                        <img :src="'assets/dice/D' + trait.die + '.png'" :alt="'d' + trait.die" class="trait-die-icon" />
                    </div>
                </div>
            </div>

            <add-edit-trait-modal
                :show="showModal"
                :trait="editingTrait"
                :type="currentTypeLabel"
                @close="closeModal"
                @save="saveTrait"
                @delete="deleteTrait"
            ></add-edit-trait-modal>
        </div>
    `,
    methods: {
        openAddModal() {
            this.editingTrait = null;
            this.showModal = true;
        },
        openEditModal(trait) {
            this.editingTrait = trait;
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
        },
        saveTrait(traitData) {
            const list = this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
            const { id, name, die } = traitData;

            if (id) {
                // Editing existing
                const index = list.findIndex(t => t.id === id);
                if (index > -1) {
                    // Update in place to maintain reactivity if needed, or splice
                    list.splice(index, 1, { id, name, die });
                }
            } else {
                // Adding new
                const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
                list.push({ id: newId, name, die });
            }
            this.closeModal();
        },
        deleteTrait(traitIdentifier) {
            const list = this.activeTab === 'powers' ? this.hero.powers : this.hero.qualities;
            const index = list.findIndex(t => t.id === traitIdentifier.id);
            if (index > -1) {
                list.splice(index, 1);
            }
        }
    }
});
