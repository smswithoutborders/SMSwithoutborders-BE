# Contributing

When contributing to this repository, please first discuss the change you wish to make at [Issues](https://github.com/smswithoutborders/SMSwithoutborders-BE/issues).

## Development Process

### Prerequisites
- [MySQL](https://www.mysql.com/) (version >= 8.0.28) ([MariaDB](https://mariadb.org/))
- [nodejs](https://nodejs.org) (version >= [16.14.0](https://nodejs.org/dist/v16.14.0/node-v16.14.0-linux-x64.tar.xz)). 
- npm (version >= 8.3.1)

### Troubleshooting Local Development

If you run into issues when running the [SMSwithoutborders-BE](https://github.com/smswithoutborders/SMSwithoutborders-BE) locally, try the following:

1. Check the Node.js version (`node -v`) to ensure you are now using version >= `16.14.0`.
2. Enter `rm -rf node_modules; npm i` to remove all old packages and perform a fresh install.

### Workflow

We follow [Git Flow](https://guides.github.com/introduction/flow/) for changes to this repository. If you're not familiar with using git and GitHub on the command line, [GitHub Desktop](https://desktop.github.com) is an easier alternative.

1. Fork this repo to create a copy hosted on your GitHub account. The Fork button is in the top right of the page.
    * If you're a collaborator on the repo you can instead just create a branch.
2. Clone down your copy of this repo onto your local machine: `git clone <YOUR GITHUB REPO URL>`
3. Navigate to the new directory git created: `cd SMSwithoutborders-BE`
4. Check out the `dev` branch: `git checkout dev`
5. Run `npm install` to add all dependencies.
6. Create a new branch for your work based on dev: `git checkout -b <YOUR BRANCH NAME>` Your branch name should be something descriptive of the changes you wish to make, and can include the issue number this change is associated with. Example: `1234-new-docs`
7. Make your changes. Be sure to document your changes with a `.md` file in the `/docs` folder of the repo.
8. When you're ready to apply your changes, push your changed files to your forked repo:
    * `git add <FILENAMES OF CHANGED FILES>`
    * `git commit -m "<YOUR COMMIT MESSAGE>"` Your commit message should be descriptive of the changes you made.
    * `git push -u origin HEAD` This will push your changes to the branch you created on your forked repo.
1. Open a Pull Request to the `SMSwithoutborders-BE` repo:
    * Navigate to the [SMSwithoutborders-BE](https://github.com/smswithoutborders/SMSwithoutborders-BE) repo
    * Click `New pull request`
    * Click `Compare across forks`
    * Select `base repository: smswithoutborders/SMSwithoutborders-BE`
    * Select `base branch: dev`
    * Select `head repository: <YOUR FORKED REPOSITORY>`
    * Select `head branch: <YOUR BRANCH NAME>`
    * Click `Create pull request`

Your pull request will be reviewed and we'll get back to you!

## Run checks locally

Before creating a PR we STRONGLY recommend that you run your server locally to check that all changes work as expected.

Check out the [Configuration docs](https://github.com/smswithoutborders/SMSwithoutborders-BE/blob/dev/docs/CONFIGURATIONS.md) for more details.