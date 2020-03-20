import * as fs from 'fs';
import * as readline from 'readline';

type SyntaticCategory = "n" | //noun
                        "v" | // verb
                        "a" | // adjective
                        "r"   // adverb

type SynsetType = "n" | // noun
                  "v" | // verb
                  "a" | // adjective
                  "s" | // adjective satellite
                  "r"   // adverb
 
class IndexRow {
    // lower case ASCII text of word or collocation. Collocations are formed by joining individual words with an underscore (_ ) character.
    public lemma: string;

    // Syntactic category: n for noun files, v for verb files, a for adjective files, r for adverb files.
    public pos: SyntaticCategory;

    // Number of synsets that lemma is in. This is the number of senses of the word in WordNet. 
    // See Sense Numbers below for a discussion of how sense numbers are assigned and the order of synset_offset s in the index files.
    public synset_cnt: number;

    // Number of different pointers that lemma has in all synsets containing it.
    public p_cnt: number;

    // A space separated list of p_cnt different types of pointers that lemma has in all synsets containing it. 
    // See wninput(5WN) for a list of pointer_symbol s. 
    // If all senses of lemma have no pointers, this field is omitted and p_cnt is 0 .
    public ptr_symbols: string[];

    // Same as sense_cnt above. This is redundant, but the field was preserved for compatibility reasons.
    public sense_cnt: number;

    // Number of senses of lemma that are ranked according to their frequency of occurrence in semantic concordance texts.
    public tagsense_cnt: number;

    // Byte offset in data.pos file of a synset containing lemma . 
    // Each synset_offset in the list corresponds to a different sense of lemma in WordNet. 
    // synset_offset is an 8 digit, zero-filled decimal integer that can be used with fseek(3) to read a synset from the data file. 
    // When passed to read_synset(3WN) along with the syntactic category, a data structure containing the parsed synset is returned.
    public synset_offset: number;
}

export type WordType = "noun" | "verb" | "adj" | "adv" | string;

class DataRow {
    // Type
    public type: WordType;

    // Current byte offset in the file represented as an 8 digit decimal integer.
    public synset_offset: number;

    // Two digit decimal integer corresponding to the lexicographer file name containing the synset. 
    // See lexnames(5WN) for the list of filenames and their corresponding numbers.
    public lex_filenum: number;

    // One character code indicating the synset type
    public ss_type: SynsetType;

    // Two digit hexadecimal integer indicating the number of words in the synset.
    public w_cnt: number;

    public words: Word[];

    // Three digit decimal integer indicating the number of pointers from this synset to other synsets. If p_cnt is 000 the synset has no pointers.
    public p_cnt: number;

    // A pointer from this synset to another.
    public ptrs: Pointer[];

    // In data.verb only, a list of numbers corresponding to the generic verb sentence frames for word s in the synset. frames is of the form:
    //    f_cnt   +   f_num  w_num  [ +   f_num  w_num...]
    // where f_cnt a two digit decimal integer indicating the number of generic frames listed, f_num is a two digit decimal integer frame number, 
    // and w_num is a two digit hexadecimal integer indicating the word in the synset that the frame applies to. As with pointers, 
    // if this number is 00 , f_num applies to all word s in the synset. If non-zero, it is applicable only to the word indicated. 
    // Word numbers are assigned as described for pointers. Each f_num  w_num pair is preceded by a + . 
    // See wninput(5WN) for the text of the generic sentence frames.
    public frames: number[];

    // Each synset contains a gloss. A gloss is represented as a vertical bar (| ), followed by a text string that continues until the end of the line. 
    // The gloss may contain a definition, one or more example sentences, or both.
    public gloss: string;
}

class Word {
    // ASCII form of a word as entered in the synset by the lexicographer, with spaces replaced by underscore characters (_ ). 
    // The text of the word is case sensitive, in contrast to its form in the corresponding index. pos file, that contains only lower-case forms. 
    // In data.adj , a word is followed by a syntactic marker if one was specified in the lexicographer file. 
    // A syntactic marker is appended, in parentheses, onto word without any intervening spaces. 
    // See wninput(5WN) for a list of the syntactic markers for adjectives.
    public word: string;

    // One digit hexadecimal integer that, when appended onto lemma , uniquely identifies a sense within a lexicographer file. 
    // lex_id numbers usually start with 0 , and are incremented as additional senses of the word are added to the same file, 
    // although there is no requirement that the numbers be consecutive or begin with 0 . 
    // Note that a value of 0 is the default, and therefore is not present in lexicographer files.
    public lex_id: number;
}

class Pointer {
    public pointer_symbol: string;
    
    // The byte offset of the target synset in the data file corresponding to pos.
    public synset_offset: number;

    public pos: SyntaticCategory;

    // The source/target field distinguishes lexical and semantic pointers. It is a four byte field, containing two two-digit hexadecimal integers. 
    // The first two digits indicates the word number in the current (source) synset, the last two digits indicate the word number in the target synset. 
    // A value of 0000 means that pointer_symbol represents a semantic relation between the current (source) synset and the target synset indicated by synset_offset.
    public source_target: string;
}

export class WordService {

    private types = [
        "noun",
        "verb",
        "adj",
        "adv"
    ];

    private indices: IndexRow[] = [];
    private data = new Map<string, DataRow[]>();
    public totalSize = 0;

    constructor() {
        this.types.forEach(type => {       
            const indexPath = `./src/words/wn3.1.dict/dict/index.${type}`;     
            this.readFile(indexPath, 
                (line) => {
                    const result = this.parseIndexLine(line);
                    if (result) {
                        this.indices.push(result);
                    }
                },
                () => {
                    console.log(`Read ${this.indices.length} rows from ${indexPath}`);
                });    

            const dataPath = `./src/words/wn3.1.dict/dict/data.${type}`; 
            const dataRows = [];    
            this.readFile(dataPath, 
                (line) => {
                    const result = this.parseDataLine(line);
                    if (result) {
                        result.type = type;
                        dataRows.push(result);
                        this.totalSize++;
                    }
                },
                () => {
                    console.log(`Read ${dataRows.length} rows from ${dataPath}`);
                });
            this.data.set(type, dataRows);
        });
    }

    public findWord(word: string): string {
        for (const [_, values] of this.data) {
            const word = values.find(x => x.words.find(w => w.word === word) !== undefined);
            if (word) {
                return word.gloss;
            }
        }
        return `Unable to find '${word}'`;
    }

    public getRandomWord(type?: WordType): string {
        if (!type) {
            type = this.types[Math.round(Math.random() * 4)];
        }

        for (const [key, values] of this.data) {
            if (key !== type) {
                continue;
            }

            while (true) {
                const length = values.length;
                const rand = Math.round(Math.random() * length);
                if (values[rand] && values[rand].words) {
                    const word = values[rand].words[0];

                    // Exclude numbers/symbols
                    if (word && word.word.match("^[a-zA-Z]*$")) {
                        return word.word;
                    }
                }                
            }
        }
    }

    private readFile(filePath: string, lineHandler: (line: string) => void, closeHandler: () => void): void {
        console.log(`Reading ${filePath}...`);
        const inputStream = fs.createReadStream(filePath);

        const reader = readline.createInterface({
            input: inputStream,
            terminal: false
        });

        reader.on('line', lineHandler);

        reader.on('close', closeHandler);
    }

    private parseIndexLine(line: string): IndexRow | null {
        // Comment rows
        if (line.charAt(0) === ' ') {
            return null;
        }

        const tokens = line.split(' ');
        const result = new IndexRow();

        result.lemma = tokens.shift();
        result.pos = tokens.shift() as SyntaticCategory;
        result.synset_cnt = parseInt(tokens.shift(), 10);

        result.p_cnt = parseInt(tokens.shift(), 10);
        result.ptr_symbols = [];
        for (var index = 0; index < result.p_cnt; index++) {
          result.ptr_symbols.push(tokens.shift());
        }
      
        result.sense_cnt = parseInt(tokens.shift(), 10);
        result.tagsense_cnt = parseInt(tokens.shift(), 10);
        result.synset_offset = parseInt(tokens.shift(), 10);

        return result;
    }

    private parseDataLine(line: string): DataRow | null {
        // Comment rows
        if (line.charAt(0) === ' ') {
            return null;
        }

        const parts = line.split('|');
        const metadata = parts[0].split(' ');
        const glossary = parts[1] ? parts[1].trim() : '';

        const result = new DataRow();
        result.synset_offset = parseInt(metadata.shift(), 10);
        result.lex_filenum = parseInt(metadata.shift(), 10);
        result.ss_type = metadata.shift() as SynsetType;
        result.w_cnt = parseInt(metadata.shift(), 10);
        result.words = [];

        /* Parse the words */
        for (var wordIdx = 0; wordIdx < result.w_cnt; wordIdx++) {
            const word = new Word();
            word.word = metadata.shift();
            word.lex_id = parseInt(metadata.shift(), 16)
            result.words.push(word);
        }

        // TODO pointers?!

        result.gloss = glossary;

        return result;
    }
}

