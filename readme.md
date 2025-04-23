## Introduction

Do I need to pay to solve chess puzzle? No, Absolutely no need. Why chess.com make you pay for it. I am here to make all daily chess puzzle on chess.com become free

### Job

```sh
cd job

npm install

npm start {number of month}

or debug 1 specified month
DEBUG_MONTH=2007-05-01 npm start 1
# for example npm start 10 will pull last 10 months from current month

```

To pull all available puzzle

```
npm start
```

The puzzle will fetch month by month and stored in the puzzle folder in JSON format.

### UI

```sh
cd app
npm run dev
```

![image](https://user-images.githubusercontent.com/1183138/235556819-5ec05bcc-89ff-436d-bb4d-773e7b4ede3b.png)
