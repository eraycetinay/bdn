BDN (Blood Donor Network) created for to bring together 
patients and blood donors all around the world. 

About BDN

The app will provide a bridge between the patients and the 
volunteer blood donors. The index page of application have 
a map which includes all the blood donations. Patients can 
read those donations for to contact with donor and volunteers 
can add their information at the point where they live.

If you click an unused point which can be resolved by the 
arcGis api, you will see a donation form. You will get a 
link which includes your secret key for to future updates 
when you fill all areas in that form. You can use that 
link anytime you want to update or delete your marker.
If you drag your mouse on map you will see all the near 
markers in real-time. All the crud operations will reflect 
to other clients screen in real time. If you click any marker 
on map you will see all the contact info for that donation. 

Technologies 

MongoDb, Express.Js, AngularJs, Node.js are the main 
technologies used as a base structure. And Socket.io was 
used as a communication tool between clients and the server.

Npm and Bower used as a package manager for the backend 
and frontend within order.

In the backend part; Mongoose used as a object modelling 
tool and Lodash, http, path used as a helper tool for 
to create server architecture.

In the frontend part; AngularStrap and Bootstrap used 
together for to create all interfaces.
Ui-router used for a better routing performance, ng-mask 
used for form validations.
For the manage all esri-arcgis map structure better, 
angular-esri-map used in the whole actions. Additionaly 
angular-socket-io used for to manage all socket 
requests and callbacks.

For to run the application;
Install Node.js and MongoDb to your system.
Use the terminal and go to the project (‘code’) folder.
Run ‘npm install’ and ‘bower install’ commands in order to install the app.
Run ‘node server/app’ command for to start the server.
Go to ‘http://localhost:1111’ by using a browser.

For to run the application tests;
Use the terminal and go to the test (‘tests’) folder.
Run ‘npm install’ command to install the test app.
Run ‘mocha app’ command for to test the app.

