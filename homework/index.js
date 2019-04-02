const REPOSITORIES_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

let repositories;
const repoSelectElement = document.getElementById('repo-select');
const contributorListElement = document.getElementById('contributor-list');
const contributorsLoadingDivElement = document.getElementById('loading-contributors');
const errorElement = document.getElementById('error');
const errorDetailElement = document.getElementById('error-detail');

class Contributor {
  constructor(htmlUrl, avatarUrl, login, contributions) {
    this.htmlUrl = htmlUrl;
    this.avatarUrl = avatarUrl;
    this.login = login;
    this.contributions = contributions;
  }

  render() {
    const liElement = document.createElement('li');
    liElement.innerHTML = `
      <a class="contributor-item" href=${this.htmlUrl} target="_blank">
        <img src="${this.avatarUrl}" class="contributor-avatar">
        <span>${this.login}</span>
        <span class="contributor-badge">${this.contributions}</span>
      </a>`;

    return liElement;
  }
}

class Repository {
  constructor(name, description, forks, updatedAt, contributorsUrl) {
    this.name = name;
    this.description = description;
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
    const data = await response.json();
    return data.map(c => new Contributor(c.html_url, c.avatar_url, c.login, c.contributions));
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

function displayError(error) {
  // The 'error' parameter can either be a boolean-like, or the error detail msg to display
  errorElement.style.display = error ? 'block' : 'none';
  errorDetailElement.innerText = error;

  if (error) throw error;
}

async function loadContributors(selectedRepo) {
  contributorListElement.innerHTML = ''; // Clear the contents of the ul completely
  displayError(false);
  showLoadingContributorsIndicator(true);

  try {
    const contributors = await selectedRepo.getContributors();
    contributors.forEach((contributor) => {
      contributorListElement.appendChild(contributor.render());
    });
  } catch (err) {
    displayError(err);
  } finally {
    showLoadingContributorsIndicator(false);
  }
}

function showSelectedRepoDetails() {
  const selectedRepo = repositories[repoSelectElement.selectedIndex];

  document.getElementById('repo-name').innerHTML = selectedRepo.name;
  document.getElementById('repo-description').innerHTML = selectedRepo.description;
  document.getElementById('repo-forks').innerHTML = selectedRepo.forks;
  document.getElementById('repo-updated').innerHTML = selectedRepo.getFormattedUpdateDate();

  loadContributors(selectedRepo);
}

window.onload = async () => {
  try {
    const response = await fetch(REPOSITORIES_URL);
    const data = await response.json();
    repositories = data.map(d => new Repository(
      d.name, d.description, d.forks, d.updated_at, d.contributors_url,
    ));
  } catch (err) {
    displayError(err);
  }

  populateSelectList();
  showSelectedRepoDetails();
};

repoSelectElement.onchange = showSelectedRepoDetails;
