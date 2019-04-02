const REPOSITORIES_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

let repositories;
const repoSelectElement = document.getElementById('repo-select');
const contributorListElement = document.getElementById('contributor-list');
const contributorsLoadingDivElement = document.getElementById('loading-contributors');
const errorElement = document.getElementById('error');
const errorDetailElement = document.getElementById('error-detail');

class Repository {
  constructor(name, description, forks, updatedAt, contributorsUrl) {
    this.name = name;
    this.descrption = description;
    this.forks = forks;
    this.updateDate = new Date(updatedAt);
    this.contributorsUrl = contributorsUrl;
  }

  getFormattedUpdateDate() {
    const date = this.updateDate.toLocaleDateString();
    const time = this.updateDate.toLocaleTimeString();

    return `${date} ${time}`;
  }

  async getContributors() {
    const response = await fetch(this.contributorsUrl);
    return response.json();
  }
}

function populateSelectList() {
  repositories.forEach((r) => {
    const optionElement = document.createElement('option');
    optionElement.text = r.name;
    optionElement.value = r.name;
    repoSelectElement.add(optionElement);
  });
}

function showLoadingContributorsIndicator(loading) {
  contributorsLoadingDivElement.style.display = loading ? 'block' : 'none';
}

function populateContributorList(contributors) {
  contributors.forEach((contributor) => {
    const liElement = document.createElement('li');
    liElement.innerHTML = `
      <a class="contributor-item" href=${contributor.html_url} target="_blank">
        <img src="${contributor.avatar_url}" class="contributor-avatar">
        <span>${contributor.login}</span>
        <span class="contributor-badge">${contributor.contributions}</span>
      </a>`;

    contributorListElement.appendChild(liElement);
  });
}

function displayError(error) {
  // The 'error' parameter can either be a boolean-like, or the error detail msg to display
  errorElement.style.display = error ? 'block' : 'none';
  errorDetailElement.innerText = error;

  // eslint-disable-next-line no-console
  if (error) console.error(error);
}

async function loadContributors(selectedRepo) {
  contributorListElement.innerHTML = ''; // Clear the contents of the ul completely
  displayError(false);
  showLoadingContributorsIndicator(true);

  try {
    const contributors = await selectedRepo.getContributors();
    populateContributorList(contributors);
  } catch (err) {
    displayError(err);
  } finally {
    showLoadingContributorsIndicator(false);
  }
}

function showSelectedRepoDetails() {
  // Account for the first 'Please choose...' option
  const selectedIndex = repoSelectElement.selectedIndex - 1;
  if (selectedIndex < 0) return; // Don't do anything upon selecting the 'Please choose...' option

  const selectedRepo = repositories[selectedIndex];

  document.getElementById('repo-name').innerHTML = selectedRepo.name;
  document.getElementById('repo-description').innerHTML = selectedRepo.description;
  document.getElementById('repo-forks').innerHTML = selectedRepo.forks;
  document.getElementById('repo-updated').innerHTML = selectedRepo.getFormattedUpdateDate();

  loadContributors(selectedRepo);
}

window.onload = async () => {
  const response = await fetch(REPOSITORIES_URL);
  const data = await response.json();
  repositories = data.map(d => new Repository(
    d.name, d.description, d.forks, d.updated_at, d.contributors_url,
  ));

  populateSelectList();
  showSelectedRepoDetails();
};

repoSelectElement.onchange = showSelectedRepoDetails;
