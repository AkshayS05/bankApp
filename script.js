'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Akshay Sharma',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-03-29T21:31:17.178Z',
    '2022-03-28T07:42:02.383Z',
    '2022-03-27T09:15:04.904Z',
    '2022-03-26T10:17:24.185Z',
    '2022-03-25T14:11:59.604Z',
    '2022-02-24T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Sunny Sharma',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// containerApp.style.opacity = 100;

/////////////////////////////////////////////////
//creating the login functionality
let currentUser, timer;
// currentUser = account1;
// updateUI(currentUser);
// containerApp.style.opacity = 1;
//INTL Api to create dates

//passing the data to the function
const formatMovementDates = function (date, locale) {
  const calcDaysPassed = (date1, date2) => {
    return Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  };
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  return new Intl.DateTimeFormat(locale).format(date);
};
//creating a global functin to use in other apps also
const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
//a function for countdown
const countdownTimer = function () {
  const tick = () => {
    let minutes = String(Math.floor(time / 60)).padStart(2, 0);
    let seconds = String(Math.floor(time % 60)).padStart(2, 0);
    //in each call print the remining time to Ui
    labelTimer.textContent = `${minutes}:${seconds}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 360;
  tick();
  //call the timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs?.forEach((mov, i) => {
    const type = mov < 0 ? 'withdrawal' : 'deposit';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDates(date, acc.locale);
    const formattedMov = formatCurr(mov, acc.locale, acc.currency);
    const html = `<div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>

        <div class="movements__value">${formattedMov}</div>
      </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
//creating usernames
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);
const updateUI = function (acc) {
  acc && displayMovements(acc);
  acc && displayBankBalance(acc);
  acc && calcDisplaySummary(acc);
  acc && displayBankTransfer(acc);
  acc && displayInterest(acc);
};
//using filter methods to create an array of depoists and also for withdrawals

//creating a total/account balance using reducer
const displayBankBalance = function (acc) {
  acc.balance = acc.movements.reduce((accu, mov) => accu + mov, 0);
  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};
const calcDisplaySummary = function (acc) {
  // console.log(movements);
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(income, acc.locale, acc.currency);
};
const displayBankTransfer = function (acc) {
  const transfer = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(transfer, acc.locale, acc.currency);
};
const displayInterest = function (acc) {
  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * acc.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  //find if the current username exists in the database
  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);

  //using optional chaining match the pin entered with the user pin
  if (currentUser?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back ${
      currentUser.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    ////////////////////////////////////////////////////////
    const now = new Date();
    //locale srtring= en-Us
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      // month: '2-digit',
      month: '2-digit',
      year: 'numeric',
      // weekday: 'short',
    };
    // const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentUser.locale,
      options
    ).format(now);
  }

  //make the ui visible
  //making the input values empty after successful login
  inputLoginPin.value = inputLoginUsername.value = '';
  //to remove the focus
  inputLoginPin.blur();

  // if user is logged in then timer would have been called already, thus it will go to a line number 261 and call the countdowntimer, if in between the running time, the other user logged in, we will check if timer already exists we will clear that and then call the new timer again
  if (timer) clearInterval(timer);
  timer = countdownTimer();
  updateUI(currentUser);
});

//creating the transfer functionality
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const recieverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferAmount.blur();
  if (
    amount > 0 &&
    recieverAccount &&
    currentUser.balance >= amount &&
    recieverAccount?.username !== currentUser.username
  ) {
    recieverAccount.movements.push(amount);
    currentUser.movements.push(-amount);
    //Add transfer date
    currentUser.movementsDates.push(new Date().toISOString());
    recieverAccount.movementsDates.push(new Date().toISOString());
    //reset timer
    // we need to reset s that if any activity happens within the given time, we do not consider it as inactive and start the timer again.
    clearInterval(timer);
    timer = countdownTimer();
    updateUI(currentUser);
  }
});
// const myDate = new Date(2050, 10, 20, 7, 23);
// console.log(myDate);
//closing an account
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentUser?.username &&
    +inputClosePin.value === currentUser?.pin
  ) {
    const getIndex = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(getIndex, 1);
  }
  containerApp.style.opacity = 0;
  inputCloseUsername.value = inputClosePin.value = '';
});
//Requesting Loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  let loanApproval = false;

  const requestedAmount = +inputLoanAmount.value;
  if (
    requestedAmount &&
    currentUser.movements.some(mov => mov > requestedAmount * 0.1)
  ) {
    loanApproval = true;
    setTimeout(function () {
      currentUser.movements.push(Math.floor(requestedAmount));
      currentUser.movementsDates.push(new Date().toISOString());
      //reset timer
      // we need to reset s that if any activity happens within the given time, we do not consider it as inactive and start the timer again.
      clearInterval(timer);
      timer = countdownTimer();
      updateUI(currentUser);
    }, 2500);
  }

  if (loanApproval === true) {
    btnLoan.disabled = true;
  }
  //   window.alert(
  //     'Please contact your nearest branch for further loan approvals'
  //   );
  // }
  inputLoanAmount.value = '';
});
//sorting the move,ments, using inbuilt sort
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentUser, !sorted);
  sorted = !sorted;
});
/////////////////////////////////////////////////////////////////////
///Assigment-1
// const juliaDogs = [3, 5, 2, 12, 7];
// const kateDogs = [4, 1, 15, 8, 3];
// const checkDogs = function (dogsJulia, dogsKate) {
//   const dogs = dogsJulia.concat(dogsKate).map(
//     (dog, index) => `Dog ${index + 1}: ${dog >= 3}:is an Adult: is a puppy`
//     // return dog >= 3
//     //   ? `Dog number ${index + 1} is an Adult`
//     //   : `Dog number ${index + 1} is a puppy`
//   );
// };

// const juliaActualDogs = juliaDogs.slice();
// juliaActualDogs.splice(0, 1);
// juliaActualDogs.splice(-2);
// checkDogs(juliaActualDogs, kateDogs);
//////////////////////////////////////////
// Coding challenge #2
// const dogs = [5, 2, 4, 1, 15, 8, 3];
// const calcAverageHumanAge = function (dogsAges) {
//   const humanAges = dogsAges
//     .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))
//     .filter(age => age > 18);

//   console.log(humanAges);

//   const average =
//     humanAges.reduce((acc, age) => acc + age, 0) / humanAges.length;

//   return average;
// };

// //calculating average human age
// const ages = calcAverageHumanAge(dogs);
// console.log(ages);
//coding challenge #3
//assigment
// console.log(accounts);
// for (let user of accounts) {
//   if (user.owner === 'Jonas Schmedtmann') {
//     console.log(user);
//   }
// }
//flat and flatMap methods
// example to combine and get the total of all the account's movements
// const totalAmount = accounts
//   .map(acc => acc.movements)
//   .flat()
//   .reduce((accu, mov) => accu + mov, 0);
// console.log(totalAmount);
//using flatMap
// const totalAmount = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((accu, mov) => accu + mov, 0);
// console.log(totalAmount);
// Assignment to create 100 dice rolls using Array.from
// const y = Array.from(
//   { length: 100 },
//   (_, i) => Math.floor(Math.random() * i) + 1
// );
// console.log(y);
// converting query selector to an array for movements
// labelBalance.addEventListener('click', function (e) {
//   const movementsUI = Array.from(
//     document.querySelectorAll('.movements__value'),
//     el => Number(el.textContent.replace('$'), '')
//   );
//   console.log(movementsUI);
// });
//Array methods practice
//bank deposite sum
// const deposits = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 0)
//   .reduce((accu, curr) => accu + curr, 0);
// console.log(deposits);
// Total deposits above 1000
// const depositsAbove1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(mov => mov > 1000).length;
// console.log(depositsAbove1000);
// Total deposits above 1000 using reduce
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .reduce((count, curr) => (curr >= 1000 ? ++count : count), 0);
// console.log(numDeposits1000);
// we can not use count++ and it will do the postincrement and at every loop we will get 0 so we can use pre increment operator to handle such cases
//object to calculate deposits and withdrawals
// const sums = accounts
//   .flatMap(acc => acc.movements)
//   .reduce(
//     (sum, curr) => {
//       // curr > 0 ? (sum.deposits += curr) : (sum.withdrawals += curr);
//       sum[curr > 0 ? 'deposits' : 'withdrawals'] += curr;
//       return sum;
//     },
//     { deposits: 0, withdrawals: 0 }
//     //using bracket notation to avoid repition
//   );
// console.log(sums);
// making titles
// const titles = function (word) {
//   const exceptions = [
//     'a',
//     'an',
//     'the',
//     'but',
//     'and',
//     'or',
//     'at',
//     'on',
//     'in',
//     'with',
//   ];
//   const capitalize = str => str[0].toUpperCase() + str.slice(1);
//   const capital = word
//     .toLowerCase()
//     .split(' ')
//     .map(word => (exceptions.includes(word) ? word : capitalize(word)))
//     .join(' ');
//   //the above function will first convert the whole given sentence to a lower case which then will be splitted with a space. Then the whole sentence will be iterated over with a check that if the word is an exceptions. If word is not an exception, then the capitalize function will be called which will make the string's first chacater to capital.

//   //At last the capitalize function is again called on a result of capital so that in case the exception is the first word, it will be converted to the capital.
//   return capitalize(capital);
// };
// const title = 'This is the first title of my page';
// const title1 = 'This is the another title located on a page';
// const title2 = 'and title which also inclde the example is this one';
// console.log(titles(title));
// console.log(titles(title1));
// console.log(titles(title2));
/////////////////////////////////////////////////////////////////
//Arrays last assignment
/* 
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).
1. Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. Do NOT create a new array, simply loop over the array. Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)*/
// TEST DATA://
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];
// dogs.map(
//   dog => (dog.recommendedFoodPortion = Math.trunc(dog.weight ** 0.75 * 28))
// );

// 2. Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
// const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
// console.log(
//   // dogSarah.curFood > dogSarah.recommendedFoodPortion * 0.9 &&
//   //   dogSarah.curFood < dogSarah.recommendedFood * 1.1
//   //   ? 'Dog is eating within the recommnded amount'
//   //   : dogSarah.curFood > dogSarah.recommendedFoodPortion * 0.9 &&
//   //     dogSarah.curFood > dogSarah.recommendedFood * 1.1
//   //   ? 'Dog is eating more than the recommended amount'
//   //   : 'okay'
//   dogSarah.curFood
// );
// console.log(
//   `Sarah's dog is eating too ${
//     dogSarah.curFood > dogSarah.recommendedFoodPortion ? 'much' : 'little'
//   }`
// );
// 3. Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and an array with all owners of dogs who eat too little ('ownersEatTooLittle').
// const ownersEatTooMuch = dogs
//   .filter(dog => dog.curFood > dog.recommendedFoodPortion)
//   .flatMap(dog => dog.owners);

// const ownersEatTooLess = dogs
//   .filter(dog => dog.curFood < dog.recommendedFoodPortion)
//   .flatMap(dog => dog.owners);

// 4. Log a string to the console for each array created in 3., like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
// console.log(`${ownersEatTooMuch.join(' and ')}'s dog eat too much`);
// console.log(`${ownersEatTooLess.join(' and ')}'s dogs eat too less!`);
// 5. Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
// console.log(dogs.some(dog => dog.curFood === dog.recommendedFoodPortion));
// 6. Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
// const checkOkayAmount = dog =>
//   dog.curFood > dog.recommendedFoodPortion * 0.9 &&
//   dog.curFood < dog.recommendedFoodPortion * 1.1;
// const check = dogs.some(checkOkayAmount);
// console.log(check);
// 7. Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
// console.log(dogs.filter(checkOkayAmount));
// // 8. Create a shallow copy of the dogs array and sort it by recommended food portion in an ascending order (keep in mind that the portions are inside the array's objects)
// console.log(
//   dogs
//     .slice()
//     .sort((a, b) => a.recommendedFoodPortion - b.recommendedFoodPortion)
// );
// HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
// HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). Basically, the current portion should be between 90% and 110% of the recommended portion.*/
// console.log(dogs);

// ownerDog(dogs);
//More exercises on Math
// const randomInt = (min, max) => Math.trunc(Math.random() * max - min) + 1 + min;
// console.log(randomInt(10, 20));
// console.log(Math.round(23.3));
// console.log(Math.round(23.9));
// console.log(Math.ceil(23.1));
// console.log(Math.floor(23.9));
// console.log(Math.floor(23.3));
// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.3));
// //rounding decimals
// console.log((2.75).toFixed(1));
// console.log((2.19).toFixed(1));
//Remainder operator
// console.log(5 % 2);
// console.log(5 / 2);
// console.log(12 % 3);
// console.log(12 / 3);
// console.log(14 % 3);
// console.log(14 / 3);
//Numeric separator
// const diameter = 287_460_000_000;
// console.log(diameter);
// console.log(Number('23_000')); //will not work and results in NaN
// console.log(parseInt('23_000')); // will only convert the part before the underscore
// //Working with BigInt
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);
// console.log(20n === 20);
// const num = 30n;
// console.log(num + 'is the number'); // will convert to the string
//working with dates
// const date = Date.now();
// console.log(date);
//operations with dates
// const calcDaysPassed = (date1, date2) => {
//   return Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
// };
// console.log(calcDaysPassed(new Date(2022, 3, 28), new Date(2022, 3, 30)));
// internationalizing the num
// const num = 388764.24;
// console.log(num);

// const options = {
//   style: 'currency',
//   unit: 'celsius',
//   currency: 'EUR',
//   // useGrouping: false,
// };
// console.log(
//   'US:          ',
//   new Intl.NumberFormat('en-US', options).format(num)
// );
// console.log('DE        ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.langauge, options).format(num)
// );
//setimeout function
// const ingredients = ['onions', 'mushrooms', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2, ing3) =>
//     console.log(`Here is your pizza with ${ing1} and ${ing2} over it`),
//   3000,
//   ...ingredients
// );
// if (ingredients.includes('tomato')) {
//   clearTimeout(pizzaTimer);
// }

// console.log(new Intl.DateTimeFormat(navigator.locale, allOptions).format(date));
// setInterval(function () {
//   const now = new Date();
//   const allOptions = {
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric',
//   };
//   const intl = new Intl.DateTimeFormat(navigator.locale, allOptions).format(
//     now
//   );
//   console.log(intl);
// }, 1000);
