const REPOSITORIES_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

let repositories;
const repoSelectElement = document.getElementById('repo-select');
const contributorListElement = document.getElementById('contributor-list');
const contributorDivElement = document.getElementById('contributor-div');
const contributorsLoadingDivElement = document.getElementById('loading-contributors');
const errorElement = document.getElementById('error');

function populateSelectList() {
  repositories
    .forEach((r) => {
      const optionElement = document.createElement('option');
      optionElement.text = r.name;
      optionElement.value = r.name;
      repoSelectElement.add(optionElement);
    });
}

function showLoadingContributorsIndicator(loading) {
  contributorDivElement.style.visibility = loading ? 'hidden' : 'visible';
  contributorsLoadingDivElement.style.visibility = loading ? 'visible' : 'hidden';
}

function populateContributorList(contributors) {
  contributors.forEach((contributor) => {
    const liElement = document.createElement('li');
    liElement.innerHTML = `
    <a href=${contributor.html_url} target="_blank">
      <img class="contributor-avatar" src="${contributor.avatar_url}" />
      <span>${contributor.login}</span>
    </a>
    `;

    contributorListElement.appendChild(liElement);
  });
}

function showError(show) {
  errorElement.style.display = show ? 'block' : 'none';
}

function loadContributors(selectedRepo) {
  showLoadingContributorsIndicator(true);
  fetch(selectedRepo.contributors_url)
    .then(response => response.json())
    .then(populateContributorList)
    .catch(() => showError(true))
    .finally(() => showLoadingContributorsIndicator(false));
}

function showSelectedRepoDetails() {
  // Account for the first 'Please choose...' option
  const selectedIndex = repoSelectElement.selectedIndex - 1;
  if (selectedIndex < 0) return; // Don't do anything upon selecting the 'Please choose...' option

  const selectedRepo = repositories[selectedIndex];

  document.getElementById('repo-name').innerHTML = selectedRepo.name;
  document.getElementById('repo-description').innerHTML = selectedRepo.description;
  document.getElementById('repo-forks').innerHTML = selectedRepo.forks;

  const updateDate = new Date(selectedRepo.updated_at);
  const date = updateDate.toLocaleDateString();
  const time = updateDate.toLocaleTimeString();

  document.getElementById('repo-updated').innerHTML = `${date} ${time}`;

  loadContributors(selectedRepo);
}

window.onload = () => {
  fetch(REPOSITORIES_URL)
    .then(response => response.json())
    .then((data) => {
      repositories = data;

      populateSelectList();
      showSelectedRepoDetails();
    });
};

repoSelectElement.onchange = showSelectedRepoDetails;
