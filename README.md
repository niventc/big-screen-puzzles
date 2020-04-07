# big-screen-puzzles

## Parties

Users join a party, notified of games that are started in the party.

TODO:
* Chromecast (CAF api) with mobile control mode
* Text chat
* Video/audio chat - https://jitsi.org/jitsi-meet/ or homebrew webrtc (SNIP server is cheap, TRIP is full proxy $$$)
* Offline mode - move game generators client side, angular pwa/service worker
* ngxs websockets - better state management
* Player statistics - played, win/lose stats
* Keyboard control

## Games

### codeword

Grid of words with letters hidden. Use a key to find all the letters.

TODO:
* Game completion
* Symmetric layout
* Fix word reveal and make it optional

### crossword

Grid of words with clues to uncover the words.

TODO:
* Implement - reuse the codeword grid, display definitions instead of a key
* Find better clues (reverse engineer crossword solver api?)
    * http://xd.saul.pw/data/ ~6000000 clues, 200mb uncompressed tab seperated "pubid,year,answer,clue"

### daily-quiz

List of questions that teams can fill in. Daily + weekly leaderboard.

TODO:
* Find source of questions

### minesweeper

Uncover the cells, but avoid the mines.

TODO:
* Toggle flag not just set
* Disable clicking if already selected by a player

### sudoku

Grid of numbers, the rows and quadrants all contain the numbers 1-9.

TODO:
* Game completion

### squares

Grid of numbers which indicate size of squares, find a way to layout all the squares.
e.g.
2,2,5,5,5,5,5
4,4,3,9,9,9,3
4,4,3,9,9,9,3
2,2,3,9,9,9,3

TODO:
* Implement!

### jigsaws

e.g. bezier curves for the puzzle pieces https://www.codeproject.com/Articles/395453/Html5-Jigsaw-Puzzle

TODO: 
* Implement
* Find source of copyright free pictures
