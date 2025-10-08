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



<img width="1204" height="803" alt="image" src="https://github.com/user-attachments/assets/2c7b4cc6-39c1-4cb4-af49-2f2d87d9d704" />

<img width="1172" height="821" alt="image" src="https://github.com/user-attachments/assets/78b451ca-e1e9-4fc8-8022-16af0f194229" />
