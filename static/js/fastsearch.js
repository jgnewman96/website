var fuse; // holds our search engine
var list = document.getElementById('searchResults'); // targets the <ul>
var first = list.firstChild; // first child of search list
var last = list.lastChild; // last child of search list
var maininput = document.getElementById('searchInput'); // input box for search
var resultsAvailable = false; // Did we get any search results?

// ==========================================
// The main keyboard event listener running the show

(function () {

    loadSearch();
    document.getElementById("searchInput").focus();
    searchVisible = true;
})();
//
document.addEventListener('keydown', function (event) {

    // DOWN (40) arrow
    if (event.keyCode == 40) {
        if (searchVisible && resultsAvailable) {
            console.log("down");
            event.preventDefault(); // stop window from scrolling
            if (document.activeElement == maininput) { first.focus(); } // if the currently focused element is the main input --> focus the first <li>
            else if (document.activeElement == last) { last.focus(); } // if we're at the bottom, stay there
            else {
                console.log(document.activeElement.parentElement)
                document.activeElement.parentElement.nextElementSibling.firstElementChild.focus();
            } // otherwise select the next search result
        }
    }

    // UP (38) arrow
    if (event.keyCode == 38) {
        if (searchVisible && resultsAvailable) {
            event.preventDefault(); // stop window from scrolling
            if (document.activeElement == maininput) { maininput.focus(); } // If we're in the input box, do nothing
            else if (document.activeElement == first) { maininput.focus(); } // If we're at the first item, go to input box
            else { document.activeElement.parentElement.previousElementSibling.firstElementChild.focus(); } // Otherwise, select the search result above the current active one
        }
    }
});


// ==========================================
// execute search as each character is typed
//
document.getElementById("searchInput").onkeyup = function (e) {
    executeSearch(this.value);
}


// ==========================================
// fetch some json without jquery
//
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}


// ==========================================
// load our search index, only executed once
// on first call of search box (CMD-/)
//
function loadSearch() {
    fetchJSONFile('/index.json', function (data) {

        var options = { // fuse.js options; check fuse.js website for details
            shouldSort: true,
            location: 0,
            distance: 100,
            threshold: 0.4,
            minMatchCharLength: 1,
            keys: [
                'title',
                'tags',
                'categories',
                'contents'
            ]
        };
        fuse = new Fuse(data, options); // build the index from the json file
    });
}


// ==========================================
// using the index we loaded on CMD-/, run
// a search query (for "term") every time a letter is typed
// in the search box
//
function executeSearch(term) {


    let results = fuse.search(term); // the actual query being run using fuse.js


    let searchitems = ''; // our results bucket

    if (results.length === 0) { // no results based on what was typed into the input box
        resultsAvailable = false;
        searchitems = '';
    } else { // build our html
        for (let item in results.slice(0, 5)) { // only show first 5 results
            var content = results[item].item.contents;
            var result_str = '<li><a href="' +
                results[item].item.permalink + '" tabindex="0">' +
                '<span class="title">' + results[item].item.title +
                '</span><br /> <span class="sc"> Topics:' + results[item].item.tags +
                '</span><br />   Medium:  '
                + results[item].item.categories + '</a></li>'
                + content.substring(0, 400);

            if (searchitems.includes(result_str)) { continue; }

            searchitems = searchitems + result_str
        }

        resultsAvailable = true;
    }

    document.getElementById("searchResults").innerHTML = searchitems;
    if (results.length > 0) {
        first = list.firstChild.firstElementChild; // first result container — used for checking against keyboard up/down location
        last = list.lastChild.firstElementChild; // last result container — used for checking against keyboard up/down location
    }
}