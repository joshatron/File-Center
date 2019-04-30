File Center
===========

The goal of this app is to create a minimal web server that allows people to upload and download files with the server.

Running
-------

To build and run this program, you need to npm installed.

In order to get it set up, make sure you have npm installed and run the following commands:

    cd path/to/repo
    ./install
    
To run the server, run the following command:

    ./run
    
Config
------

You can change the behaviour of the server by editting the config.json file in the config folder.
The fields you can manage are as follows:

| Field          | Description                                                                                                                   |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| port           | Port to run the server on. By default the server runs on port 8080                                                            |
| banner         | What text to display on the top banner of the page. By default the server displays "File Center"                              |
| dir            | The absolute directory of the files. By default the server creates a directory called files inside the repo directory         |
