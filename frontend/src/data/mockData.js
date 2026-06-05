// Mock data for the entire application
export const subjects = [
  {
    id: 1,
    slug: 'data-structures',
    name: 'Data Structures',
    description: 'Learn arrays, linked lists, stacks, queues, trees, graphs and their algorithms in depth.',
    icon: 'bi bi-diagram-3',
    color: '#6b21a8',
    topics: [
      { id: 1, slug: 'arrays', title: 'Arrays & Dynamic Arrays', order: 1, is_completed: true },
      { id: 2, slug: 'linked-lists', title: 'Linked Lists', order: 2, is_completed: false },
      { id: 3, slug: 'stacks-queues', title: 'Stacks & Queues', order: 3, is_completed: false },
      { id: 4, slug: 'trees', title: 'Binary Trees & BST', order: 4, is_completed: false },
      { id: 5, slug: 'graphs', title: 'Graphs & Traversals', order: 5, is_completed: false },
    ]
  },
  {
    id: 2,
    slug: 'algorithms',
    name: 'Algorithms',
    description: 'Sorting, searching, dynamic programming, greedy algorithms and complexity analysis.',
    icon: 'bi bi-cpu',
    color: '#b45309',
    topics: [
      { id: 6, slug: 'sorting', title: 'Sorting Algorithms', order: 1, is_completed: false },
      { id: 7, slug: 'searching', title: 'Searching Algorithms', order: 2, is_completed: false },
      { id: 8, slug: 'dynamic-programming', title: 'Dynamic Programming', order: 3, is_completed: false },
    ]
  },
  {
    id: 3,
    slug: 'database-management',
    name: 'Database Management',
    description: 'Relational databases, SQL, normalization, indexing and transaction management.',
    icon: 'bi bi-database',
    color: '#0ea5e9',
    topics: [
      { id: 9, slug: 'sql-basics', title: 'SQL Fundamentals', order: 1, is_completed: false },
      { id: 10, slug: 'normalization', title: 'Database Normalization', order: 2, is_completed: false },
    ]
  },
  {
    id: 4,
    slug: 'computer-networks',
    name: 'Computer Networks',
    description: 'OSI model, TCP/IP, routing, network protocols and security fundamentals.',
    icon: 'bi bi-wifi',
    color: '#10b981',
    topics: [
      { id: 11, slug: 'osi-model', title: 'OSI Reference Model', order: 1, is_completed: false },
      { id: 12, slug: 'tcp-ip', title: 'TCP/IP Protocol Suite', order: 2, is_completed: false },
    ]
  },
  {
    id: 5,
    slug: 'operating-systems',
    name: 'Operating Systems',
    description: 'Process management, memory management, file systems and OS design principles.',
    icon: 'bi bi-gear',
    color: '#ef4444',
    topics: [
      { id: 13, slug: 'process-management', title: 'Process Management', order: 1, is_completed: false },
      { id: 14, slug: 'memory-management', title: 'Memory Management', order: 2, is_completed: false },
    ]
  },
  {
    id: 6,
    slug: 'software-engineering',
    name: 'Software Engineering',
    description: 'SDLC models, design patterns, testing methodologies, and agile practices.',
    icon: 'bi bi-code-square',
    color: '#8b5cf6',
    topics: [
      { id: 15, slug: 'sdlc', title: 'SDLC Models', order: 1, is_completed: false },
      { id: 16, slug: 'design-patterns', title: 'Design Patterns', order: 2, is_completed: false },
    ]
  },
];

export const videos = [
  {
    id: 1,
    title: 'Data Structures Full Course - Arrays, Linked Lists & More',
    topic: { title: 'Arrays & Dynamic Arrays', subject: { name: 'Data Structures' } },
    youtube_url: 'https://youtube.com/watch?v=RBSGKlAvoiM',
    thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
    description: 'Comprehensive guide to data structures with visual explanations.',
    diagram_score: 85, analogy_score: 40, example_score: 70, theory_score: 60, logic_score: 50,
  },
  {
    id: 2,
    title: 'Sorting Algorithms Visualized - Bubble, Merge, Quick Sort',
    topic: { title: 'Sorting Algorithms', subject: { name: 'Algorithms' } },
    youtube_url: 'https://youtube.com/watch?v=kPRA0W1kECg',
    thumbnail: 'https://img.youtube.com/vi/kPRA0W1kECg/maxresdefault.jpg',
    description: 'Visual step-by-step sorting algorithm explanations.',
    diagram_score: 90, analogy_score: 50, example_score: 80, theory_score: 40, logic_score: 75,
  },
  {
    id: 3,
    title: 'SQL Tutorial - Complete Database Course for Beginners',
    topic: { title: 'SQL Fundamentals', subject: { name: 'Database Management' } },
    youtube_url: 'https://youtube.com/watch?v=HXV3zeQKqGY',
    thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg',
    description: 'Full SQL course covering queries, joins, and optimization.',
    diagram_score: 60, analogy_score: 65, example_score: 90, theory_score: 70, logic_score: 55,
  },
  {
    id: 4,
    title: 'Computer Networking - OSI Model, TCP/IP Explained',
    topic: { title: 'OSI Reference Model', subject: { name: 'Computer Networks' } },
    youtube_url: 'https://youtube.com/watch?v=vv4y_uOneC0',
    thumbnail: 'https://img.youtube.com/vi/vv4y_uOneC0/maxresdefault.jpg',
    description: 'Detailed walkthrough of network layers with real examples.',
    diagram_score: 80, analogy_score: 75, example_score: 60, theory_score: 80, logic_score: 45,
  },
  {
    id: 5,
    title: 'Dynamic Programming - Memoization and Tabulation',
    topic: { title: 'Dynamic Programming', subject: { name: 'Algorithms' } },
    youtube_url: 'https://youtube.com/watch?v=oBt53YbR9Kk',
    thumbnail: 'https://img.youtube.com/vi/oBt53YbR9Kk/maxresdefault.jpg',
    description: 'Master dynamic programming with step-by-step logic.',
    diagram_score: 55, analogy_score: 60, example_score: 75, theory_score: 65, logic_score: 90,
  },
  {
    id: 6,
    title: 'Binary Trees & BST - Traversals Explained with Animations',
    topic: { title: 'Binary Trees & BST', subject: { name: 'Data Structures' } },
    youtube_url: 'https://youtube.com/watch?v=fAAZixBzIAI',
    thumbnail: 'https://img.youtube.com/vi/fAAZixBzIAI/maxresdefault.jpg',
    description: 'Visual animated guide to binary tree operations.',
    diagram_score: 95, analogy_score: 50, example_score: 65, theory_score: 55, logic_score: 60,
  },
];

export const interactions = [
  { id: 1, topic: { title: 'Arrays & Dynamic Arrays', subject: { name: 'Data Structures', slug: 'data-structures' }, slug: 'arrays' }, content_version: { style_type: 'diagram', title: 'Visual Array Representation' }, rating: 5, timestamp: '2026-05-30' },
  { id: 2, topic: { title: 'Sorting Algorithms', subject: { name: 'Algorithms', slug: 'algorithms' }, slug: 'sorting' }, content_version: { style_type: 'example', title: 'Bubble Sort Step-by-Step' }, rating: 4, timestamp: '2026-05-29' },
  { id: 3, topic: { title: 'SQL Fundamentals', subject: { name: 'Database Management', slug: 'database-management' }, slug: 'sql-basics' }, content_version: { style_type: 'example', title: 'SQL Queries in Action' }, rating: null, timestamp: '2026-05-28' },
  { id: 4, topic: { title: 'OSI Reference Model', subject: { name: 'Computer Networks', slug: 'computer-networks' }, slug: 'osi-model' }, content_version: { style_type: 'analogy', title: 'Postal System Analogy' }, rating: 4, timestamp: '2026-05-27' },
  { id: 5, topic: { title: 'Binary Trees & BST', subject: { name: 'Data Structures', slug: 'data-structures' }, slug: 'trees' }, content_version: { style_type: 'diagram', title: 'Tree Structure Visualization' }, rating: 5, timestamp: '2026-05-26' },
];

export const topicContent = {
  'arrays': {
    subject: { name: 'Data Structures', slug: 'data-structures' },
    title: 'Arrays & Dynamic Arrays',
    description: 'An array is a collection of items stored at contiguous memory locations.',
    versions: [
      {
        id: 1, style_type: 'diagram', title: 'Visual Array Layout',
        body: 'An array can be visualized as a row of numbered boxes:\n\n[0] [1] [2] [3] [4] [5]\n[10][20][30][40][50][60]\n\nEach box has:\n• An INDEX (position, starting from 0)\n• A VALUE (the actual data stored)\n• A MEMORY ADDRESS (contiguous locations)',
        diagram_score: 90, example_score: 40, analogy_score: 30, theory_score: 50, logic_score: 35,
      },
      {
        id: 2, style_type: 'analogy', title: 'Egg Carton Analogy',
        body: 'Think of an array like an egg carton:\n\n• The carton has a fixed number of slots (fixed size)\n• Each slot is numbered (index)\n• You can only put one egg per slot (one value per index)\n• To find an egg, you go directly to its slot number (O(1) access)\n\nA dynamic array is like a magical carton that doubles in size when full!',
        diagram_score: 30, example_score: 50, analogy_score: 95, theory_score: 40, logic_score: 30,
      },
      {
        id: 3, style_type: 'example', title: 'Python Array Examples',
        body: '# Creating an array\narr = [10, 20, 30, 40, 50]\n\n# Accessing elements\nprint(arr[0])  # Output: 10\nprint(arr[-1]) # Output: 50 (last element)\n\n# Modifying elements\narr[2] = 99\nprint(arr)  # [10, 20, 99, 40, 50]\n\n# Dynamic array with append\narr.append(60)  # Adds to end, resizes if needed',
        diagram_score: 40, example_score: 95, analogy_score: 30, theory_score: 50, logic_score: 60,
      },
      {
        id: 4, style_type: 'theory', title: 'Array Theory & Complexity',
        body: 'An array is a linear data structure that stores elements of the same type in contiguous memory locations.\n\nTime Complexity:\n• Access: O(1) — direct index calculation\n• Search: O(n) — linear scan\n• Insertion at end: O(1) amortized\n• Insertion at position: O(n) — shifting required\n• Deletion: O(n) — shifting required\n\nSpace Complexity: O(n)',
        diagram_score: 50, example_score: 50, analogy_score: 20, theory_score: 95, logic_score: 70,
      },
      {
        id: 5, style_type: 'logic', title: 'Array Access Logic Proof',
        body: 'Why is array access O(1)?\n\nBase address = 1000 (example)\nElement size = 4 bytes (int)\n\nAddress of arr[i] = Base + (i × size)\nAddress of arr[3] = 1000 + (3 × 4) = 1012\n\nThis calculation takes constant time regardless of array size:\n∀i, Access(i) = O(1)\n\nProof by contradiction:\nIf access were O(n), computer memory would be unusable → contradiction.',
        diagram_score: 40, example_score: 50, analogy_score: 20, theory_score: 60, logic_score: 95,
      },
    ]
  }
};
