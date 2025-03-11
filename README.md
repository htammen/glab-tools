# GLAB TOOLS

![NPM Version](https://shields.sp-codes.de/npm/v/glab-tools)
![NPM License](https://shields.sp-codes.de/npm/l/glab-tools)

This package is a collection of cli tools for your daily work
with gitlab repositories.  
I primarily created the tools in this package for my personal
needs in the projects I'm involved in.
So it might not fit to everyones needs.

If you find this package useful or only find the idea nice feel free to fork it,
add features and create a PR.

## Prerequisites

The tools in this collection are cli tools that work with your git repositories
that reside on gitlab.com or private gitlab installation.

The tools do not use the REST API of gitlab but leverage command line tools.  
This is done via [Googles zx](https://google.github.io/zx/) node.js library.

So you need a [git cli](https://git-scm.com/downloads).

Additionally you need the [gitlab cli](https://gitlab.com/gitlab-org/cli).  
Make sure you go through the
[authentication step](https://gitlab.com/gitlab-org/cli#authentication).  
I only tested it with with a [personal access token](https://gitlab.com/gitlab-org/cli#personal-access-token).
Hence I cannot help you with any problems of the other methods.  
Without this configuration most of the tools of this collection will
not run.

Since version 1.0.3 [jq](https://jqlang.org/) is also required

## installation

Install it via npm, yarn or whatever node.js package manager you use.

```npm
npm install -D glab-tools
```

## What's in here / Usage?

Currently there are only a few tools in there. I will hopefully
add more if I see a need.

### glab-tools cmr

cmr stands for **create merge request**. So this tool creates a merge request
in your current reqpository.

Start it with

```node
npx glab-tools cmr
```

You can enter a `source branch` and a `target branch`.
The source branch is a branch that is created by this tool.
The target branch is the branch that your coding gets merged
to when you merge your changes.

In my projects we develop every feature in a feature branch.
As soon as the developer has implemented everything we merge this
feature branch into our `develop` branch.

So this tool

- asks you for the name of the new branch (source branch, e.g. feature/xyz)
- asks you for the name of the target branch (e.g. develop or main).
If it is `develop` you can leave it blank.
- Then you can choose one or more labels you want to assign to the merge request
- After this step you get a summary of how the merge request will be created  
Example:

```bash
    branchname: feature/test-32
    mr title: feature/test-32
    mr description: Draft: feature/test-32
    mr assignee: helmut.tammen
    mr label: bugfix
    mr source-branch: feature/test-32
    mr target-branch: develop
    mr settings:
          --draft
          --create-source-branch
          --squash-before-merge
          --remove-source-branch
```

- As soon as you confirm the tool creates a merge request,
- which automatically creates a feature branch.
- It then switches to the newly created branch at your local PC.

### glab-tools mmr

mmr stands for **merge merge request**. So this tool merges a before
created merge request from the source branch (e.g. feature branch) into
the target branch of the merge request (e.g. develop or main branch).

Start it with

```node
npx glab-tools mmr
```

The tool

- first checks if you have staged all your changes.
- Then it checks if you have pushed all your commits.
- If these checks have been passed you select the merge request you want to
merge from a list of open merge requests.
- Before the merge is processed you see a summary of the selected merge requests
and have to confirm your choice.
- It then marks the merge request ready,
- merges it into the target branch, what automatically deletes the source branch
at the server, if you have not changed the setting,
- switches locally to the target branch (e.g. develop or main),
- and deletes the local branch.

## Why do you push a gitlab tool to github?

Good question. It's mainly because I have to work with gitlab at work.
In my spare time I push most of
my work to github. Cause this is a private / personal project I decided
to push it to github.
