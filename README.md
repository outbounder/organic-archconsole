# What is this? #

This is very limited web based unix/win/mac terminal.
It is the simplest implementation ever still enough to handle:

* everyday nodejs development (hint: use CTRL+SHIFT+ENTER to re-launch running process)
* very basic server administration via ssh+paired keys
* extensions & plugins (hint: every command which outputs `iframe` tag will force rendering that iframe as html element)
* simple autocomplete
* fast command history search (hint: use CTRL+F :) )

# Why? #

Archconsole is inspired heavily from TermKit (https://github.com/unconed/TermKit), but its aim is to enrich nodejs daily development by giving easier dev. env. modifications in self-hosted mode. In addition it is `organic inside`, which brings tighter integration with organic based projects as that is just a cell to cell communication.

# How? #

## Requirements ##
* nodejs v0.8.14 or above

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

## How to use ##

1. start 
2. open http://localhost:3333/ 
3. input terminal command

# Attention #

This is pre-alpha version, I'm still using it daily and actually using it for developing it. But still it could be harmful if you don't know what you're doing.

If you can't read Backbone javascript code, better wait for a stable version :)

# License #

MIT
