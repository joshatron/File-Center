Feature Ideas
=============

Below are some ideas to implement:

 * Admin controls
   * Add renaming files to interface
   * Add editting config page (or to bottom of page)
     * Add uploading cert files for https
   * Add viewing stats
   * Add creating directory
   * Add disabling admin enpoints if no admin password set
   * Add control to restart server possibly
 * Authentication improvements
   * Make more clean and easy to understand
   * allow endpoint if authorization header with proper password
 * Stats improvements
   * Add to run middleware on every request
 * Config improvements
   * If config updated that can't be hot reloaded, restart webapp if not handling other request, or at least notify user
 * File util improvements
   * File zip should be rewritten with async await in file walker file
   * Other file utilities should be moved to separate file
 * Server improvements
   * Need to restructure server file to have much less logic in it
 * UI improvements
   * Admin and index js should be merged to common code where possible
