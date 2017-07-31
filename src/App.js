import React, { Component } from 'react';
import './App.css';
import phone from './iphone6.png'
import charger from './charger.png'
import chargerDead from './charger-dead.png'
import heart from './heart.png'
import retweet from './retweet.png'
import close from './close.png'
import spaceship from './spaceship.png'
import spaceshipDead from './spaceship-dead.png'
import asteroid1 from './asteroid1.png'
import asteroid2 from './asteroid2.png'
import star from './star.png'

import { when, action, observable } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'


import { runSaga, effects } from 'redux-saga'


// http://rcptones.com/dev_tones/
const dripSound = new Audio(require('./pop_drip.wav'));
const clickSound = new Audio(require('./digi_plink.wav'));

function pickRandom(array) {
  return array[Math.floor(Math.random()*array.length)];
}


const maleNames = `James,John,Robert,Michael,William,David,Richard,Charles,Joseph,Thomas,Christopher,Daniel,Paul,Mark,Donald,George,Kenneth,Steven,Edward,Brian,Ronald`.split(',')
const femaleNames = `Olivia,Lily,Sophia,Emily,Amelia,Isabella,Isabelle,Sophie,Ella,Mia,Charlotte,Chloe,Grace,Alice,Jessica,Daisy,Hannah,Ruby,Lucy`.split(',')
const lastNames = `Smith,Jones,Taylor,Williams,Brown,Davies,Evans,Wilson,Thomas,Roberts,Johnson,Lewis,Walker,Robinson,Wood,Thompson,White,Watson,Jackson,Wright,Green,Harris,Cooper,King`.split(',')
const maleProfilePictures = [
  require('./male-profile/1.jpg'),
  require('./male-profile/2.jpg'),
  require('./male-profile/3.jpg'),
  require('./male-profile/4.jpg'),
  require('./male-profile/5.jpg'),
  require('./male-profile/6.jpg'),
  require('./male-profile/7.jpg'),
  require('./male-profile/8.jpg'),
  require('./male-profile/9.jpg'),
  require('./male-profile/10.jpg'),
]
const femaleProfilePictures = [
  require('./female-profile/1.jpg'),
  require('./female-profile/2.jpg'),
  require('./female-profile/3.jpg'),
  require('./female-profile/4.jpg'),
  require('./female-profile/5.jpg'),
  require('./female-profile/6.jpg'),
  require('./female-profile/7.jpg'),
  require('./female-profile/8.jpg'),
  require('./female-profile/9.jpg'),
  require('./female-profile/10.jpg'),
]

const emojis = [
  require('./emoji/1.png'),
  require('./emoji/2.png'),
  require('./emoji/3.png'),
  require('./emoji/4.png'),
  require('./emoji/5.png'),
  require('./emoji/6.png'),
  require('./emoji/7.png'),
]

function randomMaleName() {
  return `${pickRandom(maleNames)} ${pickRandom(lastNames)}`;
}
function randomFemaleName() {
  return `${pickRandom(femaleNames)} ${pickRandom(lastNames)}`;
}

function randomMaleProfilePicture() {
  return pickRandom(maleProfilePictures);
}
function randomFemaleProfilePicture() {
  return pickRandom(femaleProfilePictures);
}

function randomTweet() {
  const body = pickRandom(["amazing!", "funny!", "WOW!", "cool!"]);
  if (Math.random() < 0.5) {
    return { name: randomFemaleName(), body, profilePicture: randomFemaleProfilePicture(), liked: false, retweeted: false }
  }
  return { name: randomMaleName(), body, profilePicture: randomMaleProfilePicture(), liked: false, retweeted: false }
}

// https://www.pexels.com/search/cat/
function randomCatPhoto() {
  return pickRandom([
    require('./cats/1.jpg'),
    require('./cats/2.jpg'),
    require('./cats/3.jpg'),
    require('./cats/4.jpg'),
    require('./cats/5.jpg'),
    require('./cats/6.jpg'),
    require('./cats/7.jpg'),
    require('./cats/8.jpg'),
    require('./cats/9.jpg')
  ])
}

function randomCat() {
  return { photo: randomCatPhoto(), liked: false }
}

function randomName() {
  if (Math.random() < 0.5) {
    return randomFemaleName();
  }
  return randomMaleName();
}

function randomSubject() {
  const name = pickRandom([
    "Urgent!!",
    "Help me fix my computer!!!",
    "Help me with my problems!!",
    "Please reply!!",
    "Hi how was your holidays?",
    "Hi how was your weekend?",
    "Reply to this email please!!",
    "How do I email??",
  ]);
  const i = Math.floor(Math.random() * 5);
  return _.range(0, i).map(x => "RE: ").join(" ") + name;
}

const createEventListener = () => {
  let subscribers = [];
  return {
    subscribe: (callback) => {
      subscribers.push(callback);
      const disposer = () => {
        subscribers = subscribers.filter(x => x != callback);
      }
      return disposer;
    },
    emit: (obj) => {
      subscribers.forEach(x => x(obj))
    }
  }
}



function *sleep(time) {
  yield new Promise(resolve => setTimeout(resolve, time));
}
function *mobxWhen(func) {
  yield new Promise(resolve => when(func, resolve));
}












const gameFinishedListener = createEventListener();

const globalGameState = observable({
  totalDoneTasks: 0
})

const newState = () => observable({
  now: 0,
  levelSeconds: 60,
  levelCompleted: false,
  gameStart: true,
  gameOver: false,
  level: 3,

  systemUpdate: false,

  get gamePaused() {
    return this.levelCompleted || this.gameStart || this.gameOver;
  },

  battery: 1,
  page: 'home',
  notifications: [],
  taxi: {
    booked: false,
    arrive: undefined,
    driver: ""
  },
  email: {
    emails: _.range(0,5).map(x => ({
      subject: randomSubject(),
      from: randomName()
    }))
  },
  tweeter: {
    tweets: []
  },
  cats: [],
  emojis: {
    emojis: [
      { type: 'from', index: 2 },
    ]
  },
  todos: {
    todos: [],
    addTodo(todo) {
      todo.done = todo.done || false;
      const count = this.todos.push(todo);
      const newTodo = this.todos[count - 1];
      eventListener.emit({ type: 'todo_added', todo: newTodo })
      return newTodo;
    },
    removeTodo(todo) {
      this.todos = this.todos.filter(x => x != todo);
    },
    setDone(todo) {
      todo.done = true;
      globalGameState.totalDoneTasks ++;
      eventListener.emit({ type: 'todo_done', todo })
    }
  }
})


const state = newState();



gameFinishedListener.subscribe(({ completed }) => {
  if (completed) {
    dripSound.play();
  }
})


const eventListener = createEventListener();

const sagaContext = {
  subscribe: (cb) => {
    return eventListener.subscribe(cb)
  },
  dispatch: () => {}, 
  getState: () => {}, 
  context: {}, 
};



function todoNotification(body) {
  state.notifications.push({ 
    body: body,
    onPress: () => { state.page = 'todos' }
  });
  dripSound.play();
  vibrate(300);
}


function *quickLevel() {
  state.levelSeconds = 60;
  // yield* tweetLikeTask();
  // yield* replyTask();

  yield effects.call(sleep, 600);

  yield* catLikeTask();
  yield effects.call(sleep, 200);

  state.levelCompleted = true;
  gameFinishedListener.emit({ completed: true });
}

function *level1() {
  state.levelSeconds = 60;
  // yield* tweetLikeTask();
  // yield* replyTask();

  yield effects.call(sleep, 600);

  yield* catLikeTask();
  yield effects.call(sleep, 200);

  yield* bookTaxiTask();
  yield effects.call(sleep, 200);

  yield* replyTask();
  yield effects.call(sleep, 200);
  if (Math.random() < 0.5) {
    yield* retweetTask();
  } else {
    yield* catLikeTask();
  }
  // yield effects.call(sleep, 200);
  // todoDoneNotify();
  // yield* waitTaxiTask();

  state.levelCompleted = true;
  gameFinishedListener.emit({ completed: true });
}

function *level2() {
  state.levelSeconds = 60;
  // yield* tweetLikeTask();
  // yield* replyTask();

  yield effects.call(sleep, 600);

  yield* replyTask();
  yield effects.call(sleep, 200);

  const forked = yield effects.fork(function*() {

    yield effects.call(sleep, 2000);
    todoNotification("1 new task added");

    yield* catLikeTask();
    yield effects.call(sleep, 200);

    yield* tweetLikeTask();
    yield effects.call(sleep, 200);

  });

  yield* bookTaxiTask();
  yield effects.call(sleep, 200);

  yield* replyTask();
  yield effects.call(sleep, 200);

  yield* spaceshipsTask(20);
  yield effects.call(sleep, 200);

  // yield* waitTaxiTask();

  yield effects.join(forked);

  state.levelCompleted = true;
  gameFinishedListener.emit({ completed: true });
}

function *level3() {
  state.levelSeconds = 70;
  // yield* tweetLikeTask();
  // yield* replyTask();

  yield* calculatorTask();

  yield* sendEmojiTask();

  yield effects.call(sleep, 600);

  yield* replyTask();
  yield effects.call(sleep, 200);

  const forked = yield effects.fork(function*() {
    yield* catLikeTask();
  });

  yield* bookTaxiTask();
  yield effects.call(sleep, 200);

  yield* replyTask();
  yield effects.call(sleep, 200);

  yield* calculatorTask();
  yield effects.call(sleep, 200);

  yield* spaceshipsTask(30);
  yield effects.call(sleep, 200);

  // yield* waitTaxiTask();

  yield effects.join(forked);

  state.levelCompleted = true;
  gameFinishedListener.emit({ completed: true });
}

function *level4() {
  state.levelSeconds = 70;
  // yield* tweetLikeTask();
  // yield* replyTask();

  yield effects.fork(systemUpdateTask);

  yield* sendEmojiTask();

  const forked = yield effects.fork(function*() {
    yield* catLikeTask();
    yield effects.call(sleep, 200);
    yield* calculatorTask();
    yield effects.call(sleep, 200);
  });

  yield* sendEmojiTask();

  yield* spaceshipsTask(10);
  yield effects.call(sleep, 200);

  yield* replyTask();
  yield effects.call(sleep, 200);

  yield* bookTaxiTask();
  yield effects.call(sleep, 200);

  yield* replyTask();
  yield effects.call(sleep, 200);

  yield* calculatorTask();
  yield effects.call(sleep, 200);


  // yield* waitTaxiTask();

  yield effects.join(forked);

  state.levelCompleted = true;
  gameFinishedListener.emit({ completed: true });
}



const actionEq = (obj) => (action) => _.isEqual(obj, action);

function *replyTask() {
  const emailSubject = pickRandom(state.email.emails).subject;
  const emailTodo = state.todos.addTodo({ title: `Reply to '${emailSubject}' on Email` });
  yield effects.take(actionEq({ type: 'email', subject: emailSubject }));
  state.todos.setDone(emailTodo);
}


function *bookTaxiTask() {
  const taxiTodo = state.todos.addTodo({ title: "Book a taxi" });
  yield effects.call(mobxWhen, () => state.taxi.booked)
  state.todos.setDone(taxiTodo);
}


function *waitTaxiTask() {
  const arriveTaxiTodo = state.todos.addTodo({ title: "Wait for taxi to arrive" });
  yield effects.call(mobxWhen, () => state.taxi.booked && state.now >= state.taxi.arrive)
  state.todos.setDone(arriveTaxiTodo);
}

function *tweetLikeTask() {
  const num = pickRandom([1,2,3])
  const todo = state.todos.addTodo({ title: `Like ${num} tweets` });
  for (let i = 0; i < num; i++) {
    yield effects.take(actionEq({ type: 'tweet_liked' }));
  }
  state.todos.setDone(todo);
}
function *retweetTask() {
  const num = pickRandom([1,2,3])
  const todo = state.todos.addTodo({ title: `Retweet ${num} ${num == 1 ? 'tweet' : 'tweets'}` });
  for (let i = 0; i < num; i++) {
    yield effects.take(actionEq({ type: 'tweet_retweeted' }));
  }
  state.todos.setDone(todo);
}
function *catLikeTask() {
  const num = pickRandom([1,2,3,4,5])
  const todo = state.todos.addTodo({ title: `Like ${num} ${num == 1 ? 'cat photo' : 'cat photos'}` });
  for (let i = 0; i < num; i++) {
    yield effects.take(actionEq({ type: 'cat_liked' }));
  }
  state.todos.setDone(todo);
}
function *spaceshipsTask(score) {
  const todo = state.todos.addTodo({ title: `Get a score of ${score} in Spaceships` });
  yield effects.take(actionEq({ type: 'spaceships_score', score: score }));
  state.todos.setDone(todo);
}
function *sendEmojiTask() {
  const index = pickRandom([0, 1, 2, 3, 4, 5])
  const todo = state.todos.addTodo({ title: <div>Send a <img src={emojis[index]} style={{ width: 24, height: 24 }} /> emoji</div> });
  yield effects.take(actionEq({ type: 'emoji_send', index: index }));
  state.todos.setDone(todo);
}
function *calculatorTask() {
  const number = Math.floor(Math.random() * 10000);
  const todo = state.todos.addTodo({ title: `Type ${number} on the calculator` });
  yield effects.take(actionEq({ type: 'calculator', input: number }));
  state.todos.setDone(todo);
}
function *systemUpdateTask() {
  yield effects.call(sleep, Math.random() * 20000 + 10000);
  state.systemUpdate = true;
}

function *pickRandomTask() {
  const rand = [replyTask, bookTaxiTask, waitTaxiTask]

  yield* pickRandom(rand)();
}



function pressStart() {
  // state.gamePaused = false;
  state.gameStart = false;
  // state.battery = 1;
  // state.page = 'home'
  // state.todos.todos = [];
  startLevel(state.level);
}
pressStart = action(pressStart);

function *taxiNotificationIterator() {
  while (true) {
    yield effects.call(mobxWhen, () => state.now > state.taxi.arrive);
    state.notifications.push({ 
      body: "Your taxi has arrived",
      onPress: () => { state.page = 'taxi' }
    });
    dripSound.play();
    vibrate(300);
    yield effects.call(mobxWhen, () => state.now < state.taxi.arrive);
  }
}
function *batteryIterator() {
  yield effects.call(mobxWhen, () => state.battery < 0.5);
  state.notifications.push({ 
    body: "Your battery is getting low",
    onPress: () => { state.page = 'taxi' }
  });
  dripSound.play();
  vibrate(300);

  yield effects.call(mobxWhen, () => state.battery < 0.2);
  state.notifications.push({ 
    body: "Your battery is low!",
    onPress: () => { state.page = 'taxi' }
  });
  dripSound.play();
  vibrate(300);

  yield effects.call(mobxWhen, () => state.battery < 0.05);
  state.notifications.push({ 
    body: "Oh no your battery is going to die!",
    onPress: () => { state.page = 'taxi' }
  });
  dripSound.play();
  vibrate(300);
}
function *todosIterator() {
  while (true) {
    yield effects.take('todo_done');
    todoNotification("Task complete")
  }
}
function *todosIterator2() {
  while (true) {
    yield effects.take('todo_added');
    todoNotification("1 new task added")
  }
}

function startLevel(levelId) {
  const levels = [level1, level2, level3, level4];

  const task = runSaga(sagaContext, function*() {
    yield effects.fork(taxiNotificationIterator);
    yield effects.fork(batteryIterator);
    yield effects.fork(todosIterator);
    yield effects.fork(todosIterator2);
    const t = yield effects.fork(levels[levelId]);
    yield effects.join(t);
  })

  const unsubscribeListener = gameFinishedListener.subscribe(() => {
    unsubscribeListener();
    task.cancel();
  })
}

function pressRestart() {
  Object.assign(state, newState());
}
pressRestart = action(pressRestart);

function pressNextLevel() {
  const nextLevel = state.level + 1;
  Object.assign(state, newState());
  state.level = nextLevel;
}
pressNextLevel = action(pressNextLevel);

// const disposer2 = saga.run(iterator2);


setInterval(action(() => {
  if (!state.gamePaused) {
    state.battery -= 1/(state.levelSeconds*(1000/100));
    if (state.battery <= 0) {
      // state.gamePaused = true;
      state.gameOver = true;
      gameFinishedListener.emit({ completed: false });
    }

    state.now = +new Date()
  }
}), 100)


function cx(...styles) {
  return Object.assign({}, ...styles);
}

let phoneRef = null;

const pressHome = () => {
  clickSound.play();
  state.page = 'home'
}

class App extends Component {
  render() {
    const page = 
      state.page === 'tweeter' ? <TweeterScreen />
      : state.page === 'todos' ? <TodosScreen />
      : state.page === 'email' ? <EmailScreen />
      : state.page === 'spaceships' ? <SpaceshipsScreen />
      : state.page === 'emoji' ? <EmojiScreen />
      : state.page === 'cat' ? <CatScreen />
      : state.page === 'heartrate' ? <HeartRateScreen />
      : state.page === 'camera' ? <CameraScreen />
      : state.page === 'calculator' ? <CalculatorScreen />
      : state.page === 'taxi' ? <TaxiScreen />
      : undefined

    const isAlive = state.battery > 0;

    return (
      <div style={{position:'relative'}}>
        <div ref={x => phoneRef = x} style={{margin: 'auto', marginTop: 50, width: 342, height: 695, position: 'relative'}}>
          <div style={{background: `url(${phone})`, backgroundSize: '100% 100%', width: 342, height: 695}}>
          </div>



          <div style={{display: 'flex', marginLeft: 24, marginTop: 86, position: 'absolute', top: 0, left: 0, backgroundColor: 'white', width: 296, height: 527}}>
            {state.gameOver ? 
              <Layer>
                <EndScreen />
              </Layer>
            : state.gameStart ? 
              <Layer>
                <StartScreen />
              </Layer>
            :
              <div>
                <Layer>
                  <HomeScreen />
                </Layer>
                <FadeOut visible={!!page}>
                  <Layer>
                    {page}
                  </Layer>
                </FadeOut>
                <Layer style={{pointerEvents: 'none'}}>
                  <NotificationsOverlay />
                </Layer>
                {state.systemUpdate && <Layer>
                  <SystemUpdateOverlay />
                </Layer>}
                {state.levelCompleted && <Layer>
                  <CompleteOverlay />
                </Layer>}
              <div style={{cursor:'pointer',position: 'absolute', top: 535, left: 118, width: 58, height: 58}} onClick={pressHome}></div>
            </div>}
          </div>


        </div>


      </div>
    );
  }
}
App = observer(App);

let vibrating = false;
function vibrate (time) {
  time = time || 500
  vibrating = true;
  setTimeout(() => {
    vibrating = false;
  }, time);
}
window.vibrate = vibrate;

function animate() {
  if (phoneRef) {
    if (vibrating) {
      const x = Math.floor((Math.random()-0.5) * 8);
      const y = Math.floor((Math.random()-0.5) * 8);
      phoneRef.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  requestAnimationFrame(animate);
}
animate();

function createMarkup(x) { return <div dangerouslySetInnerHTML={{__html: x}} /> }

function lerp(x, min, max) {
  return x * (max - min) + min;
}
function Battery({ value }) {

  
  const w1 = lerp(value, 43.8740019, 0)
  const w2 = lerp(value, 49.9027018, 5.90270178)
  const fill = value > 0.5 ? '#3CE829'
    : value > 0.3 ? '#FFBF0B'
    : '#FF0B0B'

return <svg width="47px" height="23px" viewBox="0 0 47 23">
    <defs>
        <rect id="path-1" x="6.99764873" y="0.279180943" width="8.42006895" height="5.32466066"></rect>
        <rect id="path-2" x="0.262929948" y="3.502401" width="22.5899867" height="42.7544637" rx="6"></rect>
        <rect id="path-4" x="0.262929948" y="3.502401" width="22.5899867" height="42.7544637" rx="6"></rect>
    </defs>
    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Battery-Copy-2" transform="translate(23.500000, 11.500000) rotate(-270.000000) translate(-23.500000, -11.500000) translate(12.000000, -12.000000)">
            <g id="Rectangle-2">
                <use fill="#D8D8D8" fillRule="evenodd" xlinkHref="#path-1"></use>
                <rect stroke="#000000" strokeWidth="1" x="7.49764873" y="0.779180943" width="7.42006895" height="4.32466066"></rect>
            </g>
            <mask id="mask-3" fill="white">
                <use xlinkHref="#path-2"></use>
            </mask>
            <g id="Rectangle">
                <use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-2"></use>
                <rect stroke="#000000" strokeWidth="1" x="0.762929948" y="4.002401" width="21.5899867" height="41.7544637" rx="6"></rect>
            </g>
            <polygon id="Path" fill={fill} mask="url(#mask-3)" points={`0.262929948 ${w1} 22.8529167 ${w2} 22.8529167 46.2568647 0.262929948 46.2568647`}></polygon>
            <mask id="mask-5" fill="white">
                <use xlinkHref="#path-4"></use>
            </mask>
            <rect stroke="#000000" x="0.762929948" y="4.002401" width="21.5899867" height="41.7544637" rx="6"></rect>
        </g>
    </g>
</svg>

}

class StatusBar extends Component {

  render() {
    return <Row style={{backgroundColor: '#A8A8A8', justifyContent: 'flex-end', alignItems:'center'}}>
      <span>{Math.floor(state.battery * 100)}%</span>
      <Battery value={state.battery} />
    </Row>
  }
}
StatusBar = observer(StatusBar);

const removeNotification = (notification) => {
  state.notifications = state.notifications.filter(x => x != notification);
}
const pressNotification = (notification) => {
  removeNotification(notification);
  notification.onPress && notification.onPress()
}

function NotificationsOverlay() {
  return <FlexGrow style={{pointerEvents:'none'}}>
    <Spacing h={23} />
    {state.notifications.map((notification, index) => {
      return (
        <Button key={index} onClick={() => pressNotification(notification)}>
          <View key={index} style={{pointerEvents:'all', margin: 8, padding: 16, background: '#ccc', borderRadius: 3, boxShadow: '0 1px 8px 1px rgba(0,0,0,0.3)'}}>
            <Row style={{alignItems:'center'}}>
              {notification.body}
              <FlexGrow />
              <View style={{margin: -4}}>
                <Button onClick={() => removeNotification(notification)}><img src={close} style={{ width: 21, height: 21}} /></Button>
              </View>
            </Row>
          </View>
        </Button>
      );
      
    })}
  </FlexGrow>
}

const pressUpdate = action(() => { 
  state.systemUpdate = false;
  state.battery -= 0.2;
})
const pressCancelUpdate = action(() => { 
  state.systemUpdate = false
})
function SystemUpdateOverlay() {
  return <FlexGrow style={{pointerEvents:'none', backgroundColor: 'rgba(0,0,0,0.9)'}}>
    <StatusBar />

    <FlexGrow />
      <View style={{pointerEvents:'all', margin: 8, padding: 16, background: '#ccc', borderRadius: 3, boxShadow: '0 1px 8px 1px rgba(0,0,0,0.3)'}}>
        A system update is available!
        <Spacing h={8} />
        <Row style={{alignItems: 'center'}}>
          <ThickButton onClick={pressUpdate}><View>Download Update</View></ThickButton>
          <FlexGrow />
          <Button onClick={pressCancelUpdate}><View>Cancel</View></Button>
        </Row>
      </View>
    <FlexGrow grow={1.5} />
  </FlexGrow>
}
function CompleteOverlay() {
  return <FlexGrow style={{pointerEvents:'none', backgroundColor: 'rgba(0,0,0,0.9)'}}>
    <Spacing h={23} />

    <FlexGrow />
      <View style={{pointerEvents:'all', margin: 8, padding: 16, background: '#ccc', borderRadius: 3, boxShadow: '0 1px 8px 1px rgba(0,0,0,0.3)'}}>
        <Row style={{alignItems:'center'}}>
          All tasks completed!!
          <FlexGrow />
          <View style={{margin:-8}}>
            <ThickButton onClick={pressNextLevel}><View>Next Level</View></ThickButton>
          </View>
        </Row>
      </View>
    <FlexGrow grow={1.5} />
  </FlexGrow>
}


function HomeScreen() {
  return <FlexGrow style={{backgroundImage: `linear-gradient(to bottom right, #E07B29, #E0296F)`}}>
    <StatusBar />
    <FlexGrow>
      <Spacing h={32} />
      <Row style={{flexWrap:'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
        <div />
        <TweeterIcon onClick={() => state.page = 'tweeter'} />
        <TodosIcon />
        <EmailIcon />
        <div />
      </Row>
      <Spacing h={32} />
      <Row style={{flexWrap:'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
        <div />
        <EmojiIcon />
        <SpaceshipsIcon />
        <CatIcon />
        <div />
      </Row>
      <Spacing h={32} />
      <Row style={{flexWrap:'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
        <div />
        <CameraIcon />
        <CalculatorIcon />
        <TaxiIcon />
        <div />
      </Row>
    </FlexGrow>
  </FlexGrow>
}


const pressLike = (tweet) => {
  tweet.liked = true;
  eventListener.emit({ type: 'tweet_liked' });
}
const pressRetweet = (tweet) => {
  tweet.retweeted = true;
  eventListener.emit({ type: 'tweet_retweeted' });
}

class TweeterScreen extends Component  {
  componentWillMount() {
    state.tweeter.tweets = [
      randomTweet(),
      randomTweet(),
      randomTweet(),
      randomTweet(),
      randomTweet(),
    ]
  }
  render() {
    return <FlexGrow>
      <StatusBar />
      <Header title='Tweeter' color='#2FBEF2' />
      <FlexGrow style={{backgroundColor: 'white'}}>
        <Spacing h={16} />
        
        {state.tweeter.tweets.map((tweet, index) => {
          const overlay = tweet.liked || tweet.retweeted;
          return (
            <View key={index} style={{position: 'relative'}}>
              <Row style={{marginLeft:32, marginRight: 32, marginTop: 8, marginBottom: 8}}>
                <View style={{justifyContent:'center'}}>
                  <img src={tweet.profilePicture} style={{ userSelect: 'none', width: 42, height: 42, borderRadius: 1000 }} />
                </View>
                <Spacing w={10} />
                <FlexGrow>
                  <View>
                    <div style={{fontSize:14, color: '#444'}}>{tweet.name}</div>
                    {tweet.body}
                    <Spacing h={8} />
                    <Row>
                      <Button onClick={() => pressLike(tweet)}><View>Like</View></Button>
                      <Spacing w={32} />
                      <Button onClick={() => pressRetweet(tweet)}><View>Retweet</View></Button>
                    </Row>
                  </View>
                </FlexGrow>
              </Row>
              <Layer style={{pointerEvents: overlay ? '': 'none', transition: 'opacity 0.2s', opacity: overlay ? 1 : 0, flexDirection: 'row', background: 'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center'}}>
                <img src={tweet.retweeted ? retweet : heart} style={{userSelect: 'none', width: 42}}/>
                <Spacing w={32} />
                <View style={{color:'white', fontSize: 32}}>{tweet.retweeted ? 'RETWEETED!' : 'LIKED!!'}</View>
              </Layer>
              <View style={{borderBottom: '1px solid #979797'}} />
            </View>
          )
        })}

      </FlexGrow>
    </FlexGrow>
  }
}
TweeterScreen = observer(TweeterScreen);

const sendEmail = (subject) => {
  eventListener.emit({ type: 'email', subject })
}
class EmailScreen extends Component {
  state = { reply: undefined }
  render () {
    return <FlexGrow>
      <StatusBar />
      <Header title='Email' color='#7D1B1B' />
      {this.state.reply ? 

        <FlexGrow style={{backgroundColor: 'white', padding: 4}}>
          <Spacing h={16} />
          <Row>To: {this.state.reply.from}</Row>
          <Row>Subject: Re: {this.state.reply.subject}</Row>
          <Spacing h={16} />
          <Row>Body:</Row>
          <Spacing h={4} />
          <View style={{padding: 4, height: 64, border: '1px solid #333', borderRadius: 3}}>
            I don't care!!!!
          </View>
          <Spacing h={16} />
          <Row style={{justifyContent: 'flex-start', alignItems: 'center'}}>
            <ThickButton onClick={() => {
              sendEmail(this.state.reply.subject)
              this.setState({ reply: undefined })
            }}><View>SEND MESSAGE</View></ThickButton>
            <FlexGrow />
            <Button onClick={() => { this.setState({ reply: undefined }) }}><View style={{padding: 4}}>CANCEL</View></Button>
          </Row>
        </FlexGrow>

      :<FlexGrow style={{backgroundColor: 'white'}}>
        <Spacing h={16} />
        {state.email.emails.map((email, index) => {
          const { from, subject } = email;
          return <Row key={index} style={{padding:4}}>
            <FlexGrow style={{flexGrow: 1, flexShrink:1}}>{subject}</FlexGrow>
            <ThickButton onClick={() => this.setState({ reply: email })}><View>REPLY</View></ThickButton>
          </Row>
        })}
      </FlexGrow>}
    </FlexGrow>
  }
}

class EmojiScreen extends Component {
  pressEmoji = (index) => {
    state.emojis.emojis.push({ type: 'to', index: index });
    eventListener.emit({ type: 'emoji_send', index: index });
    clearTimeout(this.t);
    this.t = setTimeout(() => {
      state.emojis.emojis.push({ type: 'from', index: pickRandom([0,1,2,3,4,5,6]) });
      clickSound.play();
    }, 1500)
  }
  componentWillUnmount() {
    clearTimeout(this.t);

  }
  render() {
    return <FlexGrow style={{backgroundColor: 'white'}}>
      <StatusBar />
      <Header title='Emoji' color='#F2972F' />
      <FlexGrow style={{flexShrink: 0, overflow: 'hidden'}}>
        <Spacing h={16} />

        {_.takeRight(state.emojis.emojis, 4).map(message => {
          return <View style={{margin: 8, alignItems: message.type == 'from' ? 'flex-start' : 'flex-end'}}>
            <View style={{ borderRadius: 5, backgroundColor: message.type == 'from' ? '#9EA6F6' : '#A0E595' }}>
              <img src={emojis[message.index]} style={{padding: 8}} width={44} height={43} />
            </View>
          </View>
        })}
        
      </FlexGrow>
      <Row style={{backgroundColor: '#A0E595', padding: 8}}>
        <FlexGrow />
        <View>
          <Row>
            <Button onClick={() => this.pressEmoji(0)}><img src={emojis[0]} style={{padding: 8}} width={44} height={43} /></Button>
            <Button onClick={() => this.pressEmoji(1)}><img src={emojis[1]} style={{padding: 8}} width={44} height={43} /></Button>
            <Button onClick={() => this.pressEmoji(2)}><img src={emojis[2]} style={{padding: 8}} width={44} height={43} /></Button>
          </Row>
          <Row>
            <Button onClick={() => this.pressEmoji(3)}><img src={emojis[3]} style={{padding: 8}} width={44} height={43} /></Button>
            <Button onClick={() => this.pressEmoji(4)}><img src={emojis[4]} style={{padding: 8}} width={44} height={43} /></Button>
            <Button onClick={() => this.pressEmoji(5)}><img src={emojis[5]} style={{padding: 8}} width={44} height={43} /></Button>
          </Row>
        </View>
        <FlexGrow />
      </Row>
    </FlexGrow>
  }
}
EmojiScreen = observer(EmojiScreen);


const cumulativeOffset = function(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

const spaceshipImage = new Image();
spaceshipImage.src = spaceship;
const spaceshipDeadImage = new Image();
spaceshipDeadImage.src = spaceshipDead;
const starImage = new Image();
starImage.src = star;
const asteroid1Image = new Image();
asteroid1Image.src = asteroid1;

const checkCollision = (ax, ay, aw, ah, bx, by, bw, bh) => {
  if (ax + aw/2 < bx - bw / 2) return false;
  if (ax - ah/2 > bx + bh / 2) return false;
  if (ay + aw/2 < by - bw / 2) return false;
  if (ay - ah/2 > by + bh / 2) return false;
  return true;
}

class SpaceshipsScreen extends Component {
  width = 296;
  height = 493;
  playerX = this.width / 2;
  playerY = this.height - 53/2 - 10;
  mouseX = this.width / 2;
  lastTime = undefined;
  dead = false;
  score = 0;

  stars = [
    { x: Math.random() * this.width, y: 0, vy: 0.2 },
    { x: Math.random() * this.width, y: 60, vy: 0.22 },
    { x: Math.random() * this.width, y: 200, vy: 0.27 },
  ]
  asteroids = [
    { image: asteroid1Image, rotation: 0, x: Math.random() * this.width, y: 10, vy: 0.1 },
    { image: asteroid1Image, rotation: Math.PI, x: Math.random() * this.width, y: 50, vy: 0.12 },
    { image: asteroid1Image, rotation: Math.PI * 2, x: Math.random() * this.width, y: 100, vy: 0.17 },
    { image: asteroid1Image, rotation: Math.PI * 3, x: Math.random() * this.width, y: 100, vy: 0.17 },
  ]

  componentDidMount() {
    this.ctx = this.refs.canvas.getContext('2d');
    //const pos = cumulativeOffset(this.refs.canvas);
    window.addEventListener('mousemove', this.mouseMove);

    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationRequest);
    window.removeEventListener('mousemove', this.mouseMove)
  }

  mouseMove = (ev) => {
    this.mouseX = ev.pageX - cumulativeOffset(this.refs.canvas).left;
  }

  animate = () => {
    const { ctx } = this;
    const delta = this.lastTime ? +new Date() - this.lastTime : 0;
    this.lastTime = +new Date();

    if (!this.dead) {
      this.playerX += (this.mouseX - this.playerX) / 8;
      this.playerX = Math.min(Math.max(this.playerX, 38/2), this.width - 38/2)

      for (const star of this.stars) {
        star.y += star.vy * delta;
        const col = checkCollision(this.playerX, this.playerY, 38, 53, star.x, star.y, 21, 21);
        if (col) {
          const dripSound = new Audio(require('./pop_drip.wav'));
          dripSound.play();
        }
        if (star.y >= this.height + 21/2 || col) {
          star.x = Math.random() * this.width;
          star.y = -21/2;
          this.score ++;
          eventListener.emit({ type: 'spaceships_score', score: this.score })
          this.forceUpdate();
        }
      }

      for (const asteroid of this.asteroids) {
        asteroid.y += asteroid.vy * delta;
        if (asteroid.y >= this.height + 48/2) {
          asteroid.x = Math.random() * this.width;
          asteroid.y = -48/2;
          asteroid.rotation = Math.random() * Math.PI * 2;
        }

        const col = checkCollision(this.playerX, this.playerY, 26, 25, asteroid.x, asteroid.y, 25, 25);
        if (col) {
          this.dead = true;
        }

      }
    }


    // Render

    ctx.clearRect(0,0,this.width, this.height);

    for (const star of this.stars) {
      ctx.drawImage(starImage, star.x - 21/2, star.y - 21/2, 21, 21);
    }

    for (const asteroid of this.asteroids) {
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.rotation);
      ctx.translate(-asteroid.x, -asteroid.y);
      ctx.drawImage(asteroid.image, asteroid.x - 48/2, asteroid.y - 48/2, 48, 48);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    const playerImage = this.dead ? 
      Math.floor(+new Date() / 100) % 2 == 0 ? spaceshipImage : spaceshipDeadImage
      : spaceshipImage;

    ctx.drawImage(playerImage, this.playerX - 38/2, this.playerY - 53/2, 38, 53);

    this.animationRequest = requestAnimationFrame(this.animate);
  }

  render () {
    return <FlexGrow style={{background:'black'}}>
      <StatusBar />
      <View style={{position:'relative'}}>
        <canvas ref='canvas' style={{flex:1}} width={this.width} height={this.height} />
        <Layer>
          <View style={{padding: 8, fontSize: 32, textAlign:'right', color:'white'}}>{this.score}</View>
        </Layer>
      </View>
      
    </FlexGrow>
  }
}

class CatScreen extends Component {
  componentWillMount() {
    state.cats = [
      randomCat(),
      randomCat(),
      randomCat(),
      randomCat(),
      randomCat(),
      randomCat(),
    ]
  }
  render() {
    return <FlexGrow>
      <StatusBar />
      <Header title='Cat Photos' color='#C200A2' />
      <FlexGrow style={{backgroundColor: 'white'}}>
        <Row>
          <Cat cat={state.cats[0]} />
          <Cat cat={state.cats[1]} />
        </Row>
        <Row>
          <Cat cat={state.cats[2]} />
          <Cat cat={state.cats[3]} />
        </Row>
        <Row>
          <Cat cat={state.cats[4]} />
          <Cat cat={state.cats[5]} />
        </Row>
      </FlexGrow>
    </FlexGrow>
  }
}

const pressCat = (cat) => {
  if (!cat.liked) {
    cat.liked = true;
    eventListener.emit({ type: 'cat_liked' });
  }
}
function Cat({ cat }) {
  return <Button onClick={() => pressCat(cat)}>
  <FlexGrow style={{position: 'relative', border: '1px solid #fff', height:150, backgroundPosition: '50%', backgroundSize: 'cover', justifyContent:'stretch', alignItems:'stretch', backgroundImage: `url(${cat.photo})`}}>
    {cat.liked && <Layer style={{backgroundColor:'rgba(0,0,0,0.7)', alignItems:'center', justifyContent:'center'}}>
      <img src={heart} style={{width:42}} />
    </Layer>}
  </FlexGrow>
  </Button>
}
Cat = observer(Cat)

function HeartRateScreen() {
  return <FlexGrow>
    <StatusBar />
    <Header title='Heart Rate' color='#7D1B1B' />
    <FlexGrow style={{backgroundColor: 'white'}}>
      <Spacing h={16} />
      LOL
    </FlexGrow>
  </FlexGrow>
}
function CameraScreen() {
  return <FlexGrow>
    <StatusBar />
    <Header title='Camera' color='#7D1B1B' />
    <FlexGrow style={{backgroundColor: 'black'}}>
    </FlexGrow>
  </FlexGrow>
}

class CalculatorScreen extends Component {
  state = { operand: undefined, input: "", clearNext: false, operator: undefined }
  calculate = () => {
    this.setState((state) => {
      if (state.operand && state.operator && !state.clearNext) {
        const { operator, operand } = state;
        const operand2 = Number(state.input);
        const res = (
          operator == 'multiply' ? operand * operand2
          : operator == 'divide' ? operand / operand2
          : operator == 'add' ? operand + operand2
          : operator == 'subtract' ? operand - operand2 : 0
        );
        return {
          operand: res,
          input: String(res),
          clearNext: true
        };
      }
    });
  }
  press = (options) => {
    if (options.type == 'number') {
      this.setState((state) => ({
        input: (state.clearNext ? '' : state.input) + options.text,
        clearNext: false
      }));
    } else if (options.type == 'equals') {
      this.calculate();
    } else if (options.type == 'multiply' || options.type == 'divide' || options.type == 'add' || options.type == 'subtract') {
      this.calculate();
      this.setState((state) => ({
        operator: options.type,
        operand: Number(state.input),
        clearNext: true
      }));
    } else if (options.text == 'ac') {
      this.setState({ 
        operator: undefined,
        operand: undefined,
        input: ''
      })
    }
  }
  componentWillUpdate(newProps, newState) {
    eventListener.emit({ type: 'calculator', input: Number(newState.input) })
  }
  render () {
    return <FlexGrow style={{backgroundColor: '#3C805A'}}>
      <StatusBar />
      <Header title='Calculator' color='#3C805A' />
      <FlexGrow>
        
        <FlexGrow style={{color:'white', fontSize: 32, padding: 8}}>
          {this.state.input}
        </FlexGrow>
        <View>
          <Row>
            <CalculatorButton onClick={this.press} text='AC' />
            <CalculatorButton onClick={this.press} text='+-' />
            <CalculatorButton onClick={this.press} text='%' />
            <CalculatorButton onClick={this.press} type='divide' text='÷' highlight={true} />
          </Row>
          <Row>
            <CalculatorButton onClick={this.press} type='number' text='7' />
            <CalculatorButton onClick={this.press} type='number' text='8' />
            <CalculatorButton onClick={this.press} type='number' text='9' />
            <CalculatorButton onClick={this.press} type='multiply' text='✕' highlight={true} />
          </Row>
          <Row>
            <CalculatorButton onClick={this.press} type='number' text='4' />
            <CalculatorButton onClick={this.press} type='number' text='5' />
            <CalculatorButton onClick={this.press} type='number' text='6' />
            <CalculatorButton onClick={this.press} type='subtract' text='−' highlight={true} />
          </Row>
          <Row>
            <CalculatorButton onClick={this.press} type='number' text='1' />
            <CalculatorButton onClick={this.press} type='number' text='2' />
            <CalculatorButton onClick={this.press} type='number' text='3' />
            <CalculatorButton onClick={this.press} type='add' text='+' highlight={true} />
          </Row>
          <Row>
            <CalculatorZeroButton onClick={this.press}/>
            <CalculatorButton onClick={this.press} text='.' />
            <CalculatorButton onClick={this.press} type='equals' text='=' highlight={true} />
          </Row>
        </View>
      </FlexGrow>
    </FlexGrow>
  }
}

function CalculatorButton({ text, type, highlight, onClick }) {
  return <Button onClick={() => onClick({ type, text })}>
    <FlexGrow style={{ color:'#E9F1EC', width: 0, height: 70, margin: -1, backgroundColor: highlight ? '#3C7354' : '#3C805A', border: `1px solid ${highlight ? '#3C805A' : '#3C7354'}`, justifyContent:'center', alignItems:'center'}}>
    {text}
    </FlexGrow>
  </Button>
}
function CalculatorZeroButton({ onClick, highlight }) {
  return <Button onClick={() => onClick({ type: 'number', text: '0' })}>
    <FlexGrow grow={2} style={{ backgroundColor: highlight ? '#3C7354' : '#3C805A', border: `1px solid ${highlight ? '#3C805A' : '#3C7354'}`, color: '#E9F1EC', width: 0, height: 70, margin: -1, justifyContent:'center'}}>
    <Row><FlexGrow style={{width: 0, justifyContent:'center', alignItems:'center'}}>0</FlexGrow>
    <FlexGrow /></Row>
    </FlexGrow>
  </Button>
}

const bookTaxi = action(() => {
  state.taxi.booked = true
  state.taxi.arrive = +new Date() + 1000 * 20
  state.taxi.driver = randomName(); 
});
const cancelTaxi = action(() => {
  state.taxi.booked = false;
})
function TaxiScreen() {
  const arrival = Math.max(Math.floor((state.taxi.arrive - state.now) / 1000), 0);
  return <FlexGrow>
    <StatusBar />
    <Header title='Taxi' color='black' />
    <FlexGrow style={{backgroundColor: 'black', color:'white'}}>
      <Spacing h={16} />
      {state.taxi.booked && state.now < state.taxi.arrive + 1 ? 
        <View style={{textAlign:'center'}}>
          Your taxi will arrive in
          <div style={{fontSize:48}}>{arrival} seconds</div>
          Your driver is
          <div style={{fontSize:32}}>{state.taxi.driver}</div>
          <Spacing h={20} />
          <Button onClick={cancelTaxi}><View>CANCEL TAXI</View></Button>
        </View>
        :
        <View style={{textAlign:'center'}}>
          <Spacing h={64} />
          <Button onClick={bookTaxi}><View style={{fontSize:32}}>BOOK TAXI</View></Button>
        </View>
      }
    </FlexGrow>
  </FlexGrow>
}
TaxiScreen = observer(TaxiScreen);


function TodosScreen() {
  return <FlexGrow>
    <StatusBar />
    <Header title='Task List' color='#4F2691' />
    <FlexGrow style={{backgroundColor: 'white'}}>
    {_.takeRight(state.todos.todos, 6).map((todo, index) => {
      return <Row key={index} style={{padding: 16, alignItems: 'center'}}>
        <Check checked={todo.done} /><Spacing w={16} />
        <View style={{flexGrow:1}}>{todo.title}</View>
      </Row>
    })}
      
    </FlexGrow>
  </FlexGrow>
}

function Check({ checked }) {
  return <View style={{flexShrink: 0, width: 30, height: 30, backgroundColor: '#D8D8D8', fontSize: 24, textAlign: 'center'}}>
    {checked ? '✔' : ''}
  </View>
}

function Header({ title, color }) {
  return <Row style={{fontSize: 24, fontFamily: 'arial',textAlign:'center', color:'white', fontWeight: 'bold', height: 33, justifyContent:'center', alignItems: 'center', backgroundColor: color}}>
  {title}
  </Row>
}


class FadeOut extends Component {

  key = 0;
  componentWillMount() {
    this.children = this.props.children;
  }
  componentWillUpdate(newProps) {
    if (newProps.visible && newProps.children) {
      this.children = newProps.children;
      if (!this.props.visible) this.key++;
    }
  }
  render() {
    return <div style={{transition: 'opacity 0.2s, transform 0.2s', 
      opacity: this.props.visible ? 1 : 0, 
      pointerEvents: this.props.visible ? '' : 'none',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transform: this.props.visible ? 'scale(1)' : 'scale(0.7)'
    }}><div key={this.key}>{this.children}</div></div>;
  }
}

function OffScreen() {
  return <FlexGrow style={{backgroundColor:'black'}}>
  </FlexGrow>
}

function StartScreen() {
  return <FlexGrow style={{backgroundColor:'black', color: 'white', textAlign: 'center'}}>
    {state.level == 4 ? 
      <FlexGrow>
        <Spacing h={120} />
        <View style={{fontSize: 18}}>Game completed!</View>
        <Spacing h={64} />
        <View>That's all for now!!</View>
        <Spacing h={64} />
        <View>Total tasks completed: {globalGameState.totalDoneTasks}</View>
      </FlexGrow>
    :
    <Button onClick={pressStart}>
        <FlexGrow>
          <Spacing h={120} />
          <View style={{fontSize: 18}}>Your device is fully charged</View>
          <Spacing h={64} />
          <View>Level {state.level+1} - Complete all your tasks</View>
          
          <Spacing h={32} />
          <View>Press here to start device</View>
        </FlexGrow>
    </Button>
    }
    <img src={charger} style={{ userSelect: 'none', width: 70, alignSelf:'center' }} />
  </FlexGrow>
}
StartScreen = observer(StartScreen);

function EndScreen() {
  return <FlexGrow style={{backgroundColor:'black', color: 'white', textAlign: 'center'}}>
    <Button onClick={pressRestart}>
      <FlexGrow>
        <Spacing h={120} />
        <View style={{fontSize: 18}}>Your device is dead</View>
        
        <Spacing h={32} />
        <View>Press here to try again</View>
      </FlexGrow>
    </Button>
    <img src={chargerDead} style={{ userSelect: 'none', width: 70, alignSelf:'center' }} />
  </FlexGrow>
}

const TweeterIcon = (props) => <Icon onClick={() => state.page = 'tweeter'} image={require('./icons/tweeter.png')} label='Tweeter' {...props} />
const TodosIcon = (props) => <Icon onClick={() => state.page = 'todos'} image={require('./icons/todos.png')} label='Tasks' {...props} />
const CatIcon = (props) => <Icon onClick={() => state.page = 'cat'} image={require('./icons/cat.png')} label='Cat Photos' {...props} />
const EmojiIcon = (props) => <Icon onClick={() => state.page = 'emoji'} image={require('./icons/emoji.png')} label='Emoji' {...props} />
const SpaceshipsIcon = (props) => <Icon onClick={() => state.page = 'spaceships'} image={require('./icons/spaceships.png')} label='Spaceships' {...props} />
const EmailIcon = (props) => <Icon onClick={() => state.page = 'email'} image={require('./icons/email.png')} label='Email' {...props} />
const HeartRateIcon = (props) => <Icon onClick={() => state.page = 'heartrate'} image={require('./icons/heartrate.png')} label='Heart Rate' {...props} />
const CameraIcon = (props) => <Icon onClick={() => state.page = 'camera'} image={require('./icons/camera.png')} label='Camera' {...props} />
const CalculatorIcon = (props) => <Icon onClick={() => state.page = 'calculator'} image={require('./icons/calculator.png')}  label='Calculator' {...props} />
const TaxiIcon = (props) => <Icon onClick={() => state.page = 'taxi'}image={require('./icons/taxi.png')}  label='Taxi' {...props} />

function Icon({ label, image, onClick }) {
  return <View>
  <Button onClick={onClick}><View style={{margin: 0, width: 72, height: 72, borderRadius: 5, overflow:'hidden', position:'relative'}}>
    <img src={image} style={{position:'absolute',top:0,left:0,right:0,bottom:0,width:'100%',height:'100%'}} />
  </View></Button>
  <Spacing h={4} />
  <div style={{textAlign:'center', fontSize: 12, color:'white'}}>{label}</div>
  </View>
}

function ThickButton({ style, ...rest }) {
  return <Button style={cx({ padding: 8, color: 'white', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 3}, style)} {...rest} />
}

class Button extends Component {
  state = { press: false }
  handleMouseDown = (ev) => {
    clickSound.play();
    ev.preventDefault()
    ev.stopPropagation();
    this.setState({ press: true })
  }
  handleMouseMove = (ev) => {
    ev.preventDefault()
  }
  handleMouseUp = () => {
    this.setState({ press: false })
  }
  handleClick = (ev) => {
    ev.stopPropagation();
    this.props.onClick && this.props.onClick();
  }
  render() {
    const { onClick, style, children } = this.props;
    const childStyle = children.props.style;
    const newStyle = cx(childStyle, style, { 
      userSelect: 'none',
      whiteSpace: 'nowrap',
      cursor: 'pointer', opacity: this.state.press ? 0.5 : 1
    })
    return React.cloneElement(children, { style: newStyle, onClick: this.handleClick, onMouseDown: this.handleMouseDown, onMouseUp: this.handleMouseUp, onMouseMove: this.handleMouseMove })
  }
}

function Layer({ style, ...rest }) {
  return <View {...rest} style={cx({ position: 'absolute', left:0, top:0, right:0, bottom:0 }, style)} />
}
function Spacing({ w, h, ...rest }) {
  return <View  {...rest} style={{width: w, height: h}} />
}
function FlexGrow({ grow, style, children, ...rest }) {
  return <View  {...rest} style={cx({flexGrow: grow || 1}, style)}>{children}</View>
}
function View({ children, style, ...rest }) {
  return <div {...rest} style={cx({display: 'flex', flexDirection:'column'}, style)}>{children}</div>
}
function Row({ children, style, ...rest }) {
  return <div {...rest} style={cx({display: 'flex', flexDirection:'row'}, style)}>{children}</div>
}

export default App;
