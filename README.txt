Link to video demonstration hosted in Kaltura Mediaspace in case program does not run:

https://mediaspace.wisc.edu/media/Edited+DC3+Demo+-+XLiu/1_sfyn2il8



Amazon Product Categories Icicle run instructions:

Easiest to run from VSCode if you install the extension Live Server from the VSCode extensions tab.
- Once installed, open up main.html, right click and select "Open with Live Server"
- Internet connection probably needed because this uses d3 sources which need to be reached


***No Longer Works!***
Running on Mozilla Firefox also an option
- select the main.html file and select open with firefox
- If tree does not load, check the inspector (ctrl+shift+I)
  - If it is a CORS request error, go to about:config in Firefox
  - search for "cors" and an option called "content.cors.disable" should show up with corresponding value true
  - double click to change to false
  - close and reopen main.html using Firefox

*All files are meant to be at the same level of the file structure. No files used in this application is nested in any subfolders.

Program is initially set to run using the "PetSupplies.csv" to save memory. It is possible to use the full data in "all-nodes.csv"
to run this program. Changes can be made in "datavis.js".
