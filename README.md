# Journalling Plugin

## What is this thing?
This plugin is still in its beta stage, all its features are being developed and need working on. 
To download and use this plugin the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) must be added to your vault.

The design is supposed to be modular, new setting objects, handlers can all be used independently and different services can be turned on and off with the commenting out of a single line which makes testing and debugging a lot easier. If you find any of the code here useful for your own plugin, feel free to use it and post questions here if you have any. I would also like to thank Liam Cain's periodic notes for his code on making suggesters, which I modified slightly to fit my own use case. 

## Services Briefing
Currently the 4 services this plugin offers are: 

1. Journalling
> This is currently the core of this plugin and will always be the main theme. I wanted to make a plugin that automated journal creation process and sent regular reminders for when certain notes had to be created/filled in. Currrently it offers customizability on the kind of journal you want, in the future more related features may be added as well as expansions to the current journalling feature suite. 
> Creating a journal, also creates the respective daily notes, for now and the plugin only support weekly journals, support for other kinds of journals will be added soon.

2. Notifications
> These were designed so as to not disrupt any functioning on your mobile devices, so the commands that would work on mobile and computer devices are still valid, but those functions will not disrupt your proceedings on mobile.

3. Reminders
> Currently there is no way to make new reminders, but that will be changed in the future, maybe even connecting to your ICloud account, right now they only work with your journal and periodic note reminders.

4. Periodic Notes
> I found Liam Cain's plugin a little lacking in features so I wanted to add features of my own. Right now my plugin only works with my periodic notes, but in the future I may try and add support for his plugin as well. 

## Disclaimers
Right now as I just wanted to get the plugin out and running, there are some features for which settings exist, but they are currently not active. 

1. Autocreation:
There is no off mode for the autocreation, it will always be on.
