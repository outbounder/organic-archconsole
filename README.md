# What is this? #

![Archconsole](https://raw.github.com/outbounder/organic-archconsole/master/preview.png)

This is very limited web based unix/win/mac terminal.
It is the simplest implementation ever still enough to handle:

* everyday nodejs development
* very basic server administration via ssh+paired keys
* simple autocomplete
* command chaining (using `&&` and `|` )

# Why? #

Archconsole is inspired heavily from TermKit (https://github.com/unconed/TermKit), but its aim is to enrich nodejs daily development by giving easier dev. env. modifications in self-hosted mode. In addition it is `organic inside`, which will bring tighter integration with organic based projects.

# How? #

## How to use ##

1. start
2. open http://localhost:3333/
3. input terminal command

Notes:

* every command has a marker on its left.
  * green - then command completed successfully.
  * red - failure occurred.
  * organge/blue - then the command is still running.
* ctrl+end - goes to the bottom of the shell and docks there showing the output of last running command
* ctrl+shift+c terminates last started command
* use ctrl+shift+enter to restart last started command
* when command is still running you can see it on top of the browser window with a number
  * ctrl+shift+`number` - restarts that command
  * alt+shift+`number` - terminates that command

## Experimental

scripting of custom commands in javascript:

* alt+shift+g - runs `git status`
* alt+shift+r - reads from current directory `package.json` and executes via `node` its `main`

See /bin/shellstart/*.js files for more info.

## Requirements ##
* nodejs v0.10.18 or above

## How to install ##

    $ git clone repo `target`
    $ cd `target`
    $ npm install

### if you don't have angel yet ###

    $ npm install organic-angel -g

## How to start ##

    $ cd `target`
    $ angel Cell start archconsole.js

## How to stop ##

    $ cd `target`
    $ angel Cell stop archconsole.js

## How to restart ##

    $ cd `target`
    $ angel Cell restart archconsole.js

# Attention #

This is pre-alpha version, I'm on it daily and actually used v0.0.1 to build v0.0.2. So it is these days usable at some extend.

# how to contribute #

1. fork
2. create a pull request

*or*

1. file any [issues/ideas/comments](https://github.com/outbounder/organic-archconsole/issues)


# License #

MIT
