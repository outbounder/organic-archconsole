# What is this? #

![Archconsole](https://raw.github.com/outbounder/organic-archconsole/master/preview.png)

This is very limited web based unix/win/mac terminal.
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

## How to use ##

1. start
2. open http://localhost:3333/
3. input terminal command

## Features

* every command has a marker on its left.
  * green - then command completed successfully.
  * red - failure occurred.
  * organge/blue - then the command is still running.

* `ctrl+end` - goes to the bottom of the shell and docks there showing the output of last running command
* `ctrl+shift+c` - terminates last started command
* `ctrl+shift+enter` - restarts last started command
* `ctrl+space` - focuses command input

* when command is still running you can see it on top of the browser window with a number
  * `ctrl+shift+1` - restarts that command with number `1`
  * `alt+shift+2` - terminates that command with number `2`

## Experimental

* scripting of custom commands and plugins in javascript

See /bin/shellstart/*.js files for more info.

### git

* `alt+shift+g` - runs `git status` on current working directory


### node

* `alt+shift+r` - reads from current directory `package.json` and executes via `node` its `main`
* `alt+shift+t` - reads from current directory `package.json` and executes via `node` its `scripts.test`

### terminal

* `shift+enter` - when starting command by pressing `shift`+`enter` it will be executed in terminal.
This although not very stable is providing robust support for terminal usage of `sudo`, `vim` & alike...

### cwd-status

thanks to [gift](https://github.com/sentientwaffle/gift)

* `ctrl+shift+space` - checks current directory and if it is git updates status bar:
  * shows are there any not committed changes
  * shows current branch name
  * shows are there any not pushed or not pulled committs

### nvm

* `nvm v0.8.14` - switches current working version of node. Works only when running node installed via [nvm](https://github.com/creationix/nvm)

## Requirements ##
* nodejs v0.8.14 || v0.10.18 || above
* unix/win platform

## How to install ##

    $ git clone repo `target`
    $ cd `target`
    $ npm install

### Note for windows
Make sure you have [node-gyp requirements installed](https://github.com/TooTallNate/node-gyp#installation)

### using angel to deamonize ###

    $ npm install organic-angel -g

## starting ##

    $ cd `target`
    $ angel Cell start archconsole-staging.js

## stoping ##

    $ cd `target`
    $ angel Cell stop archconsole-staging.js

## restarting ##

    $ cd `target`
    $ angel Cell restart archconsole-staging.js

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
