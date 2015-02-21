# What is this? #

![Archconsole](https://raw.github.com/outbounder/organic-archconsole/master/preview.png)

This is very limited web based unix/~~win~~/mac terminal.
It is the simplest implementation ever still enough to handle:

* everyday nodejs development
* very basic server administration via ssh+paired keys
* simple autocomplete
* command chaining (using `&&` and `|` )
* shell/terminal mode of command execution (supporting `sudo`, `ssh` & etc...)
thanks to [pty.js](https://github.com/chjj/pty.js/) & [term.js](https://github.com/chjj/term.js/)
  * this is experimental, don't expect to work, especially on windows

# Why? #

Archconsole is inspired heavily from TermKit (https://github.com/unconed/TermKit),
but its aim is to enrich nodejs daily development by giving easier dev. env. modifications in self-hosted mode.
In addition it is `organic inside`, which will bring tighter integration with organic based projects.

# How? #

## How to use in browser ##

1. $ node archconsole.js
2. open http://localhost:3333/
3. input terminal command

## how to use in nodewebkit ##

1. $ node archoconsole.js
2. $ nodewebkit ./

## Features

* scripting of custom commands and plugins in javascript

  See /bin/shellstart/*.js files for more info.

### shortcut combos

* every command has a marker on its left.
  * green - then command completed successfully.
  * red - failure occurred.
  * organge/blue - then the command is still running.

* `ctrl+space` - goes to the bottom of the shell and toggles command input focus
* `ctrl+shift+c` - terminates last started command
* `ctrl+shift+enter` - restarts last started command

* when command is still running you can see it on top of the browser window with a number
  * `ctrl+shift+1` - restarts that command with number `1`
  * `alt+shift+2` - terminates that command with number `2`

### git

* `alt+shift+g` - runs `git status` on current working directory

### ungit

* `alt+shift+enter` - runs `ungit` on current working directory

### node

* `alt+shift+r` - reads from current directory `package.json` and executes via `node` its `main`
* `alt+shift+t` - reads from current directory `package.json` and executes via `node` its `scripts.test`

### terminal

* `shift+enter` - when starting command by pressing `shift`+`enter` it will be executed in terminal.
This although not very stable is providing robust support for terminal usage of `sudo`, `vim` & alike...

### cwd-status

thanks to [gift](https://github.com/sentientwaffle/gift)

* `ctrl+shift+space` - checks current directory and if it is git updates status bar:
  * shows not committed changes if any
  * shows current branch name
  * shows not pushed or not pulled committs if any

### nvm

* `nvm v0.8.14` - switches current working version of node. Works only when running node installed via [nvm](https://github.com/creationix/nvm)

## Requirements ##

* nodejs v0.8.14 || v0.10.18 || above

### quick-cd

remembers visited paths when you `cd` into them.

* `ctrl+alt+z` brings in list of sorted by most visited remembered paths with support for quick cd into them.

### edit

* `ctrl+alt+shift+e` - runs `atom` (atom.io) editor at current working directory

### nodewebkit related 

* global shortcut keys
  * `ctrl+alt+a` - show/hide archconsole when running in nodewebkit
* type `exit` - closes the current archconsole window

## How to install ##

    $ git clone repo `target`
    $ cd `target`
    $ npm install

### Note for windows
Make sure you have [node-gyp requirements installed](https://github.com/TooTallNate/node-gyp#installation)

### use angel to manage ###

    $ npm install organic-angel -g

## starting ##

    $ cd `target`
    $ angel app start archconsole-staging.js

## stoping ##

    $ cd `target`
    $ angel app stop archconsole-staging.js

## restarting ##

    $ cd `target`
    $ angel app restart archconsole-staging.js

# Attention #

This is pre-alpha version, I'm on it daily and actually used v0.0.1 to build next versions.
So it is these days usable at some extend.

# how to contribute #

1. fork
2. create a pull request

*or*

1. file any [issues/ideas/comments](https://github.com/outbounder/organic-archconsole/issues)


# License #

MIT
