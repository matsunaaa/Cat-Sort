class CatSorter {
    constructor() {
        this.cats = [
            { emoji: '😺', height: 180, name: 'Happy' },
            { emoji: '😸', height: 60, name: 'Grinny' },
            { emoji: '😹', height: 220, name: 'Laughy' },
            { emoji: '😻', height: 100, name: 'Lovely' },
            { emoji: '😼', height: 160, name: 'Smirky' },
            { emoji: '😽', height: 80, name: 'Kissy' },
            { emoji: '🙀', height: 200, name: 'Shocked' },
            { emoji: '😿', height: 40, name: 'Tiny' }
        ];
        
        this.currentAlgorithm = null;
        this.isPlaying = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.currentStep = 0;
        this.speed = 3;
        
        // Bubble sort specific
        this.bubbleOuter = 0;
        this.bubbleInner = 0;
        
        // Selection sort specific
        this.selectionOuter = 0;
        this.selectionMin = 0;
        this.selectionInner = 0;
        
        // Insertion sort specific
        this.insertionOuter = 1;
        this.insertionInner = 0;
        this.insertionKey = null;
        
        // Merge sort specific
        this.mergeSteps = [];
        this.mergeStepIndex = 0;
        
        // Quick sort specific
        this.quickSteps = [];
        this.quickStepIndex = 0;
        
        this.initializeEventListeners();
        this.render();
    }
    
    initializeEventListeners() {
        // Algorithm buttons
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.disabled) {
                    this.selectAlgorithm(btn.dataset.algo);
                }
            });
        });
        
        // Control buttons
        document.getElementById('randomize').addEventListener('click', () => this.randomizeCats());
        document.getElementById('step').addEventListener('click', () => this.step());
        document.getElementById('play').addEventListener('click', () => this.togglePlay());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        
        // Speed control
        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            const labels = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];
            document.getElementById('speed-label').textContent = labels[this.speed - 1];
        });
    }
    
    selectAlgorithm(algo) {
        // Update active button
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-algo="${algo}"]`).classList.add('active');
        
        this.currentAlgorithm = algo;
        this.reset();
        
        // Special setup for merge and quick sort
        if (algo === 'merge') {
            this.prepareMergeSort();
        } else if (algo === 'quick') {
            this.prepareQuickSort();
        }
        
        this.updateExplanation('Ready to start!', `Let's watch the kitties sort themselves using ${this.getAlgorithmName(algo)}! Click "Next Step" to begin! 🎯`);
        
        // Enable control buttons
        document.getElementById('step').disabled = false;
        document.getElementById('play').disabled = false;
        document.getElementById('reset').disabled = false;
    }
    
    getAlgorithmName(algo) {
        const names = {
            bubble: 'Bubble Sort 🫧',
            selection: 'Selection Sort 👆',
            insertion: 'Insertion Sort 📥',
            merge: 'Merge Sort 🤝',
            quick: 'Quick Sort ⚡'
        };
        return names[algo] || algo;
    }
    
    randomizeCats() {
        // Fisher-Yates shuffle
        for (let i = this.cats.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cats[i], this.cats[j]] = [this.cats[j], this.cats[i]];
        }
        this.render();
        this.updateExplanation('Cats Randomized! 🎲', 'The kitties are all mixed up! Now choose a sorting algorithm from the left to organize them by height!');
    }
    
    render() {
        const container = document.getElementById('cat-container');
        container.innerHTML = '';
        
        this.cats.forEach((cat, index) => {
            const catCard = document.createElement('div');
            catCard.className = 'cat-card';
            catCard.id = `cat-${index}`;
            
            // Calculate emoji size based on height (40px to 80px range)
            const emojiSize = 30 + (cat.height / 220) * 50;
            
            catCard.innerHTML = `
                <div class="cat-index">${index}</div>
                <div class="cat-emoji" style="font-size: ${emojiSize}px">${cat.emoji}</div>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-height">${cat.height}cm</div>
            `;
            
            container.appendChild(catCard);
        });
    }
    
    async step() {
        switch(this.currentAlgorithm) {
            case 'bubble':
                await this.bubbleSortStep();
                break;
            case 'selection':
                await this.selectionSortStep();
                break;
            case 'insertion':
                await this.insertionSortStep();
                break;
            case 'merge':
                await this.mergeSortStep();
                break;
            case 'quick':
                await this.quickSortStep();
                break;
        }
        
        this.updateStats();
    }
    
    // BUBBLE SORT
    async bubbleSortStep() {
        // Check if we're done
        if (this.bubbleOuter >= this.cats.length - 1) {
            this.markAllSorted();
            this.updateExplanation('All Done! 🎉', 'All the kitties are sorted by height! The tallest cats bubbled to the right! Great job! 🐱');
            this.disableControls();
            return;
        }
        
        // Clear previous comparisons
        this.clearHighlights();
        
        // Check if inner loop is done
        if (this.bubbleInner >= this.cats.length - this.bubbleOuter - 1) {
            // Mark the last position as sorted
            document.getElementById(`cat-${this.cats.length - this.bubbleOuter - 1}`).classList.add('sorted');
            
            this.bubbleOuter++;
            this.bubbleInner = 0;
            
            if (this.bubbleOuter < this.cats.length - 1) {
                this.updateExplanation(`Round ${this.bubbleOuter} Complete! 🔄`, 
                    `The ${this.bubbleOuter} tallest kitty/kitties have bubbled to their spots! Starting round ${this.bubbleOuter + 1}... 🫧`);
            }
            return;
        }
        
        // Compare current pair
        const leftIndex = this.bubbleInner;
        const rightIndex = this.bubbleInner + 1;
        
        this.highlightCats([leftIndex, rightIndex]);
        this.comparisons++;
        
        const leftCat = this.cats[leftIndex];
        const rightCat = this.cats[rightIndex];
        
        if (leftCat.height > rightCat.height) {
            // Need to swap!
            this.updateExplanation(`Time to Swap! 🔄`, 
                `${leftCat.name} (${leftCat.height}cm) is taller than ${rightCat.name} (${rightCat.height}cm)! The taller kitty needs to move right! Let's swap them! 🐱➡️`);
            
            await this.swap(leftIndex, rightIndex);
            this.swaps++;
        } else {
            this.updateExplanation(`No Swap Needed! ✅`, 
                `${leftCat.name} (${leftCat.height}cm) is shorter than or same as ${rightCat.name} (${rightCat.height}cm)! They're in the right order! Moving on... 😊`);
        }
        
        this.bubbleInner++;
        this.currentStep++;
    }
    
    // SELECTION SORT
    async selectionSortStep() {
        // Check if we're done
        if (this.selectionOuter >= this.cats.length - 1) {
            this.markAllSorted();
            this.updateExplanation('All Done! 🎉', 'All the kitties are sorted! We selected the smallest kitty each time! Great job! 🐱');
            this.disableControls();
            return;
        }
        
        this.clearHighlights();
        
        // Starting a new search for minimum
        if (this.selectionInner === this.selectionOuter) {
            this.selectionMin = this.selectionOuter;
            this.selectionInner = this.selectionOuter + 1;
            
            this.highlightCats([this.selectionMin], 'min');
            this.updateExplanation(`Finding the Smallest Kitty! 🔍`, 
                `Looking for the smallest kitty starting from position ${this.selectionOuter}. Currently, ${this.cats[this.selectionMin].name} (${this.cats[this.selectionMin].height}cm) is our candidate!`);
            return;
        }
        
        // Search for minimum
        if (this.selectionInner < this.cats.length) {
            this.highlightCats([this.selectionMin], 'min');
            this.highlightCats([this.selectionInner]);
            this.comparisons++;
            
            if (this.cats[this.selectionInner].height < this.cats[this.selectionMin].height) {
                this.selectionMin = this.selectionInner;
                this.updateExplanation(`New Smallest Kitty Found! 🎯`, 
                    `${this.cats[this.selectionMin].name} (${this.cats[this.selectionMin].height}cm) is smaller! They're now our smallest kitty candidate!`);
            } else {
                this.updateExplanation(`Still Searching... 👀`, 
                    `${this.cats[this.selectionInner].name} (${this.cats[this.selectionInner].height}cm) is not smaller than our current smallest ${this.cats[this.selectionMin].name}. Keep looking!`);
            }
            
            this.selectionInner++;
            this.currentStep++;
            return;
        }
        
        // Time to swap
        if (this.selectionMin !== this.selectionOuter) {
            this.updateExplanation(`Time to Swap! 🔄`, 
                `${this.cats[this.selectionMin].name} is the smallest! Let's move them to position ${this.selectionOuter}!`);
            await this.swap(this.selectionOuter, this.selectionMin);
            this.swaps++;
        } else {
            this.updateExplanation(`Already in Place! ✅`, 
                `${this.cats[this.selectionOuter].name} is already the smallest in the remaining kitties! No swap needed!`);
        }
        
        // Mark as sorted
        document.getElementById(`cat-${this.selectionOuter}`).classList.add('sorted');
        
        this.selectionOuter++;
        this.selectionInner = this.selectionOuter;
        this.currentStep++;
    }
    
    // INSERTION SORT
    async insertionSortStep() {
        // Check if we're done
        if (this.insertionOuter >= this.cats.length) {
            this.markAllSorted();
            this.updateExplanation('All Done! 🎉', 'All the kitties are sorted! Each kitty found their perfect spot! Great job! 🐱');
            this.disableControls();
            return;
        }
        
        this.clearHighlights();
        
        // Starting with a new cat to insert
        if (this.insertionKey === null) {
            this.insertionKey = {...this.cats[this.insertionOuter]};
            this.insertionInner = this.insertionOuter - 1;
            
            // Mark sorted portion
            for (let i = 0; i < this.insertionOuter; i++) {
                document.getElementById(`cat-${i}`).classList.add('sorted');
            }
            
            this.highlightCats([this.insertionOuter], 'inserting');
            this.updateExplanation(`Inserting ${this.insertionKey.name}! 📥`, 
                `We're going to find the right spot for ${this.insertionKey.name} (${this.insertionKey.height}cm) among the sorted kitties!`);
            return;
        }
        
        // Finding the right position
        if (this.insertionInner >= 0 && this.cats[this.insertionInner].height > this.insertionKey.height) {
            this.highlightCats([this.insertionInner, this.insertionInner + 1]);
            this.comparisons++;
            
            this.updateExplanation(`Shifting Kitties! ➡️`, 
                `${this.cats[this.insertionInner].name} (${this.cats[this.insertionInner].height}cm) is taller than ${this.insertionKey.name}! Shifting ${this.cats[this.insertionInner].name} to the right!`);
            
            // Shift right
            this.cats[this.insertionInner + 1] = this.cats[this.insertionInner];
            this.render();
            
            // Restore sorted states
            for (let i = 0; i <= this.insertionOuter; i++) {
                if (i !== this.insertionInner + 1) {
                    document.getElementById(`cat-${i}`).classList.add('sorted');
                }
            }
            
            this.insertionInner--;
            this.currentStep++;
            return;
        }
        
        // Insert the cat
        this.cats[this.insertionInner + 1] = this.insertionKey;
        this.render();
        
        // Mark all sorted
        for (let i = 0; i <= this.insertionOuter; i++) {
            document.getElementById(`cat-${i}`).classList.add('sorted');
        }
        
        this.updateExplanation(`Perfect Spot Found! ✨`, 
            `${this.insertionKey.name} has been inserted at position ${this.insertionInner + 1}! All kitties up to position ${this.insertionOuter} are now sorted!`);
        
        this.insertionOuter++;
        this.insertionKey = null;
        this.currentStep++;
    }
    
    // MERGE SORT
    prepareMergeSort() {
        this.mergeSteps = [];
        this.mergeStepIndex = 0;
        const tempCats = [...this.cats]; this.generateMergeSortSteps(tempCats, 0, tempCats.length - 1, 0);
    }
    
    generateMergeSortSteps(arr, left, right, depth) {
        if (left >= right) return;
        
        const mid = Math.floor((left + right) / 2);
        
        // Add split step
        this.mergeSteps.push({
            type: 'split',
            left: left,
            right: right,
            mid: mid,
            depth: depth
        });
        
        // Recursively sort left and right
        this.generateMergeSortSteps(arr, left, mid, depth + 1);
        this.generateMergeSortSteps(arr, mid + 1, right, depth + 1);
        
        // Add merge step
        this.mergeSteps.push({
            type: 'merge',
            left: left,
            right: right,
            mid: mid,
            depth: depth,
            array: [...arr]
        });
        
        // Actually merge for correct array state
        this.mergeArrays(arr, left, mid, right);
    }
    
    mergeArrays(arr, left, mid, right) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i].height <= rightArr[j].height) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            k++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            j++;
            k++;
        }
    }
    
    async mergeSortStep() {
        if (this.mergeStepIndex >= this.mergeSteps.length) {
            this.markAllSorted();
            this.updateExplanation('All Done! 🎉', 'All the kitties are sorted! They formed teams and merged perfectly! Great job! 🐱');
            this.disableControls();
            return;
        }
        
        this.clearHighlights();
        const step = this.mergeSteps[this.mergeStepIndex];
        
        if (step.type === 'split') {
            // Highlight the range being split
            for (let i = step.left; i <= step.right; i++) {
                document.getElementById(`cat-${i}`).classList.add('comparing');
            }
            
            this.updateExplanation(`Splitting Kitty Teams! ✂️`, 
                `Dividing kitties from position ${step.left} to ${step.right} into two teams! Left team: ${step.left} to ${step.mid}, Right team: ${step.mid + 1} to ${step.right}`);
        } else {
            // Merge step
            const leftTeam = [];
            const rightTeam = [];
            
            for (let i = step.left; i <= step.mid; i++) {
                leftTeam.push(this.cats[i].name);
            }
            for (let i = step.mid + 1; i <= step.right; i++) {
                rightTeam.push(this.cats[i].name);
            }
            
            // Highlight the ranges being merged
            for (let i = step.left; i <= step.right; i++) {
                document.getElementById(`cat-${i}`).classList.add('comparing');
            }
            
            this.updateExplanation(`Merging Kitty Teams! 🤝`, 
                `Merging sorted teams: [${leftTeam.join(', ')}] and [${rightTeam.join(', ')}] into one sorted group!`);
            
            // Perform the merge
            const tempArr = [...this.cats];
            this.mergeArrays(tempArr, step.left, step.mid, step.right);
            
            // Animate the merge
            await this.sleep(300);
            this.cats = tempArr;
            this.render();
            
            // Mark merged section as sorted
            for (let i = step.left; i <= step.right; i++) {
                document.getElementById(`cat-${i}`).classList.add('sorted');
            }
            
            this.comparisons += (step.right - step.left);
        }
        
        this.mergeStepIndex++;
        this.currentStep++;
    }
    
    // QUICK SORT
    prepareQuickSort() {
        this.quickSteps = [];
        this.quickStepIndex = 0;
        const tempCats = [...this.cats];
        this.generateQuickSortSteps(tempCats, 0, tempCats.length - 1);
    }
    
    generateQuickSortSteps(arr, low, high) {
        if (low < high) {
            // Add partition start step
            const pivotIndex = Math.floor((low + high) / 2);
            this.quickSteps.push({
                type: 'select-pivot',
                low: low,
                high: high,
                pivotIndex: pivotIndex,
                pivot: arr[pivotIndex]
            });
            
            // Partition
            const pi = this.partition(arr, low, high);
            
            // Add partition complete step
            this.quickSteps.push({
                type: 'partition-complete',
                low: low,
                high: high,
                pivotIndex: pi,
                array: [...arr]
            });
            
            // Recursively sort
            this.generateQuickSortSteps(arr, low, pi - 1);
            this.generateQuickSortSteps(arr, pi + 1, high);
        }
    }
    
    partition(arr, low, high) {
        const pivotIndex = Math.floor((low + high) / 2);
        const pivot = arr[pivotIndex];
        
        // Move pivot to end
        [arr[pivotIndex], arr[high]] = [arr[high], arr[pivotIndex]];
        
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            if (arr[j].height < pivot.height) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                
                this.quickSteps.push({
                    type: 'swap',
                    index1: i,
                    index2: j,
                    reason: 'smaller than pivot'
                });
            }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        
        this.quickSteps.push({
            type: 'place-pivot',
            pivotIndex: i + 1,
            pivot: pivot
        });
        
        return i + 1;
    }
    
    async quickSortStep() {
        if (this.quickStepIndex >= this.quickSteps.length) {
            this.markAllSorted();
            this.updateExplanation('All Done! 🎉', 'All the kitties are sorted! The captain kitties did a great job dividing everyone! Great job! 🐱');
            this.disableControls();
            return;
        }
        
        this.clearHighlights();
        const step = this.quickSteps[this.quickStepIndex];
        
        switch(step.type) {
            case 'select-pivot':
                this.highlightCats([step.pivotIndex], 'pivot');
                this.updateExplanation(`Captain Kitty Chosen! 👑`, 
                    `${step.pivot.name} (${step.pivot.height}cm) is chosen as the captain! All shorter kitties will go left, taller kitties will go right!`);
                break;
                
            case 'swap':
                this.highlightCats([step.index1, step.index2]);
                await this.swap(step.index1, step.index2);
                this.swaps++;
                this.updateExplanation(`Kitties Switching Sides! 🔄`, 
                    `${this.cats[step.index2].name} is ${step.reason}, so they're moving to the left side!`);
                break;
                
            case 'place-pivot':
                this.highlightCats([step.pivotIndex], 'pivot');
                this.updateExplanation(`Captain Takes Position! 📍`, 
                    `${step.pivot.name} has found their final position at index ${step.pivotIndex}! All shorter kitties are on the left, taller on the right!`);
                document.getElementById(`cat-${step.pivotIndex}`).classList.add('sorted');
                break;
                
            case 'partition-complete':
                // Update the actual array
                this.cats = [...step.array];
                this.render();
                
                // Restore sorted states
                for (let i = 0; i < this.cats.length; i++) {
                    if (document.querySelector(`#cat-${i}.sorted`)) {
                        document.getElementById(`cat-${i}`).classList.add('sorted');
                    }
                }
                
                this.updateExplanation(`Division Complete! ✅`, 
                    `The kitties have been successfully divided around the captain! Now we'll sort each group separately!`);
                break;
        }
        
        this.quickStepIndex++;
        this.currentStep++;
        this.comparisons++;
    }
    
    // Helper methods
    highlightCats(indices, type = 'comparing') {
        indices.forEach(index => {
            const cat = document.getElementById(`cat-${index}`);
            if (cat) {
                if (type === 'min') {
                    cat.style.background = 'var(--sandy-brown)';
                    cat.style.color = 'white';
                } else if (type === 'pivot') {
                    cat.style.background = 'var(--moonstone)';
                    cat.style.color = 'white';
                } else if (type === 'inserting') {
                    cat.style.background = 'var(--vanilla)';
                } else {
                    cat.classList.add('comparing');
                }
            }
        });
    }
    
    clearHighlights() {
        document.querySelectorAll('.cat-card').forEach(card => {
            card.classList.remove('comparing');
            card.style.background = '';
            card.style.color = '';
        });
    }
    
    markAllSorted() {
        document.querySelectorAll('.cat-card').forEach(card => {
            card.classList.add('sorted');
        });
    }
    
    async swap(i, j) {
        const cat1 = document.getElementById(`cat-${i}`);
        const cat2 = document.getElementById(`cat-${j}`);
        
        // Get positions
        const pos1 = cat1.getBoundingClientRect();
        const pos2 = cat2.getBoundingClientRect();
        
        // Calculate distance
        const distance = pos2.left - pos1.left;
        
        // Add swapping class
        cat1.classList.add('swapping');
        cat2.classList.add('swapping');
        
        // Animate
        cat1.style.transform = `translateX(${distance}px)`;
        cat2.style.transform = `translateX(${-distance}px)`;
        
        // Wait for animation
        await this.sleep(500);
        
        // Swap in array
        [this.cats[i], this.cats[j]] = [this.cats[j], this.cats[i]];
        
        // Re-render
        this.render();
        
        // Restore any sorted states
        this.restoreSortedStates();
    }
    
    restoreSortedStates() {
        // This is algorithm-specific, implemented as needed
        if (this.currentAlgorithm === 'bubble') {
            for (let k = this.cats.length - 1; k > this.cats.length - this.bubbleOuter - 1; k--) {
                document.getElementById(`cat-${k}`).classList.add('sorted');
            }
        } else if (this.currentAlgorithm === 'selection') {
            for (let k = 0; k < this.selectionOuter; k++) {
                document.getElementById(`cat-${k}`).classList.add('sorted');
            }
        }
    }
    
    sleep(ms) {
        const speeds = [2000, 1500, 1000, 500, 200];
        return new Promise(resolve => setTimeout(resolve, speeds[this.speed - 1]));
    }
    
    async togglePlay() {
        this.isPlaying = !this.isPlaying;
        const playBtn = document.getElementById('play');
        
        if (this.isPlaying) {
            playBtn.innerHTML = '<span>⏸️</span> Pause';
            document.getElementById('step').disabled = true;
            
            while (this.isPlaying) {
                await this.step();
                await this.sleep(100);
                
                // Check if algorithm is complete
                if (document.getElementById('step').disabled && !this.isPlaying) {
                    break;
                }
            }
            
            this.isPlaying = false;
            playBtn.innerHTML = '<span>▶️</span> Auto Play';
            document.getElementById('step').disabled = false;
        } else {
            playBtn.innerHTML = '<span>▶️</span> Auto Play';
            document.getElementById('step').disabled = false;
        }
    }
    
    reset() {
        // Reset all algorithm-specific variables
        this.bubbleOuter = 0;
        this.bubbleInner = 0;
        
        this.selectionOuter = 0;
        this.selectionMin = 0;
        this.selectionInner = 0;
        
        this.insertionOuter = 1;
        this.insertionInner = 0;
        this.insertionKey = null;
        
        this.mergeSteps = [];
        this.mergeStepIndex = 0;
        
        this.quickSteps = [];
        this.quickStepIndex = 0;
        
        // Reset general variables
        this.comparisons = 0;
        this.swaps = 0;
        this.currentStep = 0;
        this.isPlaying = false;
        
        document.getElementById('play').innerHTML = '<span>▶️</span> Auto Play';
        
        this.clearHighlights();
        document.querySelectorAll('.cat-card').forEach(card => {
            card.classList.remove('sorted');
        });
        
        this.updateStats();
        
        if (this.currentAlgorithm) {
            // Re-prepare merge and quick sort
            if (this.currentAlgorithm === 'merge') {
                this.prepareMergeSort();
            } else if (this.currentAlgorithm === 'quick') {
                this.prepareQuickSort();
            }
            
            this.updateExplanation('Reset Complete! 🔄', 
                `Ready to sort the kitties again using ${this.getAlgorithmName(this.currentAlgorithm)}! Click "Next Step" to begin!`);
        }
    }
    
    disableControls() {
        document.getElementById('step').disabled = true;
        document.getElementById('play').disabled = true;
        this.isPlaying = false;
        document.getElementById('play').innerHTML = '<span>▶️</span> Auto Play';
    }
    
    updateExplanation(title, text) {
        document.getElementById('step-title').textContent = title;
        document.getElementById('step-explanation').textContent = text;
    }
    
    updateStats() {
        document.getElementById('comparisons').textContent = this.comparisons;
        document.getElementById('swaps').textContent = this.swaps;
        document.getElementById('current-step').textContent = this.currentStep;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CatSorter();
});