Script to work out the Effective Business Days, uses data from [Australian Public Holidays Dates Machine Readable Dataset](https://data.gov.au/dataset/australian-holidays-machine-readable-dataset) and outputs a csv file. You can use that csv file to upload to Chartio and use the data.

To run it: `npm install` then `node ebd.js` and you should see `output-ebd.csv` generated.

Current script is limited to 3 states (VIC, QLD, NSW), but you can change it on line 14.