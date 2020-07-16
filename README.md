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

| Field          | Description                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------|
| port           | Port to run the server on. Default is 8080                                                       |
| banner         | What text to display on the top banner of the page. Default is "File Center".                    |
| dir            | The directory of the files. Default is "./files".                                                | 
| uploads        | Whether users can upload files or not. Default is true.                                          | 
| https          | Whether the server is served with https or not. The default is false.                            | 
| httpsCert      | If https is true, this specifies the location of the cert file. Default is "./config/cert.pem".  | 
| httpsKey       | If https is true, this specifies the location of the key file. Default is "./config/key.pem".    | 
| statsFile      | Location of stats file. Default is "./config/stats.json".                                        | 
