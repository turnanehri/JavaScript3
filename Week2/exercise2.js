const urls = [
  'https://jsonplaceholder.typicode.com/todos/1',
  'https://jsonplaceholder.typicode.com/todos/2',
  'https://jsonplaceholder.typicode.com/todos/3',
  'https://jsonplaceholder.typicode.com/todos/4',
  'https://jsonplaceholder.typicode.com/todos/5',
]

// BASIC VERSION:


// Start off with a promise that always resolves
var sequence = Promise.resolve();

// Loop through our chapter urls
story.chapterUrls.forEach((chapterUrl) => {
  // Add these actions to the end of the sequence
  sequence = sequence.then(() => {
    return getJSON(chapterUrl);
  }).then((chapter) => {
    addHtmlToPage(chapter.html);
  });
})



// =============================== //




// CLEAN VERSION:


urls.reduce(
  (sequence, chapterUrl) => {
    // Add these actions to the end of the sequence
    return sequence.then(() => {
      return getJSON(chapterUrl);
    }).then((chapter) => {
      addHtmlToPage(chapter.html);
    });
  }, 
  Promise.resolve()
);


function getJSON(url) {
  return fetch(url).then(JSON.parse);
}
