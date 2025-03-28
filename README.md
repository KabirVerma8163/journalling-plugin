# Journalling Plugin

## What is this thing?
This plugin is still in its beta stage, all its features are being developed and need working on. 
To download and use this plugin the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) must be added to your vault.

## Services Briefing
Currently the 4 services this plugin offers are: 

### 1. Journalling
> This is currently the core of this plugin and will always be the main theme. I wanted a plugin that automated journal creation process and sent regular reminders for when certain notes had to be created/filled in.
> Current Features 
> 1. Creating a journal, also creates the respective daily notes, (only weekly journals supported for now)
> 2. Journal Templating as well, Use {{links}} in your journal to embed daily note links as necesary.
> 3. Create a backlog of journal as neccesary with comfortable and intuitive UI
> 4. Adding folder heirachy as needed for journals
> 5. Linking to a home note to allow for easy access
> 6. Auto-updating in the background
> Now you can customize the position of the daily note links with <{links}> in your template note

### 2. Periodic Notes
> All the features of journalling accept home note linking. Use {{journal_link}} to embed the corresponding journal link in your daily notes.
> I found Liam Cain's plugin a little lacking in features so I wanted to add features of my own. Right now my plugin only works with my periodic notes, but in the future I may try and add support for his plugin as well. 

### 3. Notifications (Will fix outside of obsidian notifications in future releases)
> These were designed so as to not disrupt any functioning on your mobile devices, so the commands that would work on mobile. Desktop devices are still valid, but those functions will not disrupt your proceedings on mobile.

## Disclaimers
There is some code in here that's commented out, its the code for future features I haven't yet completed.

## Future plans
1. Adding more robust notifications
2. Reminders

The design is supposed to be modular, new setting objects, handlers can all be used independently and different services can be turned on and off with the commenting out of a single line which makes testing and debugging a lot easier. If you find any of the code here useful for your own plugin, feel free to use it and post questions here if you have any. I would also like to thank Liam Cain's periodic notes for his code on making suggesters, which I modified to fit my own use case. 

