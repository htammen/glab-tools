#!/usr/bin/env zx

import { chalk, question, echo, $, os, fs, YAML } from "zx"

const getMileStone = async () => {
  const projectGroups = JSON.parse((await $`glab api projects/:id/groups`).stdout)

  let mileStones = []

  const prjMileStones = JSON.parse((await $`glab api projects/:id/milestones`).stdout)
  if (prjMileStones.length > 0) {
    for (const mileStone of prjMileStones) {
      mileStones.push({ id: mileStone.id, iid: mileStone.iid, title: mileStone.title, description: mileStone.description })
    }
  }

  for (const group of projectGroups) {
    const groupMileStones = JSON.parse((await $`glab api groups/${group.id}/milestones`).stdout)

    for (const mileStone of groupMileStones) {
      mileStones.push({ id: mileStone.id, iid: mileStone.iid, title: mileStone.title, description: mileStone.description })
    }
  }
  if (mileStones.length > 0) {
    echo(chalk.bold(`\MILESTONES`))
    mileStones.forEach((element, idx) => {
      echo(chalk.blue(`${idx}: ${element.title} | ${element.description}`))
    });
    const selectedMilestone = (await question(chalk.yellow(`Select a mileStone to assign the merge reqeuest to [enter the index or leave blank]: `)))
    if (selectedMilestone.length > 0) {
      return mileStones[selectedMilestone]
    }
  }
}

const glab_cmr = async () => {
  const glabVersion = (await $`glab --version`).stdout
  if (glabVersion.startsWith('glab version')) {
    echo(chalk.bold(`CREATE MERGE REQUEST and NEW BRANCH`))
    echo(
      `This application creates a new merge request and a matching branch.
First you are asked for the name of the new branch to be created.
The program then lists all the labels that are available for the repo.
You can select those that should be assigned to the merge request.
At the end, the program shows a list of all settings that will be used subsequently.
The merge request is not created until you confirm this information.`)

    let current_branch = await $`git branch --show-current`

    const homeDir = os.homedir()
    const config = fs.readFileSync(`${homeDir}/.config/glab-cli/config.yml`, { encoding: 'utf8' })
    const user = YAML.parse(config).hosts['code.axians.com'].user
    echo(chalk.black.bgYellow(`Your gitlab user is: ${user}`))

    const branchName = await question(chalk.yellow('\nEnter the new branch name [feature/...]: '))
    let targetBranch = await question(chalk.yellow(`\nEnter the target branch name [leave empty, if it's develop]: `))
    if (!targetBranch) targetBranch = `develop`
    // const branchDefault = 'feature/'
    // const branchName = await $`read -e -p "branch name: " -i ${branchDefault}`

    let description = await question(chalk.yellow(`\nEnter the description [leave empty for 'Draft: ${branchName}']: `))
    if (!description) description = `Draft: ${branchName}`

    const labels = await $`glab label list --output json`.json()
    let labelNames = ""
    if (labels.length > 0) {
      echo(chalk.bold(`\nLABELS`))
      labels.forEach((element, idx) => {
        echo(chalk.blue(`${idx}: ${element.name} | ${element.description}`))
      });
      const arrSelectedLabels = (await question(chalk.yellow(`Select lables to add to the merge reqeuest [separate indexes by comma]: `))).split(',');
      if (arrSelectedLabels.length > 0 && arrSelectedLabels[0].trim() !== '') {
        labelNames = arrSelectedLabels.map(labelIdx => labels[labelIdx].name).join(',')
      }
    }

    const mileStone = await getMileStone()
    let mileStoneTitle = ''
    let mileStoneId = ""
    if (mileStone) {
      mileStoneTitle = mileStone.title
      mileStoneId = mileStone.id
    }

    echo(chalk.black.bgCyan(`\nI will create a new branch and merge request with the following data`))
    echo(chalk.blue(
      `branchname: ${branchName}
mr title: ${branchName}
mr description: ${description}
mr assignee: ${user}
mr label: ${labelNames}
mr mileStone: ${mileStoneTitle}
mr mileStoneId: ${mileStoneId}
mr source-branch: ${branchName}
mr target-branch: ${targetBranch}
mr settings:  
      --draft
      --create-source-branch
      --squash-before-merge
      --remove-source-branch
`))

    const bStart = await question(chalk.yellow(`Do you want to use this settings [y/n]? `))

    if (bStart.toUpperCase() === 'Y') {

      await $`glab mr create --assignee ${user} \
--draft \
--title ${branchName} \
--description ${description} \
--source-branch ${branchName} \
--target-branch ${targetBranch} \
--create-source-branch \
--squash-before-merge \
--remove-source-branch
`
      if (labelNames && mileStoneId) {
        await $`glab mr update ${branchName} \
--label ${labelNames} \
--milestone ${mileStoneId} \
`
      } else if (labelNames) {
        await $`glab mr update ${branchName} \
--label ${labelNames} \
`
      } else if (mileStoneId) {
        await $`glab mr update ${branchName} \
--milestone ${mileStoneId} \
`
      }

      await $`git fetch origin`
      await $`git switch ${branchName}`

      echo(chalk.black.bgCyan(`\nThis merge request has been created`))
      echo(await $`glab mr list --source-branch=${branchName}`)
      echo(chalk.black.bgCyan(`\nYou are now on branch ${branchName}`))
      echo(chalk.green(`\nFINISHED\n`))
    } else {
      echo(chalk.blue(`Ok, good bye`))
    }
  } else {
    echo(chalk.red(`I'm sorry, but it seems that you have not installed the gitlab cli`))
    echo(chalk.yellow(`Have a look: https://gitlab.com/gitlab-org/cli#installation`))
  }

}

export default glab_cmr

