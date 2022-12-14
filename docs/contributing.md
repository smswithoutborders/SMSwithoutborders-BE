# Contributing

When contributing to this repository, please first discuss the change you wish to make at [Issues](https://github.com/smswithoutborders/SMSwithoutborders-BE/issues).

## Development process

### Prerequisites

- [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))
- [Python](https://www.python.org/) (version >= [3.8.10](https://www.python.org/downloads/release/python-3810/))
- [Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)

### Workflow

We follow [Git Flow](https://guides.github.com/introduction/flow/) for changes to this repository. If you're not familiar with using git and GitHub on the command line, [GitHub Desktop](https://desktop.github.com) is an easier alternative.

1. Fork this repo to create a copy hosted on your GitHub account. The Fork button is in the top right of the page.
   - If you're a collaborator on the repo you can instead create a branch.
2. Clone down your copy of this repo onto your local machine: `git clone <YOUR GITHUB REPO URL>`
3. Navigate to the new directory git created: `cd SMSwithoutborders-BE`
4. See [Configurations steps](configurations.md) to configure your development environment.
5. Create a new branch for your work based on main: `git checkout -b <YOUR BRANCH NAME>` Your branch name should be something descriptive of the changes you wish to make, and can include the issue number this change is associated with. Example: `feature/1234-update-documentation`
6. Make your changes. When you're ready to apply your changes, push your changed files to your forked repo:
   - `git add <FILENAMES OF CHANGED FILES>`
   - `git commit -m "<YOUR COMMIT MESSAGE>"` Your commit message should be descriptive of the changes you made.
   - `git push -u origin HEAD` This will push your changes to the branch you created on your forked repo.
7. Open a Pull Request to the `SMSwithoutborders-BE` repo:
   - Navigate to the [SMSwithoutborders-BE](https://github.com/smswithoutborders/SMSwithoutborders-BE) repo
   - Select `New pull request`
   - Select `Compare across forks`
   - Select `base repository: SMSwithoutborders-BE`
   - Select `base branch: main`
   - Select `head repository: <YOUR FORKED REPOSITORY>`
   - Select `head branch: <YOUR BRANCH NAME>`
   - Select `Create pull request`

Your pull request will be reviewed and we'll get back to you!
