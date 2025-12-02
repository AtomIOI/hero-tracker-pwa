/**
 * Component representing the Issue Tracker Modal.
 * Manages Current Issue, Past Issues, and Collections.
 */
app.component('issue-modal', {
    props: {
        hero: Object,
        show: Boolean
    },
    emits: ['close'],
    data() {
        return {
            collectionName: '',
            expandedCollectionIndex: -1,
            editingCollectionIndex: -1,
            editCollectionName: '',
            collectionPressTimer: null,
            collectionToDeleteIndex: null,
            confirmDelete: false
        };
    },
    computed: {
        canCreateCollection() {
            // Check if there are exactly 5 non-empty past issues
            return this.hero.issues.past.filter(issue => issue && issue.trim() !== '').length === 5;
        },
        pastIssues() {
            return this.hero.issues.past;
        },
        pastIssuesCount() {
            return this.hero.issues.past.filter(i => i && i.trim().length > 0).length;
        }
    },
    methods: {
        close() {
            this.$emit('close');
            // Reset local state
            this.collectionName = '';
            this.expandedCollectionIndex = -1;
            this.editingCollectionIndex = -1;
            this.confirmDelete = false;
        },
        saveAndClose() {
             if (window.vm && window.vm.saveSettings) {
                 window.vm.saveSettings();
             }
             this.close();
        },
        updatePastIssue(index, value) {
            while (this.hero.issues.past.length <= index) {
                this.hero.issues.past.push('');
            }
            this.hero.issues.past[index] = value;
        },
        ensurePastIssuesLength() {
             if (this.hero.issues.past.length > 5) {
                this.hero.issues.past = this.hero.issues.past.slice(0, 5);
             }
        },
        createCollection() {
            if (!this.collectionName.trim()) {
                alert('Please enter a collection name.');
                return;
            }

            const newCollection = {
                name: this.collectionName,
                issues: [...this.hero.issues.past]
            };

            this.hero.issues.collections.push(newCollection);
            this.hero.issues.past = []; // Clear past issues
            this.collectionName = '';
        },
        toggleCollection(index) {
            if (this.expandedCollectionIndex === index) {
                this.expandedCollectionIndex = -1;
            } else {
                this.expandedCollectionIndex = index;
            }
        },
        getCollectionStyle(index) {
            const styles = [
                'bg-yellow-400',
                'bg-green-500',
                'bg-blue-500',
                'bg-orange-500',
                'bg-purple-500'
            ];
            // Add pattern-dots and ensure text is standard ink (black) which works on these comic colors
            return `${styles[index % styles.length]} pattern-dots text-black`;
        },
        getIssueNumberStyle(index) {
            // Rotate through theme colors for the issue numbers
            const colors = ['text-cyan', 'text-purple', 'text-orange', 'text-red-600'];
            return colors[index % colors.length];
        },

        // Long Press Logic for Collections
        startCollectionPress(index) {
            this.collectionPressTimer = setTimeout(() => {
                this.openEditCollection(index);
                this.collectionPressTimer = null;
            }, 1000);
        },
        cancelCollectionPress() {
            if (this.collectionPressTimer) {
                clearTimeout(this.collectionPressTimer);
                this.collectionPressTimer = null;
            }
        },

        openEditCollection(index) {
            this.editingCollectionIndex = index;
            this.editCollectionName = this.hero.issues.collections[index].name;
            this.confirmDelete = false;
        },
        saveCollectionEdit() {
            if (this.editingCollectionIndex > -1) {
                this.hero.issues.collections[this.editingCollectionIndex].name = this.editCollectionName;
                this.editingCollectionIndex = -1;
            }
        },
        cancelCollectionEdit() {
            this.editingCollectionIndex = -1;
            this.confirmDelete = false;
        },
        deleteCollection() {
            if (this.confirmDelete) {
                this.hero.issues.collections.splice(this.editingCollectionIndex, 1);
                this.editingCollectionIndex = -1;
                this.confirmDelete = false;
            } else {
                this.confirmDelete = true;
            }
        }
    },
    watch: {
        show(val) {
            if (val) {
                this.ensurePastIssuesLength();
            }
        }
    },
    template: `
        <teleport to="body">
            <div v-if="show" class="modal-overlay" @click.self="close">
                <div class="modal-content wobbly-box bg-dots relative" style="max-height: 90vh; overflow-y: auto;">
                    <div class="comic-header-box mb-4">
                        <h2 class="comic-title text-3xl">ISSUE TRACKER</h2>
                    </div>

                    <!-- Current Issue Section -->
                    <div class="mb-6">
                        <div class="section-label mb-2">CURRENT ISSUE</div>
                        <input type="text"
                               v-model="hero.issues.current"
                               class="w-full border-2 border-black p-2 font-comic text-xl rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] current-issue-input"
                               placeholder="#1">
                    </div>

                    <!-- Past Issues Section -->
                    <div class="mb-6">
                        <div class="section-label mb-2">PAST ISSUES ({{ pastIssuesCount }}/5)</div>
                        <div class="flex flex-col gap-3">
                            <div v-for="n in 5" :key="n" class="relative">
                                <!-- UPDATED: Using inline styles for positioning -->
                                <span class="font-bangers text-gray-500"
                                      style="position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); pointer-events: none;">#{{ n }}</span>
                                <!-- UPDATED: Adjusted padding via inline style -->
                                <input type="text"
                                       :value="hero.issues.past[n-1] || ''"
                                       @input="updatePastIssue(n-1, $event.target.value)"
                                       class="w-full border-2 border-black p-2 font-comic text-lg rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] past-issue-input"
                                       style="padding-right: 2.5rem;"
                                       placeholder="Enter Past Issue...">
                            </div>
                        </div>
                    </div>

                    <!-- Create Collection Section -->
                    <div class="mb-6 p-4 border-2 border-black border-dashed bg-white/50 rounded" v-if="canCreateCollection">
                        <h3 class="font-bangers text-xl mb-2">ARCHIVE PAST ISSUES</h3>
                        <div class="flex gap-2">
                            <input type="text"
                                   v-model="collectionName"
                                   class="flex-1 border-2 border-black p-2 font-comic rounded"
                                   placeholder="Collection Name...">
                            <button class="comic-btn primary create-collection-btn" @click="createCollection">CREATE</button>
                        </div>
                    </div>

                    <!-- Collections Section -->
                    <div class="mb-4">
                        <div class="section-label mb-2">COLLECTIONS</div>
                        <div v-if="hero.issues.collections.length === 0" class="text-center font-comic italic text-gray-500">
                            No collections yet.
                        </div>
                        <div class="flex flex-col gap-3">
                            <div v-for="(collection, index) in hero.issues.collections" :key="index"
                                 class="wobbly-box bg-white p-2 cursor-pointer select-none transition-transform active:scale-95"
                                 @click="toggleCollection(index)"
                                 @mousedown="startCollectionPress(index)"
                                 @touchstart="startCollectionPress(index)"
                                 @mouseup="cancelCollectionPress"
                                 @touchend="cancelCollectionPress"
                                 @mouseleave="cancelCollectionPress">

                                <div class="transition-colors p-2 rounded border-2 border-black border-dashed"
                                     :class="getCollectionStyle(index)"
                                     style="position: relative; display: flex; justify-content: center; align-items: center;">

                                    <!-- UPDATED: Count on left, black text, inline styles -->
                                    <span class="font-bangers text-xl text-black"
                                          style="position: absolute; left: 0.5rem; z-index: 10;">({{ collection.issues.length }})</span>

                                    <!-- Centered Name -->
                                    <span class="font-bangers text-xl tracking-wide text-center"
                                          style="z-index: 10;">{{ collection.name }}</span>
                                </div>

                                <!-- Expanded View -->
                                <div v-if="expandedCollectionIndex === index" class="mt-3 pt-2 border-t-2 border-black/10 text-left pl-4">
                                    <ul class="font-comic text-sm" style="list-style-type: none; padding: 0; margin: 0;">
                                        <li v-for="(issue, i) in collection.issues" :key="i" class="mb-1 flex items-center">
                                            <span class="font-bangers text-lg mr-2" :class="getIssueNumberStyle(i)">#{{ i + 1 }}</span>
                                            <span>{{ issue }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-4 mt-6">
                        <button class="comic-btn bg-red text-white" @click="close">EXIT</button>
                        <button class="comic-btn primary" @click="saveAndClose">SAVE</button>
                    </div>
                </div>
            </div>

            <!-- Edit Collection Modal (Nested) -->
             <div v-if="editingCollectionIndex > -1" class="modal-overlay z-50" @click.self="cancelCollectionEdit">
                <div class="modal-content wobbly-box bg-white relative">
                    <div class="section-label mb-4 bg-yellow-400">EDIT COLLECTION</div>

                    <div class="mb-4">
                        <label class="block font-bangers mb-1">NAME</label>
                        <input type="text" v-model="editCollectionName" class="w-full border-2 border-black p-2 font-comic rounded">
                    </div>

                    <div class="mb-4">
                         <label class="block font-bangers mb-1">ISSUES</label>
                         <div class="max-h-40 overflow-y-auto border-2 border-black p-2 rounded bg-gray-50">
                            <div v-for="(issue, i) in hero.issues.collections[editingCollectionIndex].issues" :key="i" class="mb-2 last:mb-0">
                                <input type="text" v-model="hero.issues.collections[editingCollectionIndex].issues[i]" class="w-full border border-gray-400 p-1 font-comic text-sm rounded">
                            </div>
                         </div>
                    </div>

                    <div class="flex justify-between gap-4 mt-4">
                        <button class="comic-btn bg-red-600 text-white hover:bg-red-700" @click="deleteCollection">
                            {{ confirmDelete ? 'CONFIRM DELETE?' : 'DELETE' }}
                        </button>
                        <div class="flex gap-2">
                             <button class="comic-btn bg-gray-300 hover:bg-gray-400" @click="cancelCollectionEdit">CANCEL</button>
                             <button class="comic-btn primary" @click="saveCollectionEdit">SAVE</button>
                        </div>
                    </div>
                </div>
             </div>
        </teleport>
    `
});
