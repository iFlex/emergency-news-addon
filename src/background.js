let terms = {};

async function loadData() {
    let termsLocation = './terms.json';
    const isFirefoxProd = browser.runtime.id === "{2164fef6-64f4-4a8b-9a6d-9dd9c500dd88}";
    const isChromeProd = browser.runtime.id === "pdcpkplohipjhdfdchpmgekifmcdbnha";
    if (isFirefoxProd || isChromeProd) {
        termsLocation = 'https://raw.githubusercontent.com/code4romania/emergency-news-addon/master/src/terms.json';
    }
    const httpData = await fetch(termsLocation);
    terms = expandTerms(await httpData.json());
    setTimeout(loadData, 1000 * 60 * 60);
}

function expandTerms(termsInput) {
    let newTerms = {};
    for (let term in termsInput) {
        if (termsInput.hasOwnProperty(term)) {
            newTerms[term] = termsInput[term];
            if (termsInput[term].hasOwnProperty("aliases")) {
                let aliases = termsInput[term].aliases;
                aliases.forEach(function(alias) {
                    newTerms[alias] = termsInput[term];
                });
            }
        }
    }
    let orderedTerms = [];
    Object.keys(newTerms)
        .sort((a, b) => {
            return b.length - a.length || b.localeCompare(a);
        })
        .forEach(function(key) {
            orderedTerms.push({
                "key": key,
                "value": newTerms[key]
            });
        });
    return orderedTerms;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    sendResponse({
        "terms": terms
    });
});

loadData();