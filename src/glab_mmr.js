#!/usr/bin/env zx

import { chalk, question, echo, $, os, fs, YAML } from "zx"

const glab_mmr = async () => {
  const glabVersion = (await $`glab --version`).stdout
  if (glabVersion.startsWith('glab version')) {

    let current_branch = await $`git branch --show-current`
    echo(chalk.bold(`MERGE MERGE REQUEST and NEW BRANCH`))
    echo(
      `This application will merge a merge request from the branch associated with this mr into the defined target branch branch.
As soon as the merge has finished the remote and local branches will be deleted.\n`)

    const gitStatus = (await $`git status --porcelain`).stdout
    if (!gitStatus) {

      const gitAheadBehind = (await $`git log origin/${current_branch}..HEAD`).stdout
      if (!gitAheadBehind) {

        const homeDir = os.homedir()
        const config = fs.readFileSync(`${homeDir}/.config/glab-cli/config.yml`, { encoding: 'utf8' })
        const user = YAML.parse(config).hosts['code.axians.com'].user
        echo(chalk.black.bgYellow(`Your gitlab user is: ${user}`))
        echo(chalk.black.bgYellow(`Your current branch is: ${current_branch}`))

        const mrs = await $`glab mr list --output json`.json()
        if (mrs.length > 0) {
          echo(chalk.bold(`OPEN MERGE REQUESTS`))
          mrs.forEach((element, idx) => {
            echo(chalk.blue(`${element.iid} | ${element.author.name} | ${element.title} | ${element.source_branch} | ${element.target_branch}`))
          });
          const selectedMrs = (await question(chalk.yellow(`Select merge request to mark ready and merge [enter the id]: `)));
          echo(chalk.bold(`SELECTED MERGE REQUESTS`))
          const selectedMrJSON = await $`glab mr view ${selectedMrs} --output json`.json()
          const strOutput = `Merge Id: ${selectedMrJSON.iid}
target branch: ${selectedMrJSON.target_branch}
source branch: ${selectedMrJSON.source_branch}
title: ${selectedMrJSON.title} 
description: ${selectedMrJSON.description}
created at: ${selectedMrJSON.created_at}
updated at: ${selectedMrJSON.updated_at}
assignee: ${selectedMrJSON.assignee.name}
labels: ${selectedMrJSON.labels}
url: ${selectedMrJSON.web_url}
`
          echo(chalk.blue(strOutput))
          const bMerge = await question(chalk.yellow(`Are you sure that you want to merge this merge request [y/n]? `))

          if (bMerge.toUpperCase() === 'Y') {
            echo(chalk.green(`\nOk, lets merge`))
            // mark merge request as ready
            await $`glab mr update ${selectedMrs} --ready`
            // merge merge request into target (develop) branch
            await $`glab mr merge ${selectedMrs} --squash --yes`
            await $`git switch ${selectedMrJSON.target_branch}`
            // lokalen branch löschen
            await $`git branch -d ${selectedMrJSON.source_branch}`

            echo(chalk.black.bgCyan(`The merge request has been merged to '${selectedMrJSON.target_branch}' and the branches '${selectedMrJSON.source_branch}' have been deleted on server and locally`))
            echo(chalk.black.bgCyan(`\nYou are now on branch ${selectedMrJSON.target_branch}`))
            echo(chalk.green(`\nFINISHED\n`))
          } else {
            echo(chalk.blue(`\nOk, maybe later`))
          }
        } else {
          echo(chalk.red(`\nSorry, I can't find any open merge reqeuests`))
        }
      } else {
        echo(chalk.red(`You local branch differs from remote one. Please push or merge first`))
        echo(gitAheadBehind)
      }
    } else {
      echo(chalk.red(`You have unstaged changes in your branch ${current_branch}. Please commit or discard them first`))
      echo(gitStatus)
    }
  } else {
    echo(chalk.red(`I'm sorry, but it seems that you have not installed the gitlab cli`))
    echo(chalk.yellow(`Have a look: https://gitlab.com/gitlab-org/cli#installation`))
  }
}

export default glab_mmr
