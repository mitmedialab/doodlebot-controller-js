# Feb 9, 2023

When implementing the look ahead feature to know which move to use, it was very annoying because the UI showed only the beginning
and ending positions (not the intermediate steps). I tried using `Workers`, `setInterval`, `setTimeout` but nothing worked. I think
that Javascript doesn't really draw until a method of the main thread has finished. Finally, I figured that I was outputting the full path (meaning, all optimal steps), whereas what I should be doing was to just output 1 step at a time. Basically, the `move` method in `startMovingButton_ClickHandler` has to require **1** frame, thus only 1 step. Fixing this helped solve the issue.
