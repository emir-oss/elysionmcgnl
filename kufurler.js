const badWords = [
    "oç", "amk", "ananı sikiyim", "ananıskm", "piç", "amsk", "sikim", 
    "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "sik", 
    "yarrak", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", 
    "amq", "ibne", "göt", "amına koyim", "amk malı", "amına kodumun", 
    "amına kodum", "amk çocuğu", "amına koyayım", "sikik", "amk piçi", 
    "amına koyayim", "orospu evladı", "amk orospusu", "amk maldır", 
    "amk mal", "amına koyarım", "amk evladı", "amına koyduğum", 
    "amına koyduğumun", "amına koyayımın", "sikik piç", "amk orospu", 
    "amına koyduğumun çocuğu", "amına koyduğumun evladı"
];

// Özel Türkçe karakterlerle lowercase işlemi
function turkishToLower(text) {
    return text
        .replace(/İ/g, 'i')
        .replace(/I/g, 'ı')
        .replace(/Ü/g, 'ü')
        .replace(/Ö/g, 'ö')
        .replace(/Ğ/g, 'ğ')
        .replace(/Ç/g, 'ç')
        .replace(/Ş/g, 'ş')
        .toLowerCase();
}

// Kelime içerisinde boşluklar ve özel karakterleri temizler
function normalizeText(text) {
    return turkishToLower(text)
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s+/g, '')
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/8/g, 'b');
}

// Küfür kontrolü
function isOffensiveWordCaseInsensitive(text) {
    if (!text || typeof text !== 'string') return false;
    
    const normalizedText = normalizeText(text);
    
    // Kısa mesajlar için hızlı kontrol
    if (normalizedText.length <= 3) return false;
    
    return badWords.some(word => {
        const normalizedWord = normalizeText(word);
        
        // Tam eşleşme kontrolü
        if (normalizedText === normalizedWord) return true;
        
        // Alt metin kontrolü
        if (normalizedText.includes(normalizedWord)) return true;
        
        // Harfler arası karakter eklenmiş olabilir (a.m.k gibi)
        if (word.length > 2) {
            const regex = new RegExp(normalizedWord.split('').join('\\s*[^a-zğüşıöç]*\\s*'), 'i');
            if (regex.test(normalizedText)) return true;
        }
        
        return false;
    });
}

module.exports = { isOffensiveWordCaseInsensitive, badWords, turkishToLower };